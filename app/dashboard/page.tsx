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

        setStats({
          totalMembros: todosMembros.length,
          porTipo,
          totalEscalas: escalas.length,
          porGrupo,
        })
      })

    fetch('/api/vagas').then(r => r.json()).then(setVagas)
  }

  useEffect(() => { carregarDados() }, [])

  const [hospitais, setHospitais] = useState<any[]>([])
  const [registros, setRegistros] = useState<any[]>([])
  const [escalasTotal, setEscalasTotal] = useState<any[]>([])

  useEffect(() => {
    fetch('/api/hospitais').then(r => r.json()).then(data => { if (Array.isArray(data)) setHospitais(data) })

    const hoje = new Date()
    const mes = hoje.getMonth() + 1
    const ano = hoje.getFullYear()
    fetch(`/api/registros?mes=${mes}&ano=${ano}`).then(r => r.json()).then(data => { if (Array.isArray(data)) setRegistros(data) })

    // Busca escalas dos últimos 6 meses para o gráfico
    fetch('/api/dashboard/grafico').then(r => r.json()).then(data => { if (Array.isArray(data)) setEscalasTotal(data) })
  }, [])

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

  // Gráfico simples: registros por hospital no mês atual
  const porHospital: Record<string, number> = {}
  registros.forEach(r => {
    const nome = r.hospitais?.nome || 'Desconhecido'
    porHospital[nome] = (porHospital[nome] || 0) + 1
  })
  const maxHospital = Math.max(...Object.values(porHospital), 1)

  return (
    <div className="p-4 md:p-8">

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-800">Dashboard</h2>
        <div className="flex items-center gap-3">
          <span className="text-gray-600 text-sm">Olá, {membro?.nome || '...'}!</span>
          <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">{inicial}</div>
        </div>
      </div>

      {/* Cards principais */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4 mb-6">

        {/* Membros */}
        <div className="bg-white rounded-2xl shadow p-5">
          <p className="text-3xl font-bold text-blue-600">{stats?.totalMembros || '—'}</p>
          <p className="text-sm text-gray-500 mt-1 mb-3">👥 Membros</p>
          <div className="space-y-1">
            {Object.entries(stats?.porTipo || {}).map(([tipo, total]: any) => (
              <p key={tipo} className="text-xs text-gray-500">{total} {tipo}</p>
            ))}
          </div>
        </div>

        {/* Escalas */}
        <div className="bg-white rounded-2xl shadow p-5">
          <p className="text-3xl font-bold text-green-600">{stats?.totalEscalas || '—'}</p>
          <p className="text-sm text-gray-500 mt-1 mb-3">📅 Escalas abertas</p>
          <div className="space-y-1">
            {Object.entries(stats?.porGrupo || {}).sort((a: any, b: any) => {
              const numA = parseInt(a[0].replace(/\D/g, '')) || 0
              const numB = parseInt(b[0].replace(/\D/g, '')) || 0
              return numA - numB
            }).map(([grupo, total]: any) => (
              <p key={grupo} className="text-xs text-gray-500">{grupo}: {total}</p>
            ))}
          </div>
        </div>

        {/* Vagas */}
        <a href="#vagas" className="bg-white rounded-2xl shadow p-5 hover:shadow-md transition">
          <p className="text-3xl font-bold text-orange-500">{vagas.length}</p>
          <p className="text-sm text-gray-500 mt-1">⚠️ Vagas abertas</p>
          <p className="text-xs text-orange-400 mt-3">Ver vagas ↓</p>
        </a>

        {/* Registros */}
        <div className="bg-white rounded-2xl shadow p-5">
          <p className="text-3xl font-bold text-yellow-600">{registros.length}</p>
          <p className="text-sm text-gray-500 mt-1 mb-3">📋 Registros mês</p>
          <p className="text-xs text-gray-400">{registros.filter(r => r.registrada).length} efetivos</p>
          <p className="text-xs text-gray-400">{registros.filter(r => !r.registrada).length} pendentes</p>
        </div>

        {/* Hospitais */}
        <div className="bg-white rounded-2xl shadow p-5">
          <p className="text-3xl font-bold text-purple-600">{hospitais.length}</p>
          <p className="text-sm text-gray-500 mt-1 mb-3">🏥 Hospitais</p>
          <p className="text-xs text-gray-400">{hospitais.filter((h: any) => h.ativo).length} ativos</p>
        </div>

      </div>

      {/* Gráfico: registros por hospital no mês */}
      {registros.length > 0 && (
        <div className="bg-white rounded-2xl shadow p-6 mb-6">
          <h3 className="text-base font-bold text-gray-800 mb-4">📊 Atendimentos por hospital — mês atual</h3>
          <div className="space-y-3">
            {Object.entries(porHospital).sort((a, b) => b[1] - a[1]).map(([nome, total]) => (
              <div key={nome}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium text-gray-700">{nome}</span>
                  <span className="text-gray-500">{total} atendimento{total > 1 ? 's' : ''}</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full transition-all" style={{ width: `${(total / maxHospital) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

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