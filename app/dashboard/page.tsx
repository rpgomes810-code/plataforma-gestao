'use client'

import { useEffect, useState } from 'react'

export default function Dashboard() {
  const [membro, setMembro] = useState<any>(null)
  const [vagas, setVagas] = useState<any[]>([])
  const [stats, setStats] = useState<any>(null)
  const [hospitais, setHospitais] = useState<any[]>([])
  const [registros, setRegistros] = useState<any[]>([])
  const [escalasTotal, setEscalasTotal] = useState<any[]>([])
  const [registrosGrafico, setRegistrosGrafico] = useState<any[]>([])
  const [aberto, setAberto] = useState<Record<string, boolean>>({})
  const toggle = (key: string) => setAberto(prev => ({ ...prev, [key]: !prev[key] }))

  useEffect(() => {
    fetch('/api/confirmacoes/pagina').then(r => r.json()).then(d => {
      setMembro(d.membroLogado)
      const todosMembros = d.todosMembros || []
      const escalas = d.escalas || []

      const porTipo: Record<string, number> = {}
      todosMembros.forEach((m: any) => { porTipo[m.tipo || 'Outro'] = (porTipo[m.tipo || 'Outro'] || 0) + 1 })

      const porGrupo: Record<string, number> = {}
      escalas.forEach((e: any) => { porGrupo[e.grupo || 'Sem grupo'] = (porGrupo[e.grupo || 'Sem grupo'] || 0) + 1 })

      setStats({ totalMembros: todosMembros.length, porTipo, totalEscalas: escalas.length, porGrupo })
      setEscalasTotal(escalas)
    })

    fetch('/api/vagas').then(r => r.json()).then(setVagas)
    fetch('/api/hospitais').then(r => r.json()).then(data => { if (Array.isArray(data)) setHospitais(data) })

    const hoje = new Date()
    fetch(`/api/registros?mes=${hoje.getMonth() + 1}&ano=${hoje.getFullYear()}`)
      .then(r => r.json()).then(data => { if (Array.isArray(data)) setRegistros(data) })

    fetch('/api/dashboard/grafico').then(r => r.json()).then(data => { if (Array.isArray(data)) setRegistrosGrafico(data) })
  }, [])

  const inicial = membro?.nome?.charAt(0).toUpperCase() || '?'

  // Gráfico últimos 12 meses
  const mesesNomes = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez']
  const hoje = new Date()
  const ultimos12 = Array.from({ length: 12 }, (_, i) => {
    const d = new Date(hoje.getFullYear(), hoje.getMonth() - (11 - i), 1)
    const total = registrosGrafico.filter(r => {
      const rd = new Date(r.data + 'T12:00:00')
      return rd.getMonth() === d.getMonth() && rd.getFullYear() === d.getFullYear()
    }).length
    return { label: `${mesesNomes[d.getMonth()]}/${String(d.getFullYear()).slice(2)}`, total }
  })
  const maxGrafico = Math.max(...ultimos12.map(m => m.total), 1)

  // Registros: escalas registradas vs total
  const totalEscalasMes = escalasTotal.length
  const escalasRegistradas = escalasTotal.filter((e: any) => e.registrada).length
  const porGrupoReg: Record<string, { total: number; registradas: number }> = {}
  escalasTotal.forEach((e: any) => {
    const g = e.grupo || 'Sem grupo'
    if (!porGrupoReg[g]) porGrupoReg[g] = { total: 0, registradas: 0 }
    porGrupoReg[g].total++
    if (e.registrada) porGrupoReg[g].registradas++
  })

  return (
    <div className="p-4 md:p-8">

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-800">Dashboard</h2>
        <div className="flex items-center gap-3">
          <span className="text-gray-600 text-sm">Olá, {membro?.nome || '...'}!</span>
          <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">{inicial}</div>
        </div>
      </div>

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
                return (parseInt(a[0].replace(/\D/g, '')) || 0) - (parseInt(b[0].replace(/\D/g, '')) || 0)
              }).map(([grupo, total]: any) => (
                <p key={grupo} className="text-xs text-gray-500">{grupo}: {total}</p>
              ))}
            </div>
          )}
        </div>

        {/* Vagas */}
        <a href="/dashboard/vagas" className="bg-white rounded-2xl shadow p-5 hover:shadow-md transition block">
          <p className="text-3xl font-bold text-orange-500">{vagas.length}</p>
          <p className="text-sm text-gray-500 mt-1">⚠️ Vagas abertas</p>
          <p className="text-xs text-orange-400 mt-2">Ver vagas →</p>
        </a>

        {/* Registros */}
        <div className="bg-white rounded-2xl shadow p-5">
          <p className="text-3xl font-bold text-yellow-600">{escalasRegistradas}/{totalEscalasMes}</p>
          <p className="text-xs text-gray-400">registros efetivos</p>
          <p className="text-sm text-gray-500 mt-1">📋 Registros</p>
          <button onClick={() => toggle('registros')} className="text-xs text-blue-500 mt-2 hover:underline">
            {aberto.registros ? '▲ Ocultar' : '▼ Ver detalhes'}
          </button>
          {aberto.registros && (
            <div className="mt-2 space-y-1">
              {Object.entries(porGrupoReg).sort((a: any, b: any) => {
                return (parseInt(a[0].replace(/\D/g, '')) || 0) - (parseInt(b[0].replace(/\D/g, '')) || 0)
              }).map(([grupo, val]: any) => (
                <p key={grupo} className={`text-xs ${val.registradas < val.total ? 'text-red-500' : 'text-green-600'}`}>
                  {grupo}: {val.registradas}/{val.total}
                </p>
              ))}
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

      {/* Gráfico de barras */}
      <div className="bg-white rounded-2xl shadow p-6 mb-6">
        <h3 className="text-base font-bold text-gray-800 mb-4">📊 Atendimentos mensais — últimos 12 meses</h3>
        <div className="flex items-end gap-1 md:gap-2 h-40">
          {ultimos12.map((m, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <span className="text-xs text-gray-600 font-semibold">{m.total > 0 ? m.total : ''}</span>
              <div
                className="w-full rounded-t-lg bg-blue-500 transition-all"
                style={{ height: `${Math.max((m.total / maxGrafico) * 120, m.total > 0 ? 8 : 2)}px`, backgroundColor: m.total > 0 ? '#3b82f6' : '#e5e7eb' }}
              />
              <span className="text-gray-400 whitespace-nowrap" style={{ fontSize: '9px' }}>{m.label}</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}