'use client'

import { useEffect, useState } from 'react'

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

export default function BotaoNotificacao({ membroId }: { membroId: string }) {
  const [ativo, setAtivo] = useState(false)
  const [carregando, setCarregando] = useState(false)
  const [suportado, setSuportado] = useState(true)

  useEffect(() => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      setSuportado(false)
      return
    }
    navigator.serviceWorker.register('/sw.js')
    if (Notification.permission === 'granted') setAtivo(true)
  }, [])

  const ativar = async () => {
    setCarregando(true)
    try {
      const reg = await navigator.serviceWorker.ready
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
      })

      const res = await fetch('/api/push/assinar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscription: sub.toJSON(), membro_id: membroId })
      })

      if (res.ok) setAtivo(true)
      else alert('Erro ao salvar assinatura.')
    } catch (e) {
      console.error(e)
      alert('Erro ao ativar notificações.')
    }
    setCarregando(false)
  }

  if (!suportado) return null
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