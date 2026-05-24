export const dynamic = 'force-dynamic'

import { createClient } from '@supabase/supabase-js'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const mes = searchParams.get('mes')
  const ano = searchParams.get('ano')

  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll() { return cookieStore.getAll() }, setAll() {} } }
  )

  const { data: { user } } = await supabase.auth.getUser()
  const { data: membroLogado } = await supabaseAdmin
    .from('membros')
    .select('id, nome, grupo, nivel_acesso')
    .eq('user_id', user?.id)
    .single()

  const isAdmin = membroLogado?.nivel_acesso === 'Administrador'

  const inicio = `${ano}-${String(mes).padStart(2, '0')}-01`
  const fim = new Date(Number(ano), Number(mes), 0).toISOString().split('T')[0]
  const ontem = new Date()
  ontem.setDate(ontem.getDate() - 1)
  ontem.setHours(0, 0, 0, 0)
  const ontemStr = ontem.toISOString().split('T')[0]

  const { data: escalas } = await supabaseAdmin
    .from('escalas')
    .select('*')
    .gte('data', inicio)
    .lte('data', fim < ontemStr ? fim : ontemStr)
    .order('data', { ascending: false })

  if (!escalas || escalas.length === 0) return NextResponse.json([])

  const escalasIds = escalas.map(e => e.id)

  const { data: confirmacoes } = await supabaseAdmin
    .from('confirmacoes')
    .select('*, membros(nome, grupo, instrumento, perfil)')
    .in('escala_id', escalasIds)

  const { data: todosMembros } = await supabaseAdmin
    .from('membros')
    .select('id, nome, grupo, instrumento, perfil, status')
    .eq('status', 'Ativo')

  const resultado = escalas
    .filter(e => {
      if (isAdmin) return true
      return e.grupo === membroLogado?.grupo
    })
    .map(e => ({
      ...e,
      confirmacoes: (confirmacoes || []).filter(c => c.escala_id === e.id),
      membrosDoGrupo: (todosMembros || []).filter(m => m.grupo === e.grupo),
    }))

  return NextResponse.json(resultado)
}