import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const mes = searchParams.get('mes')
  const ano = searchParams.get('ano')

  let query = supabase
    .from('registros')
    .select('*, hospitais(nome)')
    .order('data', { ascending: false })

  if (mes && ano) {
    const mesNum = parseInt(mes).toString().padStart(2, '0')
    const inicio = `${ano}-${mesNum}-01`
    const fim = `${ano}-${mesNum}-31`
    query = query.gte('data', inicio).lte('data', fim)
  }

  const { data, error } = await query

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: Request) {
  const body = await req.json()
  const { escala_id, ...resto } = body

  const { error } = await supabase
    .from('registros')
    .insert([body])

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Marca a escala como registrada
  if (escala_id) {
    await supabase
      .from('escalas')
      .update({ registrada: true })
      .eq('id', escala_id)
  }

  return NextResponse.json({ ok: true })
}