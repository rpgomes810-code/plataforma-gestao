'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function BotaoAbrirConfirmacao({ id, aberta }: { id: string, aberta: boolean }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const alternar = async () => {
    setLoading(true)
    await fetch(`/api/escalas/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ confirmacao_aberta: !aberta }),
    })

    // Se está abrindo (estava fechada), dispara notificação
    if (!aberta) {
      await fetch('/api/push/notificar', { method: 'POST' })
    }

    setLoading(false)
    router.refresh()
  }

  return (
    <button onClick={alternar} disabled={loading}
      className={`text-xs font-semibold px-3 py-1 rounded-full transition ${
        aberta
          ? 'bg-white text-blue-600 hover:bg-blue-50'
          : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
      }`}>
      {loading ? '...' : aberta ? 'Fechar confirmações' : 'Abrir confirmações'}
    </button>
  )
}