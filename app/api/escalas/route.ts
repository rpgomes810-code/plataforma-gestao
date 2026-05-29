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
  } catch {
    return 'Desconhecido'
  }
}

async function notificarAtendente(nomeAtendente: string, grupo: string, data: string, hospital: string) {
  try {
    const { data: membro } = await supabaseAdmin
      .from('membros').select('id').eq('nome', nomeAtendente).single()

    if (!membro) return

    const { data: assinatura } = await supabaseAdmin
      .from('push_subscriptions').select('subscription').eq('membro_id', membro.id).single()

    if (!assinatura) return

    webpush.setVapidDetails(
      process.env.VAPID_SUBJECT!,
      process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
      process.env.VAPID_PRIVATE_KEY!
    )

    await webpush.sendNotification(
      assinatura.subscription,
      JSON.stringify({
        title: 'DARPE — Você foi escalado!',
        body: `${grupo} — ${hospital} em ${new Date(data + 'T12:00:00').toLocaleDateString('pt-BR')}`
      })
    )
  } catch (e) {
    console.error('Erro ao notificar atendente:', e)
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const mes = searchParams.get('mes')
  const ano = searchParams.get('ano')

  const inicio = `${ano}-${mes?.padStart(2, '0')}-01`
  const fim = `${ano}-${mes?.padStart(2, '0')}-31`

  const { data, error } = await supabaseAdmin
    .from('escalas').select('*')
    .gte('data', inicio).lte('data', fim)
    .order('data', { ascending: true })
    .order('hora_inicio', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const usuarioNome = await getUsuarioLogado()

  const { data, error } = await supabaseAdmin.from('escalas').insert([body]).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  await supabaseAdmin.from('logs').insert([{
    usuario_nome: usuarioNome,
    acao: `Criou escala: ${body.grupo} — ${body.data}`,
    tabela: 'escalas',
    registro_id: String(data?.id || ''),
    dados_antes: null,
    dados_depois: body,
  }])

  if (body.atendentes && body.hospital_id) {
    const { data: hospital } = await supabaseAdmin
      .from('hospitais').select('nome').eq('id', body.hospital_id).single()
    await notificarAtendente(body.atendentes, body.grupo, body.data, hospital?.nome || '')
  }

  return NextResponse.json({ success: true })
}