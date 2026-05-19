'use client'

import { useState, useEffect } from 'react'
import BotaoExcluirEscala from './BotaoExcluirEscala'

type Escala = {
  id: string
  data: string
  grupo: string
  local_texto: string
  hora_inicio: string
  atendentes: string
  observacoes: string
  confirmacao_aberta: boolean
}

const meses = [
  'Janeiro','Fevereiro','Março','Abril','Maio','Junho',
  'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'
]

export default function Escalas() {
  const hoje = new Date()
  const [mes, setMes] = useState(hoje.getMonth())
  const [ano, setAno] = useState(hoje.getFullYear())
  const [escalas, setEscalas] = useState<Escala[]>([])
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    fetch('/api/membros/eu')
      .then(res => res.json())
      .then(data => {
        if (data?.nivel_acesso === 'Administrador') setIsAdmin(true)
      })
      .catch(() => {})
  }, [])

  const carregarEscalas = () => {
    setLoading(true)
    fetch(`/api/escalas?mes=${mes + 1}&ano=${ano}`)
      .then(res => res.json())
      .then(data => {
        setEscalas(Array.isArray(data) ? data : [])
        setLoading(false)
      })
      .catch(() => {
        setEscalas([])
        setLoading(false)
      })
  }

  useEffect(() => { carregarEscalas() }, [mes, ano])

  const toggleConfirmacao = async (id: string, aberta: boolean) => {
    await fetch(`/api/escalas/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ confirmacao_aberta: !aberta }),
    })

    // Se está abrindo, dispara notificação
    if (!aberta) {
      await fetch('/api/push/notificar', { method: 'POST' })
    }

    carregarEscalas()
  }

  const datasPorSemana = escalas.reduce((acc, escala) => {
    const data = escala.data
    if (!acc[data]) acc[data] = []
    acc[data].push(escala)
    return acc
  }, {} as Record<string, Escala[]>)

  const formatarData = (dataStr: string) => {
    const data = new Date(dataStr + 'T12:00:00')
    const dia = data.getDate()
    const diaSemana = data.toLocaleDateString('pt-BR', { weekday: 'long' })
    return `${dia.toString().padStart(2, '0')}/${(mes + 1).toString().padStart(2, '0')} (${diaSemana})`
  }

  return (
    <div className="p-4 md:p-6">

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Escalas</h2>
          <p className="text-sm text-gray-500">{escalas.length} escalas em {meses[mes]} {ano}</p>
        </div>
        <div className="flex gap-2 items-center">
          <button onClick={() => {
            if (mes === 0) { setMes(11); setAno(ano - 1) } else setMes(mes - 1)
          }} className="px-3 py-2 bg-white border rounded-lg text-gray-600 hover:bg-gray-50">←</button>
          <span className="px-4 py-2 bg-white border rounded-lg font-medium text-gray-700 text-sm">
            {meses[mes]} {ano}
          </span>
          <button onClick={() => {
            if (mes === 11) { setMes(0); setAno(ano + 1) } else setMes(mes + 1)
          }} className="px-3 py-2 bg-white border rounded-lg text-gray-600 hover:bg-gray-50">→</button>
          <a href="/dashboard/escalas/nova"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition">
            + Nova Escala
          </a>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500">Carregando...</div>
      ) : escalas.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl shadow">
          <p className="text-4xl mb-3">📅</p>
          <p className="text-gray-500">Nenhuma escala em {meses[mes]} {ano}</p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(datasPorSemana)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([data, itens]) => (
              <div key={data} className="bg-white rounded-2xl shadow overflow-hidden">
                <div className="bg-blue-600 px-6 py-3">
                  <h3 className="text-white font-bold">{formatarData(data)}</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Grupo</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Local</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Hora</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Atendente(s)</th>
                        <th className="px-4 py-3"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {itens.map(escala => (
                        <tr key={escala.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm font-medium text-gray-800">{escala.grupo}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">{escala.local_texto}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">🕐 {escala.hora_inicio}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">👤 {escala.atendentes}</td>
                          <td className="px-4 py-3 flex items-center gap-2 flex-wrap">
                            <a href={`/dashboard/escalas/${escala.id}/editar`}
                              className="text-xs text-blue-600 hover:underline">Editar</a>
                            {isAdmin && (
                              <button
                                onClick={() => toggleConfirmacao(escala.id, escala.confirmacao_aberta)}
                                className={`text-xs font-semibold px-2 py-1 rounded-full transition ${
                                  escala.confirmacao_aberta
                                    ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}>
                                {escala.confirmacao_aberta ? '✅ Confirmações abertas' : 'Abrir confirmações'}
                              </button>
                            )}
                            {isAdmin && <BotaoExcluirEscala id={escala.id} />}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  )
}