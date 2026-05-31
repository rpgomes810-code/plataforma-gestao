import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import webpush from 'web-push'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function notificarVagaAberta(escala_id: string, membroAusenteId: string) {
  try {
    // Busca dados da escala e do membro ausente
    const { data: escala } = await supabase
      .from('escalas')
      .select('grupo, local_texto, data, hora_inicio')
      .eq('id', escala_id)
      .single()

    const { data: membroAusente } = await supabase
      .from('membros')
      .select('nome, instrumento, perfil')
      .eq('id', membroAusenteId)
      .single()

    if (!escala || !membroAusente) return

    // Busca todos os membros ativos exceto o ausente
    const { data: membros } = await supabase
      .from('membros')
      .select('id')
      .eq('status', 'Ativo')
      .neq('id', membroAusenteId)

    if (!membros || membros.length === 0) return

    const ids = membros.map((m: any) => m.id)

    const { data: assinaturas } = await supabase
      .from('push_subscriptions')
      .select('subscription')
      .in('membro_id', ids)

    if (!assinaturas || assinaturas.length === 0) return

    webpush.setVapidDetails(
      process.env.VAPID_SUBJECT!,
      process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
      process.env.VAPID_PRIVATE_KEY!
    )

    const dataFormatada = new Date(escala.data + 'T12:00:00').toLocaleDateString('pt-BR', {
      weekday: 'long', day: '2-digit', month: '2-digit'
    })

    const tipoVaga = membroAusente.instrumento && membroAusente.instrumento !== 'Nenhum'
      ? membroAusente.instrumento
      : membroAusente.perfil || 'Membro'

    const payload = JSON.stringify({
      title: '🔔 Vaga disponível!',
      body: `${escala.grupo} — ${escala.local_texto} · ${dataFormatada} às ${escala.hora_inicio}. Vaga de ${tipoVaga}.`,
      url: '/dashboard/vagas',
    })

    for (const item of assinaturas) {
      try { await webpush.sendNotification(item.subscription, payload) } catch (e) {}
    }
  } catch (e) {}
}

export async function GET() {
  const { data, error } = await supabase
    .from('confirmacoes')
    .select('*, membros!confirmacoes_membro_id_fkey(nome, instrumento, tipo), escalas(data, grupo, local_texto, hora_inicio)')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: Request) {
  const body = await req.json()
  const { escala_id, membro_id, status, motivo, tipo, status_anterior } = body

  const { data: existente } = await supabase
    .from('confirmacoes')
    .select('id, status')
    .eq('escala_id', escala_id)
    .eq('membro_id', membro_id)
    .single()

  if (existente) {
    const { error } = await supabase
      .from('confirmacoes')
      .update({
        status,
        motivo: motivo || null,
        tipo: tipo || 'normal',
        ...(status_anterior !== undefined ? { status_anterior } : {})
      })
      .eq('id', existente.id)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  } else {
    const { error } = await supabase
      .from('confirmacoes')
      .insert([{ escala_id, membro_id, status, motivo: motivo || null, tipo: tipo || 'normal', status_anterior: status_anterior || null }])

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Dispara notificação se o membro marcou ausência
  if (status === 'ausente') {
    await notificarVagaAberta(escala_id, membro_id)
  }

  return NextResponse.json({ ok: true })
}

export async function DELETE(req: Request) {
  const { escala_id, membro_id } = await req.json()

  await supabase
    .from('confirmacoes')
    .update({ substituto_id: null })
    .eq('escala_id', escala_id)
    .eq('substituto_id', membro_id)

  const { error } = await supabase
    .from('confirmacoes')
    .delete()
    .eq('escala_id', escala_id)
    .eq('membro_id', membro_id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}