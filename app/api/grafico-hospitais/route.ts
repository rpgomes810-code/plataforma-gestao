import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const mesParam = searchParams.get('mes')
  const anoParam = searchParams.get('ano')

  const hoje = new Date()
  const mes = mesParam ? parseInt(mesParam) - 1 : hoje.getMonth()
  const ano = anoParam ? parseInt(anoParam) : hoje.getFullYear()

  const inicio = `${ano}-${String(mes + 1).padStart(2, '0')}-01`
  const fim = new Date(ano, mes + 1, 0).toISOString().split('T')[0]

  const { data, error } = await supabase
    .from('registros')
    .select('id, data, quantidade_participantes, hospitais(nome)')
    .gte('data', inicio)
    .lte('data', fim)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data || [])
}