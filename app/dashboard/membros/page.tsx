export const dynamic = 'force-dynamic'

import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import ListaMembros from './ListaMembros'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export default async function Membros() {
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

  const { data: membroLogado } = await supabaseAdmin
    .from('membros')
    .select('id, nome, perfil')
    .eq('user_id', user?.id)
    .single()

  let permissoes: any = {}
  if (membroLogado?.perfil) {
    const { data } = await supabaseAdmin
      .from('permissoes')
      .select('paginas')
      .eq('perfil', membroLogado.perfil)
      .single()
    permissoes = data?.paginas || {}
  }

  const podeEditar = permissoes?.membros?.editar === true
  const podeExcluir = permissoes?.membros?.excluir === true

  const { data: membros } = await supabaseAdmin
    .from('membros')
    .select('*')
    .order('nome', { ascending: true })

  return (
    <ListaMembros
      membros={membros || []}
      membroLogado={membroLogado}
      podeEditar={podeEditar}
      podeExcluir={podeExcluir}
    />
  )
}