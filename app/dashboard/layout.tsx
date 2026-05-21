'use client'

import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

const todosNavItems = [
  { href: '/dashboard',              icon: '⊞', label: 'Início',        key: null },
  { href: '/dashboard/confirmacoes', icon: '✓', label: 'Confirmações',  key: 'confirmacoes' },
  { href: '/dashboard/escalas',      icon: '◷', label: 'Escalas',       key: 'escalas' },
  { href: '/dashboard/registros',    icon: '≡', label: 'Registros',     key: 'registros' },
  { href: '/dashboard/relatorios',   icon: '↗', label: 'Relatórios',    key: 'relatorios' },
  { href: '/dashboard/membros',      icon: '◉', label: 'Membros',       key: 'membros' },
  { href: '/dashboard/hospitais',    icon: '⊕', label: 'Hospitais',     key: 'hospitais' },
  { href: '/dashboard/vagas',        icon: '◈', label: 'Vagas',         key: 'vagas' },
  { href: '/dashboard/solicitacoes', icon: '✉', label: 'Solicitações',  key: 'solicitacoes' },
  { href: '/dashboard/grupos',       icon: '◎', label: 'Grupos',        key: 'grupos' },
  { href: '/dashboard/logs',         icon: '◑', label: 'Logs',          key: 'logs' },
  { href: '/dashboard/permissoes',   icon: '⊙', label: 'Permissões',    key: null },
]

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
  const [navItems, setNavItems] = useState<typeof todosNavItems>([])
  const [permissoes, setPermissoes] = useState<any>(null)
  const [carregando, setCarregando] = useState(true)
  const [menuAberto, setMenuAberto] = useState(false)

  useEffect(() => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) return
    navigator.serviceWorker.register('/sw.js').catch(console.error)
    if (Notification.permission !== 'granted') setMostrarPopup(true)
  }, [])

  useEffect(() => {
    fetch('/api/membros/eu').then(r => r.json()).then(async membro => {
      const perms = membro.permissoes || {}
      setPermissoes(perms)

      const res = await fetch('/api/permissoes/acesso?membro_id=' + membro.id)
      const data = await res.json()

      const filtrado = todosNavItems.filter(item => {
        if (item.key === null) {
          if (item.href === '/dashboard/permissoes') return data.acesso
          return true
        }
        return perms[item.key]?.ver === true
      })

      setNavItems(filtrado)
      setCarregando(false)
    })
  }, [])

  const paginaAtual = todosNavItems.find(item => item.href === pathname)
  const semPermissao = !carregando && paginaAtual?.key && permissoes && !permissoes[paginaAtual.key]?.ver

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
    } catch (e) { console.error(e) }
    setAtivando(false)
  }

  if (carregando) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%)' }}>
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-blue-200 text-sm">Carregando...</p>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen flex" style={{ background: '#f0f4f8', fontFamily: "'DM Sans', sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />

      {/* Overlay mobile */}
      {menuAberto && (
        <div className="fixed inset-0 bg-black/50 z-30 md:hidden" onClick={() => setMenuAberto(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed top-0 left-0 h-full z-40 flex flex-col transition-transform duration-300 ease-in-out
        ${menuAberto ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0 md:static md:flex
        w-64 shrink-0`}
        style={{ background: 'linear-gradient(180deg, #0f172a 0%, #1e3a5f 100%)' }}>

        {/* Logo */}
        <div className="px-6 py-6 border-b border-white/10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-blue-300 uppercase tracking-widest font-semibold">DARPE</p>
              <h1 className="text-white font-bold text-base leading-tight mt-0.5">Setor 4 — Hospitais</h1>
            </div>
            <button onClick={() => setMenuAberto(false)} className="md:hidden text-white/50 hover:text-white">
              ✕
            </button>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map(item => {
            const active = pathname === item.href
            return (
              <a key={item.href} href={item.href}
                onClick={() => setMenuAberto(false)}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  active
                    ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30'
                    : 'text-blue-100/70 hover:bg-white/10 hover:text-white'
                }`}>
                <span className="text-lg">{item.icon}</span>
                <span>{item.label}</span>
                {active && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-white"></span>}
              </a>
            )
          })}
        </nav>

        {/* Sair */}
        <div className="px-3 py-4 border-t border-white/10">
          <a href="/" className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-red-300/70 hover:bg-red-500/20 hover:text-red-300 transition-all">
            <span>⬡</span>
            <span>Sair</span>
          </a>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Header mobile */}
        <header className="md:hidden sticky top-0 z-20 px-4 py-3 flex items-center justify-between"
          style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%)' }}>
          <button onClick={() => setMenuAberto(true)} className="text-white p-1">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="3" y1="6" x2="21" y2="6"/>
              <line x1="3" y1="12" x2="21" y2="12"/>
              <line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
          </button>
          <div className="text-center">
            <p className="text-xs text-blue-300 uppercase tracking-widest">DARPE</p>
            <p className="text-white font-bold text-sm">Setor 4 — Hospitais</p>
          </div>
          <a href="/" className="text-red-300 text-xs">Sair</a>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto">
          {mostrarPopup && (
            <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-sm text-center">
                <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">🔔</span>
                </div>
                <h2 className="text-xl font-bold text-gray-800 mb-2">Ativar notificações</h2>
                <p className="text-sm text-gray-500 mb-6">Receba avisos quando o admin abrir as confirmações de presença.</p>
                <button onClick={ativarNotificacoes} disabled={ativando}
                  className="w-full text-white py-3 rounded-xl font-semibold transition text-sm disabled:opacity-50"
                  style={{ background: 'linear-gradient(135deg, #1e40af, #3b82f6)' }}>
                  {ativando ? 'Ativando...' : '🔔 Ativar notificações'}
                </button>
              </div>
            </div>
          )}

          {semPermissao ? (
            <div className="flex items-center justify-center h-full py-24">
              <div className="text-center">
                <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                  <span className="text-4xl">🔒</span>
                </div>
                <p className="text-gray-500 font-medium">Você não tem acesso a esta página</p>
              </div>
            </div>
          ) : children}
        </main>
      </div>
    </div>
  )
}