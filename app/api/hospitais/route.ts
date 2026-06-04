import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const CAMPOS_MAIUSCULO = ['nome', 'cidade', 'endereco', 'contato', 'observacoes']

function maiuscular(obj: any) {
  const resultado = { ...obj }
  for (const campo of CAMPOS_MAIUSCULO) {
    if (resultado[campo] && typeof resultado[campo] === 'string') {
      resultado[campo] = resultado[campo].toUpperCase()
    }
  }
  return resultado
}

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from('hospitais')
    .select('id, nome')
    .order('nome', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const dados = maiuscular(body)

    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { getAll() { return cookieStore.getAll() }, setAll() {} } }
    )
    const { data: { user } } = await supabase.auth.getUser()
    const { data: membroLogado } = await supabaseAdmin.from('membros').select('nome').eq('user_id', user?.id).single()

    const { data, error } = await supabaseAdmin.from('hospitais').insert([dados]).select().single()
    if (error) throw error

    await supabaseAdmin.from('logs').insert([{
      usuario_nome: membroLogado?.nome || 'Desconhecido',
      acao: `Criou hospital: ${dados.nome}`,
      tabela: 'hospitais',
      registro_id: data?.id,
      dados_antes: null,
      dados_depois: dados,
    }])

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erro ao salvar hospital:', error)
    return NextResponse.json({ error: 'Erro ao salvar hospital' }, { status: 500 })
  }
}