export const dynamic = 'force-dynamic'

import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import webpush from 'web-push'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
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
  let query = supabaseAdmin.from('comunicados').select('*, comunicados_leituras(membro_id)').order('criado_em', { ascending: false })
  if (busca) query = query.or(`titulo.ilike.%${busca}%,conteudo.ilike.%${busca}%`)
  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { titulo, conteudo, perfis_destino, fixar_dashboard, dashboard_expira_em } = body
    const criado_por = await getUsuarioLogado()

    const insertData = {
      titulo, conteudo,
      perfis_destino: perfis_destino || [],
      criado_por,
      fixar_dashboard: fixar_dashboard === true,
      dashboard_expira_em: dashboard_expira_em || null
    }

    const { data, error } = await supabaseAdmin.from('comunicados').insert([insertData]).select().single()
    if (error) return NextResponse.json({ error: error.message, insertData }, { status: 500 })

    const tipo = fixar_dashboard ? 'aviso' : 'comunicado'
    await supabaseAdmin.from('logs').insert([{
      usuario_nome: criado_por,
      acao: `Criou ${tipo}: ${titulo}`,
      tabela: 'comunicados',
      registro_id: data?.id,
      dados_antes: null,
      dados_depois: insertData,
    }])

    if (!fixar_dashboard) {
      const { data: membros } = await supabaseAdmin.from('membros').select('id').in('perfil', perfis_destino || []).eq('status', 'Ativo')
      if (membros && membros.length > 0) {
        const ids = membros.map((m: any) => m.id)
        const { data: assinaturas } = await supabaseAdmin.from('push_subscriptions').select('subscription').in('membro_id', ids)
        webpush.setVapidDetails(process.env.VAPID_SUBJECT!, process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!, process.env.VAPID_PRIVATE_KEY!)
        const payload = JSON.stringify({ title: `📢 Novo comunicado: ${titulo}`, body: conteudo.substring(0, 100) + (conteudo.length > 100 ? '...' : ''), url: '/dashboard/comunicados' })
        for (const item of assinaturas || []) {
          try { await webpush.sendNotification(item.subscription, payload) } catch (e) {}
        }
      }
    }

    return NextResponse.json({ ok: true, id: data.id })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  const body = await req.json()
  const { id, titulo, conteudo, perfis_destino, fixar_dashboard, dashboard_expira_em } = body
  const usuarioNome = await getUsuarioLogado()

  const { data: dadosAntes } = await supabaseAdmin.from('comunicados').select('*').eq('id', id).single()

  const { error } = await supabaseAdmin.from('comunicados').update({ titulo, conteudo, perfis_destino, fixar_dashboard: fixar_dashboard || false, dashboard_expira_em: dashboard_expira_em || null }).eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const tipo = fixar_dashboard ? 'aviso' : 'comunicado'
  await supabaseAdmin.from('logs').insert([{
    usuario_nome: usuarioNome,
    acao: `Editou ${tipo}: ${titulo}`,
    tabela: 'comunicados',
    registro_id: id,
    dados_antes: dadosAntes,
    dados_depois: { titulo, conteudo, perfis_destino, fixar_dashboard, dashboard_expira_em },
  }])

  return NextResponse.json({ ok: true })
}

export async function DELETE(req: NextRequest) {
  const { id } = await req.json()
  const usuarioNome = await getUsuarioLogado()

  const { data: dadosAntes } = await supabaseAdmin.from('comunicados').select('*').eq('id', id).single()

  const { error } = await supabaseAdmin.from('comunicados').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const tipo = dadosAntes?.fixar_dashboard ? 'aviso' : 'comunicado'
  await supabaseAdmin.from('logs').insert([{
    usuario_nome: usuarioNome,
    acao: `Excluiu ${tipo}: ${dadosAntes?.titulo || id}`,
    tabela: 'comunicados',
    registro_id: id,
    dados_antes: dadosAntes,
    dados_depois: { excluido: true },
  }])

  return NextResponse.json({ ok: true })
}