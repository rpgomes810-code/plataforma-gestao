export const dynamic = 'force-dynamic'

import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET() {
  const hoje = new Date()
  const dia = hoje.getDate().toString().padStart(2, '0')
  const mes = (hoje.getMonth() + 1).toString().padStart(2, '0')

  const { data: membros } = await supabase
    .from('membros')
    .select('id, nome, grupo, data_nascimento')
    .eq('status', 'Ativo')
    .not('data_nascimento', 'is', null)

  const aniversariantes = (membros || []).filter((m: any) => {
    if (!m.data_nascimento) return false
    const partes = m.data_nascimento.split('-')
    const mesMembro = partes[1]
    const diaMembro = partes[2]
    return diaMembro === dia && mesMembro === mes
  })

  return NextResponse.json(aniversariantes)
}