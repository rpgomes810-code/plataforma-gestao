'use client'

import { useEffect, useState } from 'react'

export default function BotaoNotificacao({ membroId }: { membroId: string }) {
  const [ativo, setAtivo] = useState(false)
  const [carregando, setCarregando] = useState(false)

  useEffect(() => {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      navigator.serviceWorker.register('/sw.js')
    }

    Notification.requestPermission().then(perm => {
      if (perm === 'granted') setAtivo(true)
    })
  }, [])

  const ativar = async () => {
    setCarregando(true)
    try {
      const reg = await navigator.serviceWorker.ready
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
      })

      await fetch('/api/push/assinar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscription: sub, membro_id: membroId })
      })

      setAtivo(true)
    } catch (e) {
      alert('Erro ao ativar notificações.')
    }
    setCarregando(false)
  }

  if (ativo) return <p className="text-xs text-green-600">🔔 Notificações ativadas</p>

  return (
    <button
      onClick={ativar}
      disabled={carregando}
      className="text-xs bg-blue-600 text-white px-3 py-1 rounded-full hover:bg-blue-700 transition"
    >
      {carregando ? 'Ativando...' : '🔔 Ativar notificações'}
    </button>
  )
}