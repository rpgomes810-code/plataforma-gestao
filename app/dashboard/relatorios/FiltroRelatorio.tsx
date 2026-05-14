'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function FiltroRelatorio({ periodoAtual, inicioAtual, fimAtual }: {
  periodoAtual: string
  inicioAtual?: string
  fimAtual?: string
}) {
  const router = useRouter()
  const [periodo, setPeriodo] = useState(periodoAtual)
  const [inicio, setInicio] = useState(inicioAtual || '')
  const [fim, setFim] = useState(fimAtual || '')

  const aplicar = () => {
    if (periodo === 'personalizado') {
      router.push(`/dashboard/relatorios?periodo=personalizado&inicio=${inicio}&fim=${fim}`)
    } else {
      router.push(`/dashboard/relatorios?periodo=${periodo}`)
    }
  }

  return (
    <div className="flex flex-wrap gap-2 items-end">
      <div>
        <select
          value={periodo}
          onChange={e => setPeriodo(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        >
          <option value="mes_atual">Mês atual</option>
          <option value="mes_anterior">Mês anterior</option>
          <option value="bimestre">Último bimestre</option>
          <option value="trimestre">Último trimestre</option>
          <option value="semestre">Último semestre</option>
          <option value="ano">Último ano</option>
          <option value="personalizado">Personalizado</option>
        </select>
      </div>

      {periodo === 'personalizado' && (
        <>
          <input
            type="date"
            value={inicio}
            onChange={e => setInicio(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="date"
            value={fim}
            onChange={e => setFim(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </>
      )}

      <button
        onClick={aplicar}
        className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition">
        Aplicar
      </button>
    </div>
  )
}