'use client'

import { useEffect, useState } from 'react'

export default function Dashboard() {
  const [membro, setMembro] = useState<any>(null)
  const [vagas, setVagas] = useState<any[]>([])
  const [stats, setStats] = useState<any>(null)
  const [loadingVaga, setLoadingVaga] = useState<string | null>(null)

  const carregarDados = () => {
    fetch('/api/confirmacoes/pagina')
      .then(r => r.json())
      .then(d => {
        setMembro(d.membroLogado)
        const totalMembros = d.todosMembros?.length || 0
        const totalEscalas = d.escalas?.length || 0
        setStats({ totalMembros, totalEscalas })
      })

    fetch('/api/vagas')
      .then(r => r.json())
      .then(setVagas)
  }

  useEffect(() => { carregarDados() }, [])

  const preencherVaga = async (escala_id: string) => {
    if (!membro?.id) return
    setLoadingVaga(escala_id)
    const res = await fetch('/api/vagas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ escala_id, membro_id: membro.id }),
    })
    if (res.ok) carregarDados()
    setLoadingVaga(null)
  }

  const inicial = membro?.nome?.charAt(0).toUpperCase() || '?'

  const formatarData = (data: string) => {
    return new Date(data + 'T12:00:00').toLocaleDateString('pt-BR', {
      weekday: 'long', day: '2-digit', month: '2-digit'
    })
  }

  return (
    <div className="p-4 md:p-8">

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-800">Dashboard</h2>
        <div className="flex items-center gap-3">
          <span className="text-gray-600 text-sm">Olá, {membro?.nome || '...'}!</span>
          <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
            {inicial}
          </div>
        </div>
      </div>

      {/* Cards de resumo */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <a href="/dashboard/membros" className="bg-white rounded-2xl shadow p-5 text-center hover:shadow-md transition">
          <p className="text-3xl font-bold text-blue-600">{stats?.totalMembros || '—'}</p>
          <p className="text-sm text-gray-500 mt-1">👥 Membros</p>
        </a>
        <a href="/dashboard/escalas" className="bg-white rounded-2xl shadow p-5 text-center hover:shadow-md transition">
          <p className="text-3xl font-bold text-green-600">{stats?.totalEscalas || '—'}</p>
          <p className="text-sm text-gray-500 mt-1">📅 Escalas abertas</p>
        </a>
        <a href="/dashboard/confirmacoes" className="bg-white rounded-2xl shadow p-5 text-center hover:shadow-md transition">
          <p className="text-3xl font-bold text-purple-600">{vagas.length}</p>
          <p className="text-sm text-gray-500 mt-1">⚠️ Vagas abertas</p>
        </a>
        <a href="/dashboard/registros" className="bg-white rounded-2xl shadow p-5 text-center hover:shadow-md transition">
          <p className="text-3xl font-bold text-yellow-600">📋</p>
          <p className="text-sm text-gray-500 mt-1">Registros</p>
        </a>
      </div>

      {/* Vagas abertas */}
      <div className="bg-white rounded-2xl shadow p-6 mb-6">
        <h3 className="text-base font-bold text-gray-800 mb-4">⚠️ Vagas abertas — precisamos de voluntários!</h3>
        {vagas.length === 0 ? (
          <p className="text-sm text-gray-400">Nenhuma vaga aberta no momento. ✅</p>
        ) : (
          <div className="space-y-3">
            {vagas.map((vaga: any) => {
              const jaPreencheu = vaga.membro_id === membro?.id
              const eDoGrupo = membro?.grupo === vaga.escalas?.grupo
              return (
                <div key={vaga.id} className="flex items-center justify-between bg-yellow-50 rounded-xl px-4 py-3">
                  <div>
                    <p className="text-sm font-semibold text-gray-800">
                      {vaga.escalas?.grupo} — {vaga.escalas?.local_texto}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatarData(vaga.escalas?.data)} · {vaga.escalas?.hora_inicio}
                    </p>
                    <p className="text-xs text-orange-600 mt-1">
                      Vaga de: {vaga.membros?.instrumento || vaga.membros?.tipo} ({vaga.membros?.nome})
                    </p>
                  </div>
                  {!eDoGrupo && (
                    <button
                      onClick={() => preencherVaga(vaga.escala_id)}
                      disabled={loadingVaga === vaga.escala_id}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg text-xs font-semibold hover:bg-blue-700 transition disabled:opacity-50"
                    >
                      {loadingVaga === vaga.escala_id ? 'Salvando...' : 'Preencher vaga'}
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Atalhos rápidos */}
      <div className="bg-white rounded-2xl shadow p-6">
        <h3 className="text-base font-bold text-gray-800 mb-4">🚀 Atalhos rápidos</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <a href="/dashboard/escalas/nova" className="flex flex-col items-center gap-2 bg-blue-50 rounded-xl p-4 hover:bg-blue-100 transition">
            <span className="text-2xl">📅</span>
            <span className="text-xs font-semibold text-blue-700">Nova Escala</span>
          </a>
          <a href="/dashboard/registros/novo" className="flex flex-col items-center gap-2 bg-green-50 rounded-xl p-4 hover:bg-green-100 transition">
            <span className="text-2xl">📋</span>
            <span className="text-xs font-semibold text-green-700">Novo Registro</span>
          </a>
          <a href="/dashboard/membros/novo" className="flex flex-col items-center gap-2 bg-purple-50 rounded-xl p-4 hover:bg-purple-100 transition">
            <span className="text-2xl">👤</span>
            <span className="text-xs font-semibold text-purple-700">Novo Membro</span>
          </a>
          <a href="/dashboard/relatorios" className="flex flex-col items-center gap-2 bg-yellow-50 rounded-xl p-4 hover:bg-yellow-100 transition">
            <span className="text-2xl">📈</span>
            <span className="text-xs font-semibold text-yellow-700">Relatórios</span>
          </a>
        </div>
      </div>

    </div>
  )
}