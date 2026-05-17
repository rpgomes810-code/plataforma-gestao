import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const mes = searchParams.get('mes')
  const ano = searchParams.get('ano')

  const inicio = `${ano}-${mes?.padStart(2, '0')}-01`
  const fim = `${ano}-${mes?.padStart(2, '0')}-31`

  const { data, error } = await supabaseAdmin
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

  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll() { return cookieStore.getAll() }, setAll() {} } }
  )
  const { data: { user } } = await supabase.auth.getUser()
  const { data: membroLogado } = await supabaseAdmin.from('membros').select('nome').eq('user_id', user?.id).single()

  const { data, error } = await supabaseAdmin.from('escalas').insert([body]).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  await supabaseAdmin.from('logs').insert([{
    usuario_nome: membroLogado?.nome || 'Desconhecido',
    acao: `Criou escala: ${body.grupo} — ${body.data}`,
    tabela: 'escalas',
    registro_id: data?.id,
    dados_antes: null,
    dados_depois: body,
  }])

  return NextResponse.json({ success: true })
}