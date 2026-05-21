'use client'

import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

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
  const router = useRouter()
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
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#0f172a' }}>
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-sm" style={{ color: '#64748b' }}>Carregando...</p>
      </div>
    </div>
  )

  const isDashboardHome = pathname === '/dashboard'

  return (
    <div className="min-h-screen flex" style={{ background: '#0f172a' }}>

      {/* Overlay mobile */}
      {menuAberto && (
        <div className="fixed inset-0 bg-black/60 z-30 md:hidden" onClick={() => setMenuAberto(false)} />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-40 flex flex-col transition-transform duration-300 ease-in-out
          ${menuAberto ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0 md:static md:flex
          w-64 shrink-0`}
        style={{
          background: 'linear-gradient(180deg, #0f172a 0%, #1a2d4a 100%)',
          borderRight: '1px solid rgba(255,255,255,0.06)',
          minHeight: '100vh',
          height: '100%',
        }}
      >
        {/* Logo */}
        <div className="px-6 py-6" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-widest font-semibold mb-0.5" style={{ color: '#3b82f6' }}>DARPE</p>
              <h1 className="font-bold text-base leading-tight" style={{ color: '#f1f5f9' }}>Setor 4 — Hospitais</h1>
            </div>
            <button onClick={() => setMenuAberto(false)} className="md:hidden" style={{ color: '#475569' }}>✕</button>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {navItems.map(item => {
            const active = pathname === item.href
            return (
              <a key={item.href} href={item.href}
                onClick={() => setMenuAberto(false)}
                className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200"
                style={{
                  background: active ? 'rgba(59,130,246,0.15)' : 'transparent',
                  color: active ? '#60a5fa' : '#64748b',
                  borderLeft: active ? '2px solid #3b82f6' : '2px solid transparent',
                }}>
                <span className="text-base">{item.icon}</span>
                <span>{item.label}</span>
              </a>
            )
          })}
        </nav>

        {/* Sair */}
        <div className="px-3 py-4" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <a href="/"
            className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all"
            style={{ color: '#ef4444' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            <span>Sair</span>
          </a>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0" style={{ background: '#0f172a' }}>

        {/* Header mobile */}
        <header className="md:hidden sticky top-0 z-20 px-4 py-3 flex items-center gap-3"
          style={{ background: '#0f172a', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <button onClick={() => setMenuAberto(true)} style={{ color: '#64748b' }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="3" y1="6" x2="21" y2="6"/>
              <line x1="3" y1="12" x2="21" y2="12"/>
              <line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
          </button>

          {!isDashboardHome && (
            <button onClick={() => router.back()} style={{ color: '#64748b' }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6"/>
              </svg>
            </button>
          )}

          <div className="flex-1 text-center">
            <p className="text-xs uppercase tracking-widest font-semibold" style={{ color: '#3b82f6' }}>DARPE</p>
            <p className="text-sm font-bold" style={{ color: '#f1f5f9' }}>Setor 4 — Hospitais</p>
          </div>

          <a href="/" style={{ color: '#ef4444', fontSize: '12px' }}>Sair</a>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto">
          {mostrarPopup && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)' }}>
              <div className="rounded-2xl p-8 w-full max-w-sm text-center" style={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)' }}>
                <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: 'rgba(59,130,246,0.1)' }}>
                  <span className="text-3xl">🔔</span>
                </div>
                <h2 className="text-xl font-bold mb-2" style={{ color: '#f1f5f9' }}>Ativar notificações</h2>
                <p className="text-sm mb-6" style={{ color: '#64748b' }}>Receba avisos quando o admin abrir as confirmações de presença.</p>
                <button onClick={ativarNotificacoes} disabled={ativando}
                  className="w-full py-3 rounded-xl font-semibold text-white text-sm transition disabled:opacity-50"
                  style={{ background: 'linear-gradient(135deg, #1e40af, #3b82f6)' }}>
                  {ativando ? 'Ativando...' : '🔔 Ativar notificações'}
                </button>
              </div>
            </div>
          )}

          {semPermissao ? (
            <div className="flex items-center justify-center h-full py-24">
              <div className="text-center">
                <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: 'rgba(255,255,255,0.05)' }}>
                  <span className="text-4xl">🔒</span>
                </div>
                <p className="font-medium" style={{ color: '#64748b' }}>Você não tem acesso a esta página</p>
              </div>
            </div>
          ) : children}
        </main>
      </div>
    </div>
  )
}