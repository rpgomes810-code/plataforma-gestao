export const dynamic = 'force-dynamic'

import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET() {
  const hoje = new Date().toISOString().split('T')[0]

  const { data } = await supabase
    .from('comunicados')
    .select('id, titulo, conteudo, criado_por, criado_em, dashboard_expira_em')
    .eq('fixar_dashboard', true)
    .gte('dashboard_expira_em', hoje)
    .order('criado_em', { ascending: false })

  return NextResponse.json(data || [])
}