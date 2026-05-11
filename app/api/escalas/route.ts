import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const mes = searchParams.get('mes')
  const ano = searchParams.get('ano')

  const inicio = `${ano}-${mes?.padStart(2, '0')}-01`
  const fim = `${ano}-${mes?.padStart(2, '0')}-31`

  const { data, error } = await supabase
    .from('escalas')
    .select('*')
    .gte('data', inicio)
    .lte('data', fim)
    .order('data', { ascending: true })
    .order('hora_inicio', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(request: NextRequest) {
  const body = await request.json()

  const { error } = await supabase
    .from('escalas')
    .insert([body])

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}