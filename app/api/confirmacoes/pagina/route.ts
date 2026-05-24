export const dynamic = 'force-dynamic'

import { createClient } from '@supabase/supabase-js'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET() {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll() { return cookieStore.getAll() }, setAll() {} } }
  )

  const { data: { user } } = await supabase.auth.getUser()

  const { data: membroLogado } = await supabaseAdmin
  .from('membros')
  .select('id, nome, grupo, instrumento, tipo, nivel_acesso, cadastro_completo, data_inscricao_darpe')
  .eq('user_id', user?.id)
  .single()

  const { data: escalas } = await supabaseAdmin
    .from('escalas')
    .select('*')
    .eq('confirmacao_aberta', true)
    .order('data', { ascending: true })

  const escalasIds = escalas?.map((e: any) => e.id) || []

  let confirmacoes: any[] = []
  if (escalasIds.length > 0) {
    const { data, error } = await supabaseAdmin
      .from('confirmacoes')
      .select('*')
      .in('escala_id', escalasIds)
    if (!error && data) confirmacoes = data
  }

  const { data: todosMembros } = await supabaseAdmin
    .from('membros')
    .select('id, nome, grupo, instrumento, tipo, status, telefone')
    .eq('status', 'Ativo')

  return NextResponse.json({ membroLogado, escalas, confirmacoes, todosMembros })
}