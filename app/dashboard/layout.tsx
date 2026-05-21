'use client'

import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

const todosNavItems = [
  { href: '/dashboard',              icon: '📊', label: 'Início',        key: null },
  { href: '/dashboard/confirmacoes', icon: '✅', label: 'Confirmações',  key: 'confirmacoes' },
  { href: '/dashboard/escalas',      icon: '📅', label: 'Escalas',       key: 'escalas' },
  { href: '/dashboard/registros',    icon: '📋', label: 'Registros',     key: 'registros' },
  { href: '/dashboard/relatorios',   icon: '📈', label: 'Relatórios',    key: 'relatorios' },
  { href: '/dashboard/membros',      icon: '👥', label: 'Membros',       key: 'membros' },
  { href: '/dashboard/hospitais',    icon: '🏥', label: 'Hospitais',     key: 'hospitais' },
  { href: '/dashboard/vagas',        icon: '⚠️', label: 'Vagas',         key: 'vagas' },
  { href: '/dashboard/solicitacoes', icon: '📩', label: 'Solicitações',  key: 'solicitacoes' },
  { href: '/dashboard/grupos',       icon: '🎻', label: 'Grupos',        key: 'grupos' },
  { href: '/dashboard/logs',         icon: '📋', label: 'Logs',          key: 'logs' },
  { href: '/dashboard/permissoes',   icon: '🔐', label: 'Permissões',    key: null },
]

function NavLink({ href, icon, label, active }: { href: string; icon: string; label: string; active: boolean }) {
  return (
    <a href={href} className={`flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium ${active ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-100'}`}>
      {icon} {label}
    </a>
  )
}

function BottomNavLink({ href, icon, label, active }: { href: string; icon: string; label: string; active: boolean }) {
  return (
    <a href={href} className={`flex flex-col items-center gap-0.5 px-1 py-1 ${active ? 'text-blue-600 font-semibold' : 'text-gray-500'}`} style={{ minWidth: 0 }}>
      <span className="text-xl">{icon}</span>
      <span className="text-[10px] truncate w-full text-center">{label}</span>
    </a>
  )
}

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; ++i) outputArray[i] = rawData.charCodeAt(i)
  return outputArray
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [mostrarPopup, setMostrarPopup] = useState(false)
  const [ativando, setAtivando] = useState(false)
  const [navItems, setNavItems] = useState(todosNavItems)
  const [temAcessoPermissoes, setTemAcessoPermissoes] = useState(false)

  useEffect(() => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) return
    navigator.serviceWorker.register('/sw.js').catch(console.error)
    if (Notification.permission !== 'granted') setMostrarPopup(true)
  }, [])

  useEffect(() => {
    fetch('/api/membros/eu').then(r => r.json()).then(async membro => {
      const permissoes = membro.permissoes || {}

      // Verifica acesso à tela de permissões
      const res = await fetch('/api/permissoes/acesso?membro_id=' + membro.id)
      const data = await res.json()
      setTemAcessoPermissoes(data.acesso)

      // Filtra menu
      const filtrado = todosNavItems.filter(item => {
        if (item.key === null) {
          if (item.href === '/dashboard/permissoes') return data.acesso
          return true // Início sempre aparece
        }
        return permissoes[item.key]?.ver === true
      })

      setNavItems(filtrado)
    })
  }, [])

  const ativarNotificacoes = async () => {
    setAtivando(true)
    try {
      const permission = await Notification.requestPermission()
      if (permission !== 'granted') { setAtivando(false); return }

      const membroRes = await fetch('/api/membros/eu')
      const membro = await membroRes.json()

      const reg = await navigator.serviceWorker.ready
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!)
      })

      await fetch('/api/push/assinar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscription: sub.toJSON(), membro_id: membro.id })
      })

      setMostrarPopup(false)
    } catch (e) {
      console.error(e)
    }
    setAtivando(false)
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col md:flex-row">

      {mostrarPopup && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-sm text-center">
            <p className="text-5xl mb-4">🔔</p>
            <h2 className="text-xl font-bold text-gray-800 mb-2">Ativar notificações</h2>
            <p className="text-sm text-gray-500 mb-6">Receba avisos quando o admin abrir as confirmações de presença.</p>
            <button onClick={ativarNotificacoes} disabled={ativando}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition text-sm disabled:opacity-50">
              {ativando ? 'Ativando...' : '🔔 Ativar notificações'}
            </button>
          </div>
        </div>
      )}

      <aside className="hidden md:flex w-64 bg-white shadow-md flex-col shrink-0">
        <div className="px-6 py-5 border-b">
          <p className="text-xs text-gray-400 uppercase tracking-wider">DARPE</p>
          <h1 className="text-lg font-bold text-gray-800">Setor 4 — Hospitais</h1>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-1">
          {navItems.map(item => (
            <NavLink key={item.href} {...item} active={pathname === item.href} />
          ))}
        </nav>
        <div className="px-4 py-4 border-t">
          <a href="/" className="flex items-center gap-3 px-4 py-2 rounded-lg text-red-500 hover:bg-red-50 text-sm">
            🚪 Sair
          </a>
        </div>
      </aside>

      <div className="flex-1 flex flex-col">
        <header className="md:hidden bg-white shadow px-4 py-3 flex justify-between items-center">
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wider">DARPE</p>
            <h1 className="text-base font-bold text-gray-800">Setor 4 — Hospitais</h1>
          </div>
          <a href="/" className="text-red-500 text-sm">🚪 Sair</a>
        </header>

        <main className="flex-1 pb-20 md:pb-0">
          {children}
        </main>

        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg md:hidden z-50">
          <div className="flex justify-around items-center py-1 px-1">
            {navItems.map(item => (
              <BottomNavLink key={item.href} {...item} active={pathname === item.href} />
            ))}
          </div>
        </nav>
      </div>
    </div>
  )
}