import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
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

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const { data, error } = await supabaseAdmin
    .from('hospitais')
    .select('*')
    .eq('id', id)
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 404 })
  return NextResponse.json(data)
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  const dados = maiuscular(body)

  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll() { return cookieStore.getAll() }, setAll() {} } }
  )
  const { data: { user } } = await supabase.auth.getUser()
  const { data: membroLogado } = await supabaseAdmin.from('membros').select('nome').eq('user_id', user?.id).single()

  const { data: dadosAntes } = await supabaseAdmin.from('hospitais').select('*').eq('id', id).single()

  const { error } = await supabaseAdmin.from('hospitais').update(dados).eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  await supabaseAdmin.from('logs').insert([{
    usuario_nome: membroLogado?.nome || 'Desconhecido',
    acao: `Editou hospital: ${dadosAntes?.nome || id}`,
    tabela: 'hospitais',
    registro_id: id,
    dados_antes: dadosAntes,
    dados_depois: dados,
  }])

  return NextResponse.json({ ok: true })
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll() { return cookieStore.getAll() }, setAll() {} } }
  )
  const { data: { user } } = await supabase.auth.getUser()
  const { data: membroLogado } = await supabaseAdmin.from('membros').select('nome').eq('user_id', user?.id).single()

  const { data: dadosAntes } = await supabaseAdmin.from('hospitais').select('*').eq('id', id).single()

  const { error } = await supabaseAdmin.from('hospitais').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  await supabaseAdmin.from('logs').insert([{
    usuario_nome: membroLogado?.nome || 'Desconhecido',
    acao: `Excluiu hospital: ${dadosAntes?.nome || id}`,
    tabela: 'hospitais',
    registro_id: id,
    dados_antes: dadosAntes,
    dados_depois: { excluido: true },
  }])

  return NextResponse.json({ ok: true })
}