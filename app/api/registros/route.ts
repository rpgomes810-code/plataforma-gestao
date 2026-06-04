import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const CAMPOS_MAIUSCULO = ['quem_autorizou', 'observacoes', 'membros_presentes', 'criado_por']

function maiuscular(obj: any) {
  const resultado = { ...obj }
  for (const campo of CAMPOS_MAIUSCULO) {
    if (resultado[campo] && typeof resultado[campo] === 'string') {
      resultado[campo] = resultado[campo].toUpperCase()
    }
  }
  return resultado
}

async function getUsuarioLogado() {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { getAll() { return cookieStore.getAll() }, setAll() {} } }
    )
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return 'Desconhecido'
    const { data } = await supabaseAdmin.from('membros').select('nome').eq('user_id', user.id).single()
    return data?.nome || 'Desconhecido'
  } catch { return 'Desconhecido' }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const mes = searchParams.get('mes')
  const ano = searchParams.get('ano')

  let query = supabaseAdmin.from('registros').select('*, hospitais(nome)').order('data', { ascending: false })

  if (mes && ano) {
    const mesNum = parseInt(mes).toString().padStart(2, '0')
    const inicio = `${ano}-${mesNum}-01`
    const fim = new Date(Number(ano), Number(mes), 0).toISOString().split('T')[0]
    query = query.gte('data', inicio).lte('data', fim)
  }

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: Request) {
  const body = await req.json()
  const { escala_id } = body
  const usuarioNome = await getUsuarioLogado()
  const dados = maiuscular(body)

  const { data, error } = await supabaseAdmin.from('registros').insert([dados]).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  await supabaseAdmin.from('logs').insert([{
    usuario_nome: usuarioNome,
    acao: `Registrou atendimento: ${dados.data || ''}`,
    tabela: 'registros',
    registro_id: data?.id,
    dados_antes: null,
    dados_depois: dados,
  }])

  if (escala_id) {
    await supabaseAdmin.from('escalas').update({ registrada: true }).eq('id', escala_id)
  }

  return NextResponse.json({ ok: true })
}