export const dynamic = 'force-dynamic'

import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET() {
  // Usa horário de Brasília
  const agora = new Date(new Date().toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' }))
  const dia = agora.getDate().toString().padStart(2, '0')
  const mes = (agora.getMonth() + 1).toString().padStart(2, '0')

  const { data: membros } = await supabase
    .from('membros')
    .select('id, nome, grupo, data_nascimento')
    .eq('status', 'Ativo')
    .not('data_nascimento', 'is', null)

  const aniversariantes = (membros || []).filter((m: any) => {
    if (!m.data_nascimento) return false
    const partes = m.data_nascimento.split('-')
    return partes[1] === mes && partes[2] === dia
  })

  return NextResponse.json(aniversariantes)
}