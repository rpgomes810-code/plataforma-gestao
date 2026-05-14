export const dynamic = 'force-dynamic'

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

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
    if (acao.includes('Excluiu')) return 'bg-red-50 text-red-700'
    if (acao.includes('Criou') || acao.includes('Aprovou') || acao.includes('Registrou')) return 'bg-green-50 text-green-700'
    if (acao.includes('Editou') || acao.includes('Atualizou')) return 'bg-yellow-50 text-yellow-700'
    return 'bg-gray-50 text-gray-700'
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
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Detalhes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {logs?.map(log => (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">{formatarDataHora(log.criado_em)}</td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-700">{log.usuario_nome || '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-semibold px-2 py-1 rounded-full ${corAcao(log.acao)}`}>
                        {log.acao}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">{log.tabela || '—'}</td>
                    <td className="px-4 py-3 text-xs text-gray-400 max-w-xs">
                      {log.dados_depois && (
                        <details>
                          <summary className="cursor-pointer text-blue-600 hover:underline">Ver detalhes</summary>
                          <div className="mt-2 space-y-1">
                            {log.dados_antes && (
                              <div className="bg-red-50 rounded p-2">
                                <p className="font-semibold text-red-600 mb-1">Antes:</p>
                                <pre className="text-xs text-red-700 whitespace-pre-wrap">{JSON.stringify(log.dados_antes, null, 2)}</pre>
                              </div>
                            )}
                            <div className="bg-green-50 rounded p-2">
                              <p className="font-semibold text-green-600 mb-1">Depois:</p>
                              <pre className="text-xs text-green-700 whitespace-pre-wrap">{JSON.stringify(log.dados_depois, null, 2)}</pre>
                            </div>
                          </div>
                        </details>
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