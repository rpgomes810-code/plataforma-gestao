'use client'

import { useEffect, useState } from 'react'

export default function Dashboard() {
  const [membro, setMembro] = useState<any>(null)
  const [vagas, setVagas] = useState<any[]>([])
  const [stats, setStats] = useState<any>(null)
  const [loadingVaga, setLoadingVaga] = useState<string | null>(null)
  const [hospitais, setHospitais] = useState<any[]>([])
  const [registros, setRegistros] = useState<any[]>([])
  const [registrosGrafico, setRegistrosGrafico] = useState<any[]>([])
  const [aberto, setAberto] = useState<Record<string, boolean>>({})
  const toggle = (key: string) => setAberto(prev => ({ ...prev, [key]: !prev[key] }))

  const carregarDados = () => {
    fetch('/api/confirmacoes/pagina')
      .then(r => r.json())
      .then(d => {
        setMembro(d.membroLogado)
        const todosMembros = d.todosMembros || []
        const escalas = d.escalas || []

        const porTipo: Record<string, number> = {}
        todosMembros.forEach((m: any) => {
          const t = m.tipo || 'Outro'
          porTipo[t] = (porTipo[t] || 0) + 1
        })

        const porGrupo: Record<string, number> = {}
        escalas.forEach((e: any) => {
          const g = e.grupo || 'Sem grupo'
          porGrupo[g] = (porGrupo[g] || 0) + 1
        })

        setStats({ totalMembros: todosMembros.length, porTipo, totalEscalas: escalas.length, porGrupo })
      })

    fetch('/api/vagas').then(r => r.json()).then(setVagas)
    fetch('/api/hospitais').then(r => r.json()).then(data => { if (Array.isArray(data)) setHospitais(data) })

    const hoje = new Date()
    fetch(`/api/registros?mes=${hoje.getMonth() + 1}&ano=${hoje.getFullYear()}`)
      .then(r => r.json()).then(data => { if (Array.isArray(data)) setRegistros(data) })

    fetch('/api/dashboard/grafico').then(r => r.json()).then(data => { if (Array.isArray(data)) setRegistrosGrafico(data) })
  }

  useEffect(() => { carregarDados() }, [])

  const preencherVaga = async (escala_id: string, confirmacao_id: string) => {
    if (!membro?.id) return
    setLoadingVaga(escala_id)
    const res = await fetch('/api/vagas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ escala_id, membro_id: membro.id, confirmacao_id }),
    })
    if (res.ok) carregarDados()
    setLoadingVaga(null)
  }

  const inicial = membro?.nome?.charAt(0).toUpperCase() || '?'

  const formatarData = (data: string) => new Date(data + 'T12:00:00').toLocaleDateString('pt-BR', {
    weekday: 'long', day: '2-digit', month: '2-digit'
  })

  // Gráfico: últimos 12 meses
  const mesesNomes = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez']
  const ultimos12: { label: string; total: number }[] = []
  const hoje = new Date()
  for (let i = 11; i >= 0; i--) {
    const d = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1)
    const mes = d.getMonth()
    const ano = d.getFullYear()
    const total = registrosGrafico.filter(r => {
      const rd = new Date(r.data + 'T12:00:00')
      return rd.getMonth() === mes && rd.getFullYear() === ano
    }).length
    ultimos12.push({ label: `${mesesNomes[mes]}/${String(ano).slice(2)}`, total })
  }
  const maxGrafico = Math.max(...ultimos12.map(m => m.total), 1)

  // Registros do mês: efetivos vs pendentes
  const totalRegistros = registros.length
  const pctEfetivos = totalRegistros > 0 ? Math.round((registros.filter(r => r.registrada).length / totalRegistros) * 100) : 0
  const pctPendentes = totalRegistros > 0 ? 100 - pctEfetivos : 0

  return (
    <div className="p-4 md:p-8">

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-800">Dashboard</h2>
        <div className="flex items-center gap-3">
          <span className="text-gray-600 text-sm">Olá, {membro?.nome || '...'}!</span>
          <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">{inicial}</div>
        </div>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4 mb-6">

        {/* Membros */}
        <div className="bg-white rounded-2xl shadow p-5">
          <p className="text-3xl font-bold text-blue-600">{stats?.totalMembros || '—'}</p>
          <p className="text-sm text-gray-500 mt-1">👥 Membros</p>
          <button onClick={() => toggle('membros')} className="text-xs text-blue-500 mt-2 hover:underline">
            {aberto.membros ? '▲ Ocultar' : '▼ Ver detalhes'}
          </button>
          {aberto.membros && (
            <div className="mt-2 space-y-1">
              {Object.entries(stats?.porTipo || {}).map(([tipo, total]: any) => (
                <p key={tipo} className="text-xs text-gray-500">{total} {tipo}</p>
              ))}
            </div>
          )}
        </div>

        {/* Escalas */}
        <div className="bg-white rounded-2xl shadow p-5">
          <p className="text-3xl font-bold text-green-600">{stats?.totalEscalas || '—'}</p>
          <p className="text-sm text-gray-500 mt-1">📅 Escalas abertas</p>
          <button onClick={() => toggle('escalas')} className="text-xs text-blue-500 mt-2 hover:underline">
            {aberto.escalas ? '▲ Ocultar' : '▼ Ver detalhes'}
          </button>
          {aberto.escalas && (
            <div className="mt-2 space-y-1">
              {Object.entries(stats?.porGrupo || {}).sort((a: any, b: any) => {
                const numA = parseInt(a[0].replace(/\D/g, '')) || 0
                const numB = parseInt(b[0].replace(/\D/g, '')) || 0
                return numA - numB
              }).map(([grupo, total]: any) => (
                <p key={grupo} className="text-xs text-gray-500">{grupo}: {total}</p>
              ))}
            </div>
          )}
        </div>

        {/* Vagas */}
        <a href="#vagas" className="bg-white rounded-2xl shadow p-5 hover:shadow-md transition block">
          <p className="text-3xl font-bold text-orange-500">{vagas.length}</p>
          <p className="text-sm text-gray-500 mt-1">⚠️ Vagas abertas</p>
          <p className="text-xs text-orange-400 mt-2">Ver vagas ↓</p>
        </a>

        {/* Registros */}
        <div className="bg-white rounded-2xl shadow p-5">
          <p className="text-3xl font-bold text-yellow-600">{totalRegistros}</p>
          <p className="text-sm text-gray-500 mt-1">📋 Registros mês</p>
          <button onClick={() => toggle('registros')} className="text-xs text-blue-500 mt-2 hover:underline">
            {aberto.registros ? '▲ Ocultar' : '▼ Ver detalhes'}
          </button>
          {aberto.registros && (
            <div className="mt-2 space-y-1">
              <p className="text-xs text-green-600">✅ {pctEfetivos}% efetivos</p>
              <p className="text-xs text-red-500">⏳ {pctPendentes}% pendentes</p>
            </div>
          )}
        </div>

        {/* Hospitais */}
        <div className="bg-white rounded-2xl shadow p-5">
          <p className="text-3xl font-bold text-purple-600">{hospitais.length}</p>
          <p className="text-sm text-gray-500 mt-1">🏥 Hospitais</p>
          <button onClick={() => toggle('hospitais')} className="text-xs text-blue-500 mt-2 hover:underline">
            {aberto.hospitais ? '▲ Ocultar' : '▼ Ver detalhes'}
          </button>
          {aberto.hospitais && (
            <div className="mt-2 space-y-1">
              {hospitais.map((h: any) => (
                <p key={h.id} className="text-xs text-gray-500">🏥 {h.nome}</p>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* Gráfico de barras - últimos 12 meses */}
      <div className="bg-white rounded-2xl shadow p-6 mb-6">
        <h3 className="text-base font-bold text-gray-800 mb-4">📊 Atendimentos mensais — últimos 12 meses</h3>
        <div className="flex items-end gap-2 h-40">
          {ultimos12.map((m, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <span className="text-xs text-gray-600 font-semibold">{m.total > 0 ? m.total : ''}</span>
              <div className="w-full rounded-t-lg bg-blue-500 transition-all" style={{ height: `${Math.max((m.total / maxGrafico) * 120, m.total > 0 ? 8 : 2)}px` }} />
              <span className="text-xs text-gray-400 rotate-0 whitespace-nowrap" style={{ fontSize: '9px' }}>{m.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Vagas abertas */}
      <div id="vagas" className="bg-white rounded-2xl shadow p-6">
        <h3 className="text-base font-bold text-gray-800 mb-4">⚠️ Vagas abertas — precisamos de voluntários!</h3>
        {vagas.length === 0 ? (
          <p className="text-sm text-gray-400">Nenhuma vaga aberta no momento. ✅</p>
        ) : (
          <div className="space-y-3">
            {vagas.map((vaga: any) => {
              const eDoGrupo = membro?.grupo === vaga.escalas?.grupo
              return (
                <div key={vaga.id} className="flex items-center justify-between bg-yellow-50 rounded-xl px-4 py-3">
                  <div>
                    <p className="text-sm font-semibold text-gray-800">{vaga.escalas?.grupo} — {vaga.escalas?.local_texto}</p>
                    <p className="text-xs text-gray-500">{formatarData(vaga.escalas?.data)} · {vaga.escalas?.hora_inicio}</p>
                    <p className="text-xs text-orange-600 mt-1">Vaga de: {vaga.membros?.instrumento || vaga.membros?.tipo}</p>
                  </div>
                  {!eDoGrupo && (
                    <button
                      onClick={() => preencherVaga(vaga.escala_id, vaga.id)}
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

    </div>
  )
}