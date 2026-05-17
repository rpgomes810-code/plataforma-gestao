import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET() {
  const { data, error } = await supabase
    .from('confirmacoes')
    .select('*, membros!confirmacoes_membro_id_fkey(nome, instrumento, tipo), escalas(data, grupo, local_texto, hora_inicio)')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: Request) {
  const body = await req.json()
  const { escala_id, membro_id, status, motivo, tipo } = body

  // Verifica se já existe confirmação
  const { data: existente } = await supabase
    .from('confirmacoes')
    .select('id')
    .eq('escala_id', escala_id)
    .eq('membro_id', membro_id)
    .single()

  if (existente) {
    // Atualiza o registro existente
    const { error } = await supabase
      .from('confirmacoes')
      .update({ status, motivo: motivo || null, tipo: tipo || 'normal' })
      .eq('id', existente.id)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  } else {
    // Insere novo registro
    const { error } = await supabase
      .from('confirmacoes')
      .insert([{ escala_id, membro_id, status, motivo: motivo || null, tipo: tipo || 'normal' }])

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
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