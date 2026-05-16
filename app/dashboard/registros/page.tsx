'use client'

import { useState, useEffect } from 'react'
import BotaoExcluirRegistro from './BotaoExcluirRegistro'

const meses = [
  'Janeiro','Fevereiro','Março','Abril','Maio','Junho',
  'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'
]

export default function Registros() {
  const hoje = new Date()
  const [mes, setMes] = useState(hoje.getMonth())
  const [ano, setAno] = useState(hoje.getFullYear())
  const [registros, setRegistros] = useState<any[]>([])
  const [pendentes, setPendentes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    fetch('/api/membros/eu')
      .then(res => res.json())
      .then(data => {
        if (data?.nivel_acesso === 'Administrador') setIsAdmin(true)
      })
      .catch(() => {})

    fetch('/api/escalas/pendentes')
      .then(res => res.json())
      .then(data => setPendentes(Array.isArray(data) ? data : []))
  }, [])

  useEffect(() => {
    setLoading(true)
    fetch(`/api/registros?mes=${mes + 1}&ano=${ano}`)
      .then(res => res.json())
      .then(data => {
        setRegistros(Array.isArray(data) ? data : [])
        setLoading(false)
      })
      .catch(() => {
        setRegistros([])
        setLoading(false)
      })
  }, [mes, ano])

  const formatarData = (data: string) => {
    return new Date(data + 'T12:00:00').toLocaleDateString('pt-BR')
  }

  return (
    <div className="p-4 md:p-6">

      {/* Pendentes de registro */}
      {pendentes.length > 0 && (
        <div className="mb-8">
          <h3 className="text-base font-bold text-red-600 mb-3">⚠️ Escalas pendentes de registro ({pendentes.length})</h3>
          <div className="space-y-3">
            {pendentes.map((escala: any) => (
              <div key={escala.id} className="bg-red-50 rounded-2xl p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-800">{escala.grupo} — {escala.hospitais?.nome || escala.local_texto}</p>
                  <p className="text-xs text-gray-500">{formatarData(escala.data)} · {escala.hora_inicio}</p>
                </div>
                
                  href={`/dashboard/registros/novo?escala_id=${escala.id}&hospital_id=${escala.hospital_id}&data=${escala.data}`}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg text-xs font-semibold hover:bg-red-700 transition"
                >
                  Registrar
                </a>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Registros de Atendimento</h2>
          <p className="text-sm text-gray-500">{registros.length} registros em {meses[mes]} {ano}</p>
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
          <a href="/dashboard/registros/novo"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition">
            + Novo Registro
          </a>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500">Carregando...</div>
      ) : registros.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl shadow">
          <p className="text-4xl mb-3">📋</p>
          <p className="text-gray-500">Nenhum registro em {meses[mes]} {ano}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {registros.map(registro => (
            <div key={registro.id} className="bg-white rounded-2xl shadow p-5">
              <div className="flex flex-col md:flex-row justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white text-lg">
                        🏥
                      </div>
                      <div>
                        <p className="font-bold text-gray-800">{registro.hospitais?.nome || '—'}</p>
                        <p className="text-xs text-gray-400">{formatarData(registro.data)} · {registro.hora_inicio} às {registro.hora_termino}</p>
                      </div>
                    </div>
                    {isAdmin && (
                      <div className="flex items-center gap-2">
                        <a href={`/dashboard/registros/${registro.id}/editar`}
                          className="text-xs font-semibold px-3 py-1 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100 transition">
                          Editar
                        </a>
                        <BotaoExcluirRegistro id={registro.id} hospital={registro.hospitais?.nome || '—'} />
                      </div>
                    )}
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                    <div>
                      <p className="text-gray-400 text-xs">Autorizou entrada</p>
                      <p className="text-gray-700 font-medium">👤 {registro.quem_autorizou || '—'}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-xs">Membros presentes</p>
                      <p className="text-gray-700 font-medium">👥 {registro.membros_presentes || '—'}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-xs">Hinos executados</p>
                      <p className="text-gray-700 font-medium">🎵 {registro.hinos_executados}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-xs">Oração</p>
                      <p className="text-gray-700 font-medium">{registro.teve_oracao ? '✅ Sim' : '❌ Não'}</p>
                    </div>
                  </div>
                  {registro.observacoes && (
                    <div className="mt-3 text-sm text-gray-500 bg-gray-50 rounded-lg p-2">
                      💬 {registro.observacoes}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}