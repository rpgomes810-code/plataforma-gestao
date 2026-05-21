'use client'

import { useEffect, useState } from 'react'

const PAGINAS = [
  { key: 'confirmacoes', label: 'Confirmações', acoes: ['ver'] },
  { key: 'escalas', label: 'Escalas', acoes: ['ver', 'criar', 'editar', 'excluir'] },
  { key: 'registros', label: 'Registros', acoes: ['ver', 'criar', 'editar', 'excluir'] },
  { key: 'relatorios', label: 'Relatórios', acoes: ['ver'] },
  { key: 'membros', label: 'Membros', acoes: ['ver', 'criar', 'editar', 'excluir'] },
  { key: 'hospitais', label: 'Hospitais', acoes: ['ver', 'criar', 'editar', 'excluir'] },
  { key: 'vagas', label: 'Vagas', acoes: ['ver'] },
  { key: 'comunicados', label: 'Comunicados', acoes: ['ver', 'criar', 'editar', 'excluir'] },
  { key: 'grupos', label: 'Grupos', acoes: ['ver', 'criar', 'editar', 'excluir'] },
  { key: 'logs', label: 'Logs', acoes: ['ver'] },
  { key: 'solicitacoes', label: 'Solicitações', acoes: ['ver'] },
]

const COR_ACAO: Record<string, string> = {
  ver: 'bg-blue-600 text-white hover:bg-blue-700',
  criar: 'bg-green-600 text-white hover:bg-green-700',
  editar: 'bg-yellow-500 text-white hover:bg-yellow-600',
  excluir: 'bg-red-600 text-white hover:bg-red-700',
}

const COR_INATIVO = 'bg-gray-100 text-gray-400 hover:bg-gray-200'

export default function Permissoes() {
  const [permissoes, setPermissoes] = useState<any[]>([])
  const [salvando, setSalvando] = useState<string | null>(null)
  const [temAcesso, setTemAcesso] = useState<boolean | null>(null)

  useEffect(() => {
    fetch('/api/membros/eu').then(r => r.json()).then(async membro => {
      const res = await fetch('/api/permissoes/acesso?membro_id=' + membro.id)
      const data = await res.json()
      setTemAcesso(data.acesso)
    })
    fetch('/api/permissoes').then(r => r.json()).then(data => {
      if (Array.isArray(data)) setPermissoes(data)
    })
  }, [])

  const toggleAcao = async (perfil: string, pagina: string, acao: string, ativo: boolean) => {
    const item = permissoes.find(p => p.perfil === perfil)
    if (!item) return

    const paginaAtual = item.paginas?.[pagina] || {}
    const novaPagina = { ...paginaAtual, [acao]: ativo }

    if (acao === 'ver' && !ativo) {
      Object.keys(novaPagina).forEach(k => novaPagina[k] = false)
    }
    if (acao !== 'ver' && ativo) {
      novaPagina['ver'] = true
    }

    const novasPaginas = { ...item.paginas, [pagina]: novaPagina }
    setPermissoes(prev => prev.map(p => p.perfil === perfil ? { ...p, paginas: novasPaginas } : p))

    setSalvando(perfil)
    await fetch('/api/permissoes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ perfil, paginas: novasPaginas })
    })
    setSalvando(null)
  }

  if (temAcesso === null) return <div className="p-6 text-gray-500">Carregando...</div>

  if (!temAcesso) return (
    <div className="p-4 md:p-6">
      <div className="text-center py-12 bg-white rounded-2xl shadow">
        <p className="text-4xl mb-3">🔒</p>
        <p className="text-gray-500">Você não tem acesso a esta página</p>
      </div>
    </div>
  )

  return (
    <div className="p-4 md:p-6">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-800">Permissões por Perfil</h2>
        <p className="text-sm text-gray-500">Configure o que cada perfil pode fazer em cada página</p>
      </div>

      <div className="space-y-6">
        {permissoes.map(item => (
          <div key={item.perfil} className="bg-white rounded-2xl shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-gray-800">{item.perfil}</h3>
              {salvando === item.perfil && <span className="text-xs text-blue-500">Salvando...</span>}
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr>
                    <th className="text-left text-xs font-semibold text-gray-400 uppercase pb-2 pr-4">Página</th>
                    <th className="text-center text-xs font-semibold text-blue-400 uppercase pb-2 px-2">Ver</th>
                    <th className="text-center text-xs font-semibold text-green-400 uppercase pb-2 px-2">Criar</th>
                    <th className="text-center text-xs font-semibold text-yellow-400 uppercase pb-2 px-2">Editar</th>
                    <th className="text-center text-xs font-semibold text-red-400 uppercase pb-2 px-2">Excluir</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {PAGINAS.map(pagina => {
                    const paginaPerms = item.paginas?.[pagina.key] || {}
                    return (
                      <tr key={pagina.key}>
                        <td className="py-2 pr-4 font-medium text-gray-700">{pagina.label}</td>
                        {['ver', 'criar', 'editar', 'excluir'].map(acao => {
                          const temAcao = pagina.acoes.includes(acao)
                          const ativo = paginaPerms[acao] === true
                          return (
                            <td key={acao} className="py-2 px-2 text-center">
                              {temAcao ? (
                                <button
                                  onClick={() => toggleAcao(item.perfil, pagina.key, acao, !ativo)}
                                  className={`w-8 h-8 rounded-lg text-xs font-bold transition ${ativo ? COR_ACAO[acao] : COR_INATIVO}`}
                                >
                                  {ativo ? '✓' : '×'}
                                </button>
                              ) : (
                                <span className="text-gray-200">—</span>
                              )}
                            </td>
                          )
                        })}
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}