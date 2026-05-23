export const dynamic = 'force-dynamic'

import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import ListaHospitais from './ListaHospitais'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export default async function Hospitais() {
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

  const podeCriar = permissoes?.hospitais?.criar === true
  const podeEditar = permissoes?.hospitais?.editar === true
  const podeExcluir = permissoes?.hospitais?.excluir === true

  const { data: hospitais } = await supabaseAdmin
    .from('hospitais')
    .select('*')
    .order('nome', { ascending: true })

  return (
    <ListaHospitais
      hospitais={hospitais || []}
      membroLogado={membroLogado}
      podeCriar={podeCriar}
      podeEditar={podeEditar}
      podeExcluir={podeExcluir}
    />
  )
}