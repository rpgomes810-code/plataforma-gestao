'use client'

import { useEffect, useState } from 'react'

const PAGINAS = [
  { key: 'confirmacoes', label: '✅ Confirmações' },
  { key: 'escalas', label: '📅 Escalas' },
  { key: 'registros', label: '📋 Registros' },
  { key: 'relatorios', label: '📈 Relatórios' },
  { key: 'membros', label: '👥 Membros' },
  { key: 'hospitais', label: '🏥 Hospitais' },
  { key: 'vagas', label: '⚠️ Vagas' },
  { key: 'grupos', label: '🎻 Grupos' },
  { key: 'logs', label: '📋 Logs' },
  { key: 'solicitacoes', label: '📩 Solicitações' },
]

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

  const togglePagina = async (perfil: string, pagina: string, ativo: boolean) => {
    const item = permissoes.find(p => p.perfil === perfil)
    if (!item) return

    const novasPaginas = ativo
      ? [...item.paginas, pagina]
      : item.paginas.filter((p: string) => p !== pagina)

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
        <p className="text-sm text-gray-500">Configure quais páginas cada perfil pode acessar</p>
      </div>

      <div className="space-y-4">
        {permissoes.map(item => (
          <div key={item.perfil} className="bg-white rounded-2xl shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-gray-800">{item.perfil}</h3>
              {salvando === item.perfil && <span className="text-xs text-blue-500">Salvando...</span>}
            </div>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {PAGINAS.map(pagina => {
                const ativo = item.paginas?.includes(pagina.key)
                return (
                  <button
                    key={pagina.key}
                    onClick={() => togglePagina(item.perfil, pagina.key, !ativo)}
                    className={`px-3 py-2 rounded-lg text-xs font-semibold transition ${
                      ativo
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                    }`}
                  >
                    {pagina.label}
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}