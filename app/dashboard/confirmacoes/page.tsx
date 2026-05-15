export const dynamic = 'force-dynamic'

import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import BotaoConfirmar from './BotaoConfirmar'
import BotaoAbrirConfirmacao from './BotaoAbrirConfirmacao'

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

  const { data: membroLogado } = await supabase
    .from('membros')
    .select('id, nome, grupo, instrumento, tipo, nivel_acesso')
    .eq('user_id', user?.id)
    .single()

  const isAdmin = membroLogado?.nivel_acesso === 'Administrador'

  // Busca escalas com confirmação aberta
  const { data: escalas } = await supabase
    .from('escalas')
    .select(`
      *,
      confirmacoes(
        id, status, membro_id,
        membros(nome, instrumento, tipo)
      )
    `)
    .eq('confirmacao_aberta', true)
    .order('data', { ascending: true })

  // Busca membros por grupo para calcular total
  const { data: todosMembros } = await supabase
    .from('membros')
    .select('id, nome, grupo, instrumento, tipo, status')
    .eq('status', 'Ativo')

  const formatarData = (data: string) => {
    return new Date(data + 'T12:00:00').toLocaleDateString('pt-BR', {
      weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric'
    })
  }

  return (
    <div className="p-4 md:p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Confirmações de Presença</h2>
          <p className="text-sm text-gray-500">{escalas?.length || 0} escala(s) aguardando confirmação</p>
        </div>
      </div>

      {escalas?.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl shadow">
          <p className="text-4xl mb-3">✅</p>
          <p className="text-gray-500">Nenhuma escala aguardando confirmação</p>
        </div>
      ) : (
        <div className="space-y-6">
          {escalas?.map(escala => {
            const membrosDoGrupo = todosMembros?.filter(m => m.grupo === escala.grupo) || []
            const totalGrupo = membrosDoGrupo.length
            const confirmados = escala.confirmacoes?.filter((c: any) => c.status === 'confirmado') || []
            const ausentes = escala.confirmacoes?.filter((c: any) => c.status === 'ausente') || []
            const minhaConfirmacao = escala.confirmacoes?.find((c: any) => c.membro_id === membroLogado?.id)
            const euSouDoGrupo = membroLogado?.grupo === escala.grupo

            // Vagas abertas por instrumento
            const vagasAbertas = ausentes.map((a: any) => ({
              nome: a.membros?.nome,
              instrumento: a.membros?.instrumento,
              tipo: a.membros?.tipo,
            }))

            return (
              <div key={escala.id} className="bg-white rounded-2xl shadow overflow-hidden">
                <div className="bg-blue-600 px-6 py-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-white font-bold text-lg">{escala.grupo}</h3>
                      <p className="text-blue-100 text-sm">{formatarData(escala.data)} · {escala.hora_inicio} · {escala.local_texto}</p>
                    </div>
                    {isAdmin && (
                      <BotaoAbrirConfirmacao id={escala.id} aberta={escala.confirmacao_aberta} />
                    )}
                  </div>
                </div>

                <div className="p-6 space-y-4">
                  {/* Progresso */}
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="font-medium text-gray-700">Confirmações</span>
                      <span className="text-gray-500">{confirmados.length} de {totalGrupo} confirmados</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2.5">
                      <div className="bg-green-500 h-2.5 rounded-full transition-all"
                        style={{ width: `${totalGrupo > 0 ? (confirmados.length / totalGrupo) * 100 : 0}%` }} />
                    </div>
                  </div>

                  {/* Confirmados */}
                  {confirmados.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-gray-400 uppercase mb-2">✅ Confirmados ({confirmados.length})</p>
                      <div className="flex flex-wrap gap-2">
                        {confirmados.map((c: any) => (
                          <span key={c.id} className="text-xs bg-green-50 text-green-700 px-2 py-1 rounded-full">
                            {c.membros?.nome}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Ausentes e vagas */}
                  {ausentes.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-gray-400 uppercase mb-2">⚠️ Vagas abertas ({ausentes.length})</p>
                      <div className="space-y-2">
                        {vagasAbertas.map((vaga: any, i: number) => (
                          <div key={i} className="flex items-center justify-between bg-yellow-50 rounded-lg px-3 py-2">
                            <div>
                              <p className="text-sm font-medium text-gray-700">{vaga.instrumento || vaga.tipo}</p>
                              <p className="text-xs text-gray-500">Ausência de: {vaga.nome}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Botão de confirmação para o membro do grupo */}
                  {euSouDoGrupo && (
                    <div className="border-t pt-4">
                      <p className="text-sm font-medium text-gray-700 mb-3">Sua confirmação:</p>
                      <BotaoConfirmar
                        escalaid={escala.id}
                        membroid={membroLogado?.id}
                        confirmacaoAtual={minhaConfirmacao?.status || null}
                      />
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}