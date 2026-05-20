'use client'

import { useEffect, useState } from 'react'

export default function Vagas() {
  const [vagas, setVagas] = useState<any[]>([])
  const [membro, setMembro] = useState<any>(null)
  const [loadingVaga, setLoadingVaga] = useState<string | null>(null)

  const carregarDados = () => {
    fetch('/api/confirmacoes/pagina').then(r => r.json()).then(d => setMembro(d.membroLogado))
    fetch('/api/vagas').then(r => r.json()).then(data => { if (Array.isArray(data)) setVagas(data) })
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

  const formatarData = (data: string) => new Date(data + 'T12:00:00').toLocaleDateString('pt-BR', {
    weekday: 'long', day: '2-digit', month: '2-digit'
  })

  const tipoVaga = (vaga: any) => {
    const tipo = (vaga.membros?.tipo ?? '').toString().trim().toLowerCase()
    const instrumento = (vaga.membros?.instrumento ?? '').toString().trim()
    if (tipo === 'atendente') return 'Atendente'
    if (instrumento && instrumento !== 'Nenhum') return instrumento
    return '—'
  }

  return (
    <div className="p-4 md:p-6">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-800">Vagas Abertas</h2>
        <p className="text-sm text-gray-500">{vagas.length} vaga(s) aguardando voluntários</p>
      </div>

      {vagas.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl shadow">
          <p className="text-4xl mb-3">✅</p>
          <p className="text-gray-500">Nenhuma vaga aberta no momento</p>
        </div>
      ) : (
        <div className="space-y-3">
          {vagas.map((vaga: any) => {
            const eDoGrupo = membro?.grupo === vaga.escalas?.grupo
            return (
              <div key={vaga.id} className="bg-white rounded-2xl shadow p-5 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-gray-800">{vaga.escalas?.grupo} — {vaga.escalas?.local_texto}</p>
                  <p className="text-xs text-gray-500 mt-1">{formatarData(vaga.escalas?.data)} · {vaga.escalas?.hora_inicio}</p>
                  <p className="text-xs text-orange-600 mt-1">🎻 Vaga de: {tipoVaga(vaga)}</p>
                </div>
                {!eDoGrupo && (
                  <button
                    onClick={() => preencherVaga(vaga.escala_id, vaga.id)}
                    disabled={loadingVaga === vaga.escala_id}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition disabled:opacity-50"
                  >
                    {loadingVaga === vaga.escala_id ? 'Salvando...' : 'Preencher vaga'}
                  </button>
                )}
                {eDoGrupo && (
                  <span className="text-xs text-gray-400 px-3 py-1 bg-gray-100 rounded-full">Seu grupo</span>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}