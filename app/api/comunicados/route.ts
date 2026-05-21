import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import webpush from 'web-push'

export const dynamic = 'force-dynamic'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

webpush.setVapidDetails(
  process.env.VAPID_SUBJECT!,
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
)

async function getUsuarioLogado() {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { getAll() { return cookieStore.getAll() }, setAll() {} } }
    )
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return 'Desconhecido'
    const { data } = await supabaseAdmin.from('membros').select('nome').eq('user_id', user.id).single()
    return data?.nome || 'Desconhecido'
  } catch { return 'Desconhecido' }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const busca = searchParams.get('busca') || ''

  let query = supabaseAdmin
    .from('comunicados')
    .select('*, comunicados_leituras(membro_id)')
    .order('criado_em', { ascending: false })

  if (busca) {
    query = query.or(`titulo.ilike.%${busca}%,conteudo.ilike.%${busca}%`)
  }

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { titulo, conteudo, perfis_destino } = body
  const criado_por = await getUsuarioLogado()

  const { data, error } = await supabaseAdmin
    .from('comunicados')
    .insert([{ titulo, conteudo, perfis_destino, criado_por }])
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Busca membros dos perfis selecionados e envia notificação
  const { data: membros } = await supabaseAdmin
    .from('membros')
    .select('id')
    .in('perfil', perfis_destino)
    .eq('status', 'Ativo')

  if (membros && membros.length > 0) {
    const ids = membros.map((m: any) => m.id)
    const { data: assinaturas } = await supabaseAdmin
      .from('push_subscriptions')
      .select('subscription')
      .in('membro_id', ids)

    const payload = JSON.stringify({
      title: `📢 Novo comunicado: ${titulo}`,
      body: conteudo.substring(0, 100) + (conteudo.length > 100 ? '...' : ''),
      url: '/dashboard/comunicados'
    })

    for (const item of assinaturas || []) {
      try {
        await webpush.sendNotification(item.subscription, payload)
      } catch (e) {}
    }
  }

  return NextResponse.json({ ok: true, id: data.id })
}

export async function DELETE(req: NextRequest) {
  const { id } = await req.json()
  const { error } = await supabaseAdmin.from('comunicados').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}