import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'

export const dynamic = 'force-dynamic'

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
    if (!user) return { nome: 'Desconhecido', id: null }
    const { data } = await supabaseAdmin.from('membros').select('id, nome').eq('user_id', user.id).single()
    return { nome: data?.nome || 'Desconhecido', id: data?.id || null }
  } catch { return { nome: 'Desconhecido', id: null } }
}

export async function GET() {
  const { data, error } = await supabaseAdmin.from('permissoes').select('*').order('perfil', { ascending: true })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: Request) {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll() { return cookieStore.getAll() }, setAll() {} } }
  )

  const { data: { user } } = await supabase.auth.getUser()
  const { data: membro } = await supabaseAdmin.from('membros').select('id, nome').eq('user_id', user?.id).single()

  const { data: acesso } = await supabaseAdmin.from('permissoes_admin').select('id').eq('membro_id', membro?.id).single()
  if (!acesso) return NextResponse.json({ error: 'Sem permissão' }, { status: 403 })

  const { perfil, paginas } = await req.json()

  const { data: dadosAntes } = await supabaseAdmin.from('permissoes').select('*').eq('perfil', perfil).single()

  const { error } = await supabaseAdmin.from('permissoes').update({ paginas }).eq('perfil', perfil)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  await supabaseAdmin.from('logs').insert([{
    usuario_nome: membro?.nome || 'Desconhecido',
    acao: `Alterou permissões do perfil: ${perfil}`,
    tabela: 'permissoes',
    registro_id: perfil,
    dados_antes: dadosAntes?.paginas,
    dados_depois: paginas,
  }])

  return NextResponse.json({ ok: true })
}