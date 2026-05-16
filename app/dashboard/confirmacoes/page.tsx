export const dynamic = 'force-dynamic'

import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import CardConfirmacao from './CardConfirmacao'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export default async function Confirmacoes() {
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
    .select('id, nome, grupo, instrumento, tipo, nivel_acesso')
    .eq('user_id', user?.id)
    .single()

  const isAdmin = membroLogado?.nivel_acesso === 'Administrador'

  const { data: escalas } = await supabaseAdmin
    .from('escalas')
    .select('*')
    .eq('confirmacao_aberta', true)
    .order('data', { ascending: true })

  const escalasIds = escalas?.map(e => e.id) || []
  const { data: confirmacoes } = escalasIds.length > 0 ? await supabaseAdmin
    .from('confirmacoes')
    .select('*, membros(nome, instrumento, tipo)')
    .in('escala_id', escalasIds) : { data: [] }

  const { data: todosMembros } = await supabaseAdmin
    .from('membros')
    .select('id, nome, grupo, instrumento, tipo, status')
    .eq('status', 'Ativo')

  return (
    <div className="p-4 md:p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Confirmações de Presença</h2>
          <p className="text-sm text-gray-500">{escalas?.length || 0} escala(s) aguardando confirmação</p>
        </div>
      </div>

      {!escalas || escalas.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl shadow">
          <p className="text-4xl mb-3">✅</p>
          <p className="text-gray-500">Nenhuma escala aguardando confirmação</p>
        </div>
      ) : (
        <div className="space-y-6">
          {escalas.map(escala => {
            const confirmacoesEscala = confirmacoes?.filter((c: any) => c.escala_id === escala.id) || []
            const membrosDoGrupo = todosMembros?.filter(m => m.grupo === escala.grupo) || []
            const totalGrupo = membrosDoGrupo.length

            return (
              <CardConfirmacao
                key={escala.id}
                escala={escala}
                confirmacoesIniciais={confirmacoesEscala}
                membroLogado={membroLogado}
                totalGrupo={totalGrupo}
                isAdmin={isAdmin}
              />
            )
          })}
        </div>
      )}
    </div>
  )
}