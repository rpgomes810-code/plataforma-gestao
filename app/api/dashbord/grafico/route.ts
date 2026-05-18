import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET() {
  const hoje = new Date()
  const inicio = new Date(hoje.getFullYear(), hoje.getMonth() - 5, 1).toISOString().split('T')[0]
  const fim = hoje.toISOString().split('T')[0]

  const { data } = await supabase
    .from('registros')
    .select('*, hospitais(nome)')
    .gte('data', inicio)
    .lte('data', fim)
    .order('data', { ascending: true })

  return NextResponse.json(data || [])
}