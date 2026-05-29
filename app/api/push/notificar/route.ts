import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import webpush from 'web-push'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}))
  const { escala_id } = body

  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT!,
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!
  )

  let assinaturas: any[] = []

  if (escala_id) {
    const { data: escala } = await supabase
      .from('escalas')
      .select('*')
      .eq('id', escala_id)
      .single()

    if (!escala) return NextResponse.json({ ok: false, erro: 'Escala não encontrada' })

    const { data: membrosGrupo } = await supabase
      .from('membros')
      .select('id, nome')
      .eq('grupo', escala.grupo)
      .eq('status', 'Ativo')

    const { data: membrosAtendente } = await supabase
      .from('membros')
      .select('id, nome')
      .eq('nome', escala.atendentes)
      .eq('status', 'Ativo')

    const todosIds = [
      ...(membrosGrupo || []).map((m: any) => m.id),
      ...(membrosAtendente || []).map((m: any) => m.id),
    ]
    const idsUnicos = [...new Set(todosIds)]

    if (idsUnicos.length === 0) return NextResponse.json({ ok: true, enviados: 0 })

    const { data: subs } = await supabase
      .from('push_subscriptions')
      .select('*')
      .in('membro_id', idsUnicos)

    assinaturas = subs || []

    const dataFormatada = new Date(escala.data + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })

    let enviados = 0
    for (const item of assinaturas) {
      const payload = JSON.stringify({
        title: '📅 Escala liberada!',
        body: `${escala.grupo} — ${escala.local_texto} em ${dataFormatada} às ${escala.hora_inicio}. Confirme sua presença!`,
        url: '/dashboard/confirmacoes',
      })
      try {
        await webpush.sendNotification(item.subscription, payload)
        enviados++
      } catch (e) {
        await supabase.from('push_subscriptions').delete().eq('id', item.id)
      }
    }

    return NextResponse.json({ ok: true, enviados })
  }

  const { data: todasAssinaturas } = await supabase.from('push_subscriptions').select('*')
  assinaturas = todasAssinaturas || []

  const payload = JSON.stringify({
    title: 'DARPE — Confirmação aberta!',
    body: 'O admin abriu as confirmações. Acesse para confirmar sua presença.',
    url: '/dashboard/confirmacoes',
  })

  let enviados = 0
  for (const item of assinaturas) {
    try {
      await webpush.sendNotification(item.subscription, payload)
      enviados++
    } catch (e) {
      await supabase.from('push_subscriptions').delete().eq('id', item.id)
    }
  }

  return NextResponse.json({ ok: true, enviados })
}