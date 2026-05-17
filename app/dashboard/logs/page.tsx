export const dynamic = 'force-dynamic'

import { createClient } from '@supabase/supabase-js'
import BotaoReverter from './BotaoReverter'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const CAMPOS_IGNORAR = ['id', 'user_id', 'aprovado', 'criado_em', 'escala_id', 'criado_por', 'data_registro', 'ativo', 'logo_url']

function DiffView({ antes, depois }: { antes: any, depois: any }) {
  if (!antes || !depois) return null

  const campos = new Set([...Object.keys(antes), ...Object.keys(depois)])
  const alterados = Array.from(campos).filter(campo => {
    if (CAMPOS_IGNORAR.includes(campo)) return false
    const a = JSON.stringify(antes[campo])
    const d = JSON.stringify(depois[campo])
    return a !== d
  })

  if (alterados.length === 0) return <p className="text-xs text-gray-400">Nenhuma alteração detectada</p>

  return (
    <div className="space-y-2 mt-2">
      {alterados.map(campo => (
        <div key={campo} className="text-xs rounded-lg overflow-hidden border border-gray-100">
          <div className="bg-gray-50 px-2 py-1 font-semibold text-gray-600">{campo}</div>
          <div className="bg-red-50 px-2 py-1 text-red-700">— {String(antes[campo] ?? '—')}</div>
          <div className="bg-green-50 px-2 py-1 text-green-700">+ {String(depois[campo] ?? '—')}</div>
        </div>
      ))}
    </div>
  )
}

export default async function Logs() {
  const { data: logs } = await supabase
    .from('logs')
    .select('*')
    .order('criado_em', { ascending: false })
    .limit(200)

  const formatarDataHora = (data: string) => {
    return new Date(data).toLocaleDateString('pt-BR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit', second: '2-digit',
      timeZone: 'America/Sao_Paulo'
    })
  }

  const corAcao = (acao: string) => {
    if (acao.includes('[REVERTIDO]')) return 'bg-orange-50 text-orange-700'
    if (acao.includes('Excluiu')) return 'bg-red-50 text-red-700'
    if (acao.includes('Criou') || acao.includes('Aprovou') || acao.includes('Registrou')) return 'bg-green-50 text-green-700'
    if (acao.includes('Editou') || acao.includes('Atualizou')) return 'bg-yellow-50 text-yellow-700'
    return 'bg-gray-50 text-gray-700'
  }

  const podeReverter = (log: any) => {
    return log.acao.includes('Excluiu membro') &&
      !log.acao.includes('[REVERTIDO]') &&
      log.dados_antes &&
      log.tabela === 'membros'
  }

  return (
    <div className="p-4 md:p-6">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-800">Log de Auditoria</h2>
        <p className="text-sm text-gray-500">{logs?.length} registros — últimas 200 ações</p>
      </div>

      {logs?.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl shadow">
          <p className="text-4xl mb-3">📋</p>
          <p className="text-gray-500">Nenhuma ação registrada ainda</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Data/Hora</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Usuário</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Ação</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Tabela</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Alterações</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {logs?.map(log => (
                  <tr key={log.id} className="hover:bg-gray-50 align-top">
                    <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">{formatarDataHora(log.criado_em)}</td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-700">{log.usuario_nome || '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-semibold px-2 py-1 rounded-full ${corAcao(log.acao)}`}>
                        {log.acao}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">{log.tabela || '—'}</td>
                    <td className="px-4 py-3 max-w-sm">
                      {log.dados_antes && log.dados_depois && !log.dados_depois.excluido ? (
                        <details>
                          <summary className="cursor-pointer text-blue-600 hover:underline text-xs">Ver o que mudou</summary>
                          <DiffView antes={log.dados_antes} depois={log.dados_depois} />
                        </details>
                      ) : log.dados_antes && (
                        <details>
                          <summary className="cursor-pointer text-blue-600 hover:underline text-xs">Ver dados</summary>
                          <div className="mt-2 bg-red-50 rounded p-2">
                            <pre className="text-xs text-red-700 whitespace-pre-wrap">{JSON.stringify(log.dados_antes, null, 2)}</pre>
                          </div>
                        </details>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {podeReverter(log) && (
                        <BotaoReverter
                          logId={log.id}
                          tabela={log.tabela}
                          dadosAntes={log.dados_antes}
                        />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}