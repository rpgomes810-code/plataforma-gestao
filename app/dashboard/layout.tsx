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
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f172a' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 48, height: 48, border: '4px solid #3b82f6', borderTopColor: 'transparent', borderRadius: '50%', margin: '0 auto 16px', animation: 'spin 1s linear infinite' }}></div>
        <p style={{ color: '#64748b', fontSize: 14 }}>Carregando...</p>
      </div>
    </div>
  )

  const isDashboardHome = pathname === '/dashboard'

  const sidebarStyle: React.CSSProperties = {
    width: 256,
    minHeight: '100vh',
    background: 'linear-gradient(180deg, #0f172a 0%, #1a2d4a 100%)',
    borderRight: '1px solid rgba(255,255,255,0.06)',
    display: 'flex',
    flexDirection: 'column',
    flexShrink: 0,
  }

  const navLinkStyle = (active: boolean): React.CSSProperties => ({
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '10px 16px',
    borderRadius: 12,
    fontSize: 14,
    fontWeight: 500,
    textDecoration: 'none',
    background: active ? 'rgba(59,130,246,0.15)' : 'transparent',
    color: active ? '#60a5fa' : '#64748b',
    borderLeft: active ? '2px solid #3b82f6' : '2px solid transparent',
    transition: 'all 0.2s',
  })

  const SidebarContent = ({ onClose }: { onClose?: () => void }) => (
    <>
      <div style={{ padding: '24px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <p style={{ color: '#3b82f6', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600, marginBottom: 4 }}>DARPE</p>
          <h1 style={{ color: '#f1f5f9', fontWeight: 700, fontSize: 15, margin: 0 }}>Setor 4 — Hospitais</h1>
        </div>
        {onClose && (
          <button onClick={onClose} style={{ color: '#475569', background: 'none', border: 'none', cursor: 'pointer', fontSize: 20 }}>✕</button>
        )}
      </div>
      <nav style={{ flex: 1, padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: 2, overflowY: 'auto' }}>
        {navItems.map(item => (
          <a key={item.href} href={item.href} onClick={onClose}
            style={navLinkStyle(pathname === item.href)}>
            <span style={{ fontSize: 16 }}>{item.icon}</span>
            <span>{item.label}</span>
          </a>
        ))}
      </nav>
      <div style={{ padding: 12, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <a href="/" style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 16px', borderRadius: 12, fontSize: 14, fontWeight: 500, textDecoration: 'none', color: '#ef4444' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <polyline points="16 17 21 12 16 7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
          <span>Sair</span>
        </a>
      </div>
    </>
  )

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0f172a' }}>

      {/* Overlay mobile */}
      {menuAberto && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 30 }}
          onClick={() => setMenuAberto(false)} />
      )}

      {/* Sidebar mobile */}
      {menuAberto && (
        <div style={{ ...sidebarStyle, position: 'fixed', top: 0, left: 0, height: '100vh', zIndex: 40 }}>
          <SidebarContent onClose={() => setMenuAberto(false)} />
        </div>
      )}

      {/* Sidebar desktop */}
      <div style={{...sidebarStyle, display: 'none'}} className="md:flex md:flex-col">
        <SidebarContent />
      </div>

      {/* Main */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>

        {/* Header mobile */}
        <header className="md:hidden" style={{
          position: 'sticky', top: 0, zIndex: 20,
          padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12,
          background: '#0f172a', borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}>
          <button onClick={() => setMenuAberto(true)} style={{ color: '#64748b', background: 'none', border: 'none', cursor: 'pointer' }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="3" y1="6" x2="21" y2="6"/>
              <line x1="3" y1="12" x2="21" y2="12"/>
              <line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
          </button>
          {!isDashboardHome && (
            <button onClick={() => router.back()} style={{ color: '#64748b', background: 'none', border: 'none', cursor: 'pointer' }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6"/>
              </svg>
            </button>
          )}
          <div style={{ flex: 1, textAlign: 'center' }}>
            <p style={{ color: '#3b82f6', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600, margin: 0 }}>DARPE</p>
            <p style={{ color: '#f1f5f9', fontWeight: 700, fontSize: 14, margin: 0 }}>Setor 4 — Hospitais</p>
          </div>
          <a href="/" style={{ color: '#ef4444', fontSize: 12, textDecoration: 'none' }}>Sair</a>
        </header>

        <main style={{ flex: 1, overflow: 'auto' }}>
          {mostrarPopup && (
            <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
              <div style={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, padding: 32, width: '100%', maxWidth: 360, textAlign: 'center' }}>
                <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(59,130,246,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                  <span style={{ fontSize: 28 }}>🔔</span>
                </div>
                <h2 style={{ color: '#f1f5f9', fontWeight: 700, fontSize: 20, marginBottom: 8 }}>Ativar notificações</h2>
                <p style={{ color: '#64748b', fontSize: 14, marginBottom: 24 }}>Receba avisos quando o admin abrir as confirmações de presença.</p>
                <button onClick={ativarNotificacoes} disabled={ativando}
                  style={{ width: '100%', padding: 12, borderRadius: 12, border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 14, color: 'white', background: 'linear-gradient(135deg, #1e40af, #3b82f6)', opacity: ativando ? 0.5 : 1 }}>
                  {ativando ? 'Ativando...' : '🔔 Ativar notificações'}
                </button>
              </div>
            </div>
          )}

          {semPermissao ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '96px 0' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                  <span style={{ fontSize: 36 }}>🔒</span>
                </div>
                <p style={{ color: '#64748b', fontWeight: 500 }}>Você não tem acesso a esta página</p>
              </div>
            </div>
          ) : children}
        </main>
      </div>
    </div>
  )
}