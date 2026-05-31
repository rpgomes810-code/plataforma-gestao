import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

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

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { data, error } = await supabaseAdmin.from('registros').select('*').eq('id', id).single()
  if (error) return NextResponse.json({ error: error.message }, { status: 404 })
  return NextResponse.json(data)
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  const usuarioNome = await getUsuarioLogado()

  const { data: dadosAntes } = await supabaseAdmin.from('registros').select('*, hospitais(nome)').eq('id', id).single()

  const { error } = await supabaseAdmin.from('registros').update(body).eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  await supabaseAdmin.from('logs').insert([{
    usuario_nome: usuarioNome,
    acao: `Editou registro: ${dadosAntes?.hospitais?.nome || id}`,
    tabela: 'registros',
    registro_id: id,
    dados_antes: dadosAntes,
    dados_depois: body,
  }])

  return NextResponse.json({ ok: true })
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const usuarioNome = await getUsuarioLogado()

  const { data: dadosAntes } = await supabaseAdmin.from('registros').select('*, hospitais(nome)').eq('id', id).single()

  const { error } = await supabaseAdmin.from('registros').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  await supabaseAdmin.from('logs').insert([{
    usuario_nome: usuarioNome,
    acao: `Excluiu registro: ${dadosAntes?.hospitais?.nome || id}`,
    tabela: 'registros',
    registro_id: id,
    dados_antes: dadosAntes,
    dados_depois: { excluido: true },
  }])

  return NextResponse.json({ ok: true })
}