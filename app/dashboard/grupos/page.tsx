'use client'

import { useState, useEffect } from 'react'

type Grupo = { id: string; nome: string }

export default function Grupos() {
  const [grupos, setGrupos] = useState<Grupo[]>([])
  const [novoGrupo, setNovoGrupo] = useState('')
  const [loading, setLoading] = useState(false)

  const carregar = () => {
    fetch('/api/grupos')
      .then(res => res.json())
      .then(data => { if (Array.isArray(data)) setGrupos(data) })
  }

  useEffect(() => { carregar() }, [])

  const adicionar = async () => {
    if (!novoGrupo.trim()) return
    setLoading(true)
    await fetch('/api/grupos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nome: novoGrupo.trim() }),
    })
    setNovoGrupo('')
    carregar()
    setLoading(false)
  }

  const excluir = async (id: string, nome: string) => {
    if (!confirm(`Excluir o grupo "${nome}"?`)) return
    await fetch('/api/grupos', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    carregar()
  }

  return (
    <div className="p-4 md:p-6 max-w-lg">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-800">Gerenciar Grupos</h2>
        <p className="text-sm text-gray-500">Adicione ou remova grupos do sistema</p>
      </div>

      <div className="bg-white rounded-2xl shadow p-6 space-y-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={novoGrupo}
            onChange={e => setNovoGrupo(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && adicionar()}
            placeholder="Nome do novo grupo..."
            className="flex-1 border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button onClick={adicionar} disabled={loading}
            className="bg-blue-600 text-white px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-700 transition disabled:opacity-50">
            + Adicionar
          </button>
        </div>

        <div className="space-y-2">
          {grupos.map(g => (
            <div key={g.id} className="flex items-center justify-between bg-gray-50 rounded-lg px-4 py-3">
              <span className="text-sm font-medium text-gray-700">🎻 {g.nome}</span>
              <button onClick={() => excluir(g.id, g.nome)}
                className="text-xs text-red-500 hover:text-red-700 transition">
                Excluir
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}