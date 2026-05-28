export const dynamic = 'force-dynamic'

import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST() {
  const hoje = new Date()
  const diasParaSabado = (6 - hoje.getDay() + 7) % 7 || 7
  const proximoSabado = new Date(hoje)
  proximoSabado.setDate(hoje.getDate() + diasParaSabado)
  const dataStr = proximoSabado.toISOString().split('T')[0]

  const { data: escalas } = await supabaseAdmin
    .from('escalas')
    .select('*')
    .eq('data', dataStr)
    .eq('confirmacao_aberta', true)

  if (!escalas || escalas.length === 0)
    return NextResponse.json({ error: 'Nenhuma escala liberada para o próximo sábado' }, { status: 400 })

  const gruposEscalados = [...new Set(escalas.map((e: any) => e.grupo))]

  const { data: membros } = await supabaseAdmin
    .from('membros')
    .select('id, nome, grupo')
    .in('grupo', gruposEscalados)
    .eq('status', 'Ativo')

  if (!membros || membros.length === 0)
    return NextResponse.json({ error: 'Nenhum membro encontrado nos grupos escalados' }, { status: 400 })

  const membrosIds = membros.map((m: any) => m.id)
  const { data: subscriptions } = await supabaseAdmin
    .from('push_subscriptions')
    .select('*')
    .in('membro_id', membrosIds)

  if (!subscriptions || subscriptions.length === 0)
    return NextResponse.json({ error: 'Nenhum dispositivo registrado para notificação' }, { status: 400 })

  const dataFormatada = proximoSabado.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })

  const webpush = await import('web-push')
  webpush.default.setVapidDetails(
    'mailto:darpe@darpe.com',
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!
  )

  let enviados = 0
  for (const sub of subscriptions) {
    const membro = membros.find((m: any) => m.id === sub.membro_id)
    if (!membro) continue

    const escalasDoGrupo = escalas.filter((e: any) => e.grupo === membro.grupo)
    if (escalasDoGrupo.length === 0) continue

    const locais = escalasDoGrupo.map((e: any) => `${e.local_texto} às ${e.hora_inicio}`).join(', ')

    const payload = JSON.stringify({
      title: '🔔 Lembrete de Escala',
      body: `Você está escalado para ${locais} no sábado ${dataFormatada}!`,
      url: '/dashboard/confirmacoes',
    })

    try {
      await webpush.default.sendNotification(JSON.parse(sub.subscription), payload)
      enviados++
    } catch (err) {
      console.error('Erro ao enviar notificação:', err)
    }
  }

  return NextResponse.json({ success: true, enviados, total: subscriptions.length })
}