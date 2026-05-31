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

export async function GET() {
  const { data, error } = await supabaseAdmin.from('grupos').select('*').order('nome', { ascending: true })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: Request) {
  const { nome } = await req.json()
  const usuarioNome = await getUsuarioLogado()

  const { data, error } = await supabaseAdmin.from('grupos').insert([{ nome }]).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  await supabaseAdmin.from('logs').insert([{
    usuario_nome: usuarioNome,
    acao: `Criou grupo: ${nome}`,
    tabela: 'grupos',
    registro_id: data?.id,
    dados_antes: null,
    dados_depois: { nome },
  }])

  return NextResponse.json({ ok: true })
}

export async function DELETE(req: Request) {
  const { id } = await req.json()
  const usuarioNome = await getUsuarioLogado()

  const { data: dadosAntes } = await supabaseAdmin.from('grupos').select('*').eq('id', id).single()

  const { error } = await supabaseAdmin.from('grupos').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  await supabaseAdmin.from('logs').insert([{
    usuario_nome: usuarioNome,
    acao: `Excluiu grupo: ${dadosAntes?.nome || id}`,
    tabela: 'grupos',
    registro_id: id,
    dados_antes: dadosAntes,
    dados_depois: { excluido: true },
  }])

  return NextResponse.json({ ok: true })
}