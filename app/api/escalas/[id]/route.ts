import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
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

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { data, error } = await supabaseAdmin.from('escalas').select('*').eq('id', id).single()
  if (error) return NextResponse.json({ error: error.message }, { status: 404 })
  return NextResponse.json(data)
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  const usuarioNome = await getUsuarioLogado()

  const { data: dadosAntes } = await supabaseAdmin.from('escalas').select('*').eq('id', id).single()
  const { error } = await supabaseAdmin.from('escalas').update(body).eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  await supabaseAdmin.from('logs').insert([{
    usuario_nome: usuarioNome,
    acao: `Editou escala: ${dadosAntes?.grupo} — ${dadosAntes?.data}`,
    tabela: 'escalas',
    registro_id: String(id),
    dados_antes: dadosAntes,
    dados_depois: body,
  }])

  if (body.atendentes && body.atendentes !== dadosAntes?.atendentes) {
    const { data: hospital } = await supabaseAdmin
      .from('hospitais').select('nome').eq('id', dadosAntes?.hospital_id).single()
    await notificarAtendente(body.atendentes, dadosAntes?.grupo, dadosAntes?.data, hospital?.nome || '')
  }

  return NextResponse.json({ ok: true })
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const usuarioNome = await getUsuarioLogado()

  const { data: dadosAntes } = await supabaseAdmin.from('escalas').select('*').eq('id', id).single()
  const { error } = await supabaseAdmin.from('escalas').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  await supabaseAdmin.from('logs').insert([{
    usuario_nome: usuarioNome,
    acao: `Excluiu escala: ${dadosAntes?.grupo} — ${dadosAntes?.data}`,
    tabela: 'escalas',
    registro_id: String(id),
    dados_antes: dadosAntes,
    dados_depois: { excluido: true },
  }])

  return NextResponse.json({ ok: true })
}