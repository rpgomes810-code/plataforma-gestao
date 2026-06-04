export const dynamic = 'force-dynamic'

import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
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
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll() {},
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  const { data: membro } = await supabaseAdmin
    .from('membros')
    .select('id, nivel_acesso, nome, tipo, grupo, perfil, acesso_bloqueado, cadastro_completo')
    .eq('user_id', user?.id)
    .single()

  // Busca permissões do perfil
  let permissoes = null
  if (membro?.perfil) {
    const { data } = await supabaseAdmin
      .from('permissoes')
      .select('paginas')
      .eq('perfil', membro.perfil)
      .single()
    permissoes = data?.paginas || null
  }

  return NextResponse.json({ ...membro, permissoes })
}