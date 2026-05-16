'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function BotaoConfirmar({ escalaid, membroid, confirmacaoAtual }: {
  escalaid: string
  membroid: string
  confirmacaoAtual: string | null
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [motivo, setMotivo] = useState('')
  const [mostraMotivo, setMostraMotivo] = useState(false)
  const [erro, setErro] = useState('')
  const [statusAtual, setStatusAtual] = useState(confirmacaoAtual)

  const confirmar = async (status: string) => {
    if (status === 'ausente' && !mostraMotivo) {
      setMostraMotivo(true)
      return
    }

    setLoading(true)
    setErro('')

    const res = await fetch('/api/confirmacoes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        escala_id: escalaid,
        membro_id: membroid,
        status,
        motivo: status === 'ausente' ? motivo : null,
      }),
    })

    if (res.ok) {
      setStatusAtual(status)
      setMostraMotivo(false)
      setMotivo('')
      router.refresh()
    } else {
      const data = await res.json()
      setErro(data.error || 'Erro ao confirmar')
    }

    setLoading(false)
  }

  if (statusAtual === 'confirmado') {
    return (
      <div className="flex items-center gap-3">
        <span className="text-sm text-green-600 font-semibold">✅ Você confirmou presença</span>
        <button onClick={() => confirmar('ausente')} className="text-xs text-gray-400 hover:text-gray-600">Cancelar</button>
      </div>
    )
  }

  if (statusAtual === 'ausente') {
    return (
      <div className="flex items-center gap-3">
        <span className="text-sm text-red-600 font-semibold">❌ Você informou ausência</span>
        <button onClick={() => confirmar('confirmado')} className="text-xs text-gray-400 hover:text-gray-600">Confirmar presença</button>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {erro && <p className="text-xs text-red-500">{erro}</p>}
      {mostraMotivo ? (
        <div className="space-y-2">
          <input
            type="text"
            value={motivo}
            onChange={e => setMotivo(e.target.value)}
            placeholder="Motivo da ausência (opcional)"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="flex gap-2">
            <button onClick={() => confirmar('ausente')} disabled={loading}
              className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-red-600 transition disabled:opacity-50">
              {loading ? 'Salvando...' : 'Confirmar ausência'}
            </button>
            <button onClick={() => setMostraMotivo(false)}
              className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-200 transition">
              Cancelar
            </button>
          </div>
        </div>
      ) : (
        <div className="flex gap-2">
          <button onClick={() => confirmar('confirmado')} disabled={loading}
            className="bg-green-500 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-green-600 transition disabled:opacity-50">
            {loading ? 'Salvando...' : '✅ Confirmar presença'}
          </button>
          <button onClick={() => confirmar('ausente')} disabled={loading}
            className="bg-red-50 text-red-600 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-red-100 transition disabled:opacity-50">
            ❌ Não poderei estar presente
          </button>
        </div>
      )}
    </div>
  )
}