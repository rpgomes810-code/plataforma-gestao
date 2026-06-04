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
  const [carregando, setCarregando] = useState(true)
  const [suportado, setSuportado] = useState(true)

  useEffect(() => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      setSuportado(false)
      setCarregando(false)
      return
    }

    const verificar = async () => {
      try {
        const reg = await navigator.serviceWorker.register('/sw.js')
        await navigator.serviceWorker.ready

        // Verifica se já existe uma assinatura ativa no dispositivo
       
       
       
        const subExistente = await reg.pushManager.getSubscription()

if (subExistente && Notification.permission === 'granted') {
  // Testa se a assinatura ainda é válida pingando o servidor
  const res = await fetch('/api/push/verificar', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ subscription: subExistente.toJSON(), membro_id: membroId })
  })
  if (res.ok) {
    setAtivo(true)
  } else {
    // Assinatura inválida — cancela e pede para reativar
    await subExistente.unsubscribe()
    setAtivo(false)
  }
} else {
  setAtivo(false)
}







      } catch (e) {
        console.error(e)
        setAtivo(false)
      }
      setCarregando(false)
    }

    verificar()
  }, [membroId])

  const ativar = async () => {
    setCarregando(true)
    try {
      let permission: NotificationPermission
      if (typeof Notification.requestPermission === 'function') {
        const result = Notification.requestPermission()
        if (result && typeof (result as any).then === 'function') {
          permission = await result
        } else {
          permission = result as unknown as NotificationPermission
        }
      } else {
        alert('Notificações não suportadas neste navegador.')
        setCarregando(false)
        return
      }

      if (permission !== 'granted') {
        alert('Permissão negada. Verifique as configurações do navegador.')
        setCarregando(false)
        return
      }

      const reg = await navigator.serviceWorker.ready

      // Cancela assinatura antiga se existir
      const subAntiga = await reg.pushManager.getSubscription()
      if (subAntiga) await subAntiga.unsubscribe()

      // Cria nova assinatura
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
      alert('Erro ao ativar notificações. Tente pelo Chrome ou Firefox.')
    }
    setCarregando(false)
  }

  if (!suportado) return null
  if (carregando) return <p className="text-xs text-gray-400">Verificando notificações...</p>
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