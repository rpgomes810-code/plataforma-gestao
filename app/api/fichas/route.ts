import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import webpush from 'web-push'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET() {
  const { data: membros, error } = await supabase
    .from('membros')
    .select('id, nome, grupo, cadastro_completo, data_inscricao_darpe, acesso_bloqueado')
    .eq('status', 'Ativo')
    .order('nome', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const { data: assinaturas } = await supabase
    .from('push_subscriptions')
    .select('membro_id')

  const idsComNotificacao = new Set((assinaturas || []).map((a: any) => a.membro_id))

  const hoje = new Date()

  const resultado = (membros || []).map(m => {
    const temNotificacao = idsComNotificacao.has(m.id)

    if (m.cadastro_completo) return { ...m, situacao: 'completo', diasRestantes: null, temNotificacao }
    if (!m.data_inscricao_darpe) return { ...m, situacao: 'vencido', diasRestantes: 0, temNotificacao }

    const dataInscricao = new Date(m.data_inscricao_darpe)
    const prazo = new Date(dataInscricao)
    prazo.setDate(prazo.getDate() + 15)
    const diff = Math.ceil((prazo.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24))

    if (diff > 0) return { ...m, situacao: 'no_prazo', diasRestantes: diff, temNotificacao }
    return { ...m, situacao: 'vencido', diasRestantes: diff, temNotificacao }
  })

  return NextResponse.json(resultado)
}

export async function POST(req: Request) {
  const { acao, membro_id } = await req.json()

  if (acao === 'bloquear') {
    const { error } = await supabase.from('membros').update({ acesso_bloqueado: true }).eq('id', membro_id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ ok: true })
  }

  if (acao === 'desbloquear') {
    const { error } = await supabase.from('membros').update({ acesso_bloqueado: false }).eq('id', membro_id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ ok: true })
  }

  if (acao === 'notificar') {
    const { data: assinatura, error: errAssinatura } = await supabase
      .from('push_subscriptions').select('subscription').eq('membro_id', membro_id).single()

    if (errAssinatura || !assinatura) {
      return NextResponse.json({ error: 'Membro sem notificação ativa' }, { status: 400 })
    }

    try {
      webpush.setVapidDetails(
        process.env.VAPID_SUBJECT!,
        process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
        process.env.VAPID_PRIVATE_KEY!
      )

      await webpush.sendNotification(
        assinatura.subscription,
        JSON.stringify({
          title: 'DARPE — Cadastro vencido!',
body: 'Seu prazo para completar o cadastro expirou. Acesse o app e complete agora para não perder o acesso.',
        })
      )
      return NextResponse.json({ ok: true })
    } catch (e: any) {
      console.error('Erro webpush:', e?.message, e?.statusCode, e?.body)
      return NextResponse.json({ error: e?.message || 'Erro ao enviar notificação' }, { status: 500 })
    }
  }

  return NextResponse.json({ error: 'Ação inválida' }, { status: 400 })
}