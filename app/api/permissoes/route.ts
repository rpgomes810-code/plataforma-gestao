import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export const dynamic = 'force-dynamic'

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from('permissoes')
    .select('*')
    .order('perfil', { ascending: true })

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
  const { data: membro } = await supabaseAdmin
    .from('membros')
    .select('id')
    .eq('user_id', user?.id)
    .single()

  // Verifica se tem acesso
  const { data: acesso } = await supabaseAdmin
    .from('permissoes_admin')
    .select('id')
    .eq('membro_id', membro?.id)
    .single()

  if (!acesso) return NextResponse.json({ error: 'Sem permissão' }, { status: 403 })

  const { perfil, paginas } = await req.json()

  const { error } = await supabaseAdmin
    .from('permissoes')
    .update({ paginas })
    .eq('perfil', perfil)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}