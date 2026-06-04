'use client'

import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

const todosNavItems = [
  { href: '/dashboard',              label: 'Início',        key: null },
  { href: '/dashboard/confirmacoes', label: 'Confirmações',  key: 'confirmacoes' },
  { href: '/dashboard/escalas',      label: 'Escalas',       key: 'escalas' },
  { href: '/dashboard/registros',    label: 'Registros',     key: 'registros' },
  { href: '/dashboard/historico',    label: 'Histórico',     key: 'historico' },
  { href: '/dashboard/relatorios',   label: 'Relatórios',    key: 'relatorios' },
  { href: '/dashboard/membros',      label: 'Membros',       key: 'membros' },
  { href: '/dashboard/hospitais',    label: 'Hospitais',     key: 'hospitais' },
  { href: '/dashboard/vagas',        label: 'Vagas',         key: 'vagas' },
  { href: '/dashboard/solicitacoes', label: 'Solicitações',  key: 'solicitacoes' },
  { href: '/dashboard/comunicados',  label: 'Comunicados',   key: 'comunicados' },
  { href: '/dashboard/grupos',       label: 'Grupos',        key: 'grupos' },
  { href: '/dashboard/logs',         label: 'Logs',          key: 'logs' },
  { href: '/dashboard/permissoes',   label: 'Permissões',    key: null },
]

const icons: Record<string, React.ReactNode> = {
  '/dashboard': <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>,
  '/dashboard/confirmacoes': <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
  '/dashboard/escalas': <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  '/dashboard/registros': <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>,
  '/dashboard/historico': <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 8 12 12 14 14"/></svg>,
  '/dashboard/relatorios': <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
  '/dashboard/membros': <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  '/dashboard/hospitais': <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  '/dashboard/vagas': <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
  '/dashboard/solicitacoes': <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>,
  '/dashboard/comunicados': <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
  '/dashboard/grupos': <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>,
  '/dashboard/logs': <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  '/dashboard/permissoes': <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>,
}

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; ++i) outputArray[i] = rawData.charCodeAt(i)
  return outputArray
}

function NavItem({ href, label, active, onClick }: { href: string; label: string; active: boolean; onClick?: () => void }) {
  const [hovered, setHovered] = useState(false)
  return (
    <a
      href={href}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '9px 12px', borderRadius: 8,
        fontSize: 14, fontWeight: active ? 600 : 400,
        textDecoration: 'none',
        background: active ? '#eff6ff' : hovered ? '#f8fafc' : 'transparent',
        color: active ? '#1e40af' : hovered ? '#334155' : '#64748b',
        transition: 'all 0.15s',
      }}
    >
      <span style={{ color: active ? '#1e40af' : hovered ? '#475569' : '#94a3b8', flexShrink: 0 }}>{icons[href]}</span>
      <span>{label}</span>
    </a>
  )
}

function Sidebar({ navItems, pathname, onClose }: { navItems: typeof todosNavItems; pathname: string; onClose?: () => void }) {
  return (
    <div style={{ width: 220, height: '100%', minHeight: '100vh', background: '#ffffff', borderRight: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '20px 16px 16px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <p style={{ color: '#1e40af', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 700, margin: 0 }}>DARPE</p>
          <h1 style={{ color: '#0f172a', fontWeight: 700, fontSize: 14, margin: '3px 0 0', lineHeight: 1.3 }}>Setor 4 — Hospitais</h1>
        </div>
        {onClose && (
          <button onClick={onClose} style={{ color: '#94a3b8', background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, lineHeight: 1 }}>✕</button>
        )}
      </div>
      <nav style={{ flex: 1, padding: '8px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 1 }}>
        {navItems.map(item => (
          <NavItem key={item.href} href={item.href} label={item.label} active={pathname === item.href} onClick={onClose} />
        ))}
      </nav>
      <div style={{ padding: '8px', borderTop: '1px solid #e2e8f0' }}>
        <a href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', borderRadius: 8, fontSize: 14, fontWeight: 500, textDecoration: 'none', color: '#ef4444' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <polyline points="16 17 21 12 16 7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
          <span>Sair</span>
        </a>
      </div>
    </div>
  )
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
  const [isMobile, setIsMobile] = useState(false)

  // Ciência
  const [comunicadosPendentes, setComunicadosPendentes] = useState<any[]>([])
const [acessoBloqueado, setAcessoBloqueado] = useState(false)
  const [comunicadoAtual, setComunicadoAtual] = useState<any>(null)
  const [marcandoCiente, setMarcandoCiente] = useState(false)

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  useEffect(() => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) return
    navigator.serviceWorker.register('/sw.js').catch(console.error)
    if (Notification.permission !== 'granted') setMostrarPopup(true)
  }, [])

  useEffect(() => {
  fetch('/api/membros/eu').then(r => r.json()).then(async membro => {
    if (membro.acesso_bloqueado) setAcessoBloqueado(true)
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

  // Busca comunicados pendentes de ciência ao carregar
  useEffect(() => {
    fetch('/api/comunicados/pendentes')
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setComunicadosPendentes(data)
          setComunicadoAtual(data[0])
        }
      })
      .catch(() => {})
  }, [])

  const confirmarCiencia = async () => {
    if (!comunicadoAtual) return
    setMarcandoCiente(true)
    await fetch('/api/comunicados/ciente', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ comunicado_id: comunicadoAtual.id }),
    })
    const restantes = comunicadosPendentes.filter(c => c.id !== comunicadoAtual.id)
    setComunicadosPendentes(restantes)
    setComunicadoAtual(restantes.length > 0 ? restantes[0] : null)
    setMarcandoCiente(false)
  }

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
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f1f5f9' }}>
      <div style={{ textAlign: 'center' }}>
        <div className="animate-spin" style={{ width: 40, height: 40, border: '3px solid #1e40af', borderTopColor: 'transparent', borderRadius: '50%', margin: '0 auto 12px' }}></div>
        <p style={{ color: '#64748b', fontSize: 14 }}>Carregando...</p>
      </div>
    </div>
  )

  const isDashboardHome = pathname === '/dashboard'

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f1f5f9' }}>

      {/* Overlay mobile */}
      {menuAberto && isMobile && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.4)', zIndex: 30 }}
          onClick={() => setMenuAberto(false)} />
      )}

      {/* Sidebar mobile */}
      {menuAberto && isMobile && (
        <div style={{ position: 'fixed', top: 0, left: 0, height: '100vh', zIndex: 40 }}>
          <Sidebar navItems={navItems} pathname={pathname} onClose={() => setMenuAberto(false)} />
        </div>
      )}

      {/* Sidebar desktop */}
      {!isMobile && (
        <div style={{ flexShrink: 0, position: 'sticky', top: 0, height: '100vh' }}>
          <Sidebar navItems={navItems} pathname={pathname} />
        </div>
      )}

      {/* Main */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' }}>

        {/* Header mobile */}
        {isMobile && (
          <header style={{ position: 'sticky', top: 0, zIndex: 20, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12, background: '#ffffff', borderBottom: '1px solid #e2e8f0' }}>
            <button onClick={() => setMenuAberto(true)} style={{ color: '#64748b', background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
              </svg>
            </button>
            {!isDashboardHome && (
              <button onClick={() => router.back()} style={{ color: '#64748b', background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15 18 9 12 15 6"/>
                </svg>
              </button>
            )}
            <div style={{ flex: 1, textAlign: 'center' }}>
              <p style={{ color: '#1e40af', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 700, margin: 0 }}>DARPE</p>
              <p style={{ color: '#0f172a', fontWeight: 700, fontSize: 14, margin: 0 }}>Setor 4 — Hospitais</p>
            </div>
            <a href="/" style={{ color: '#ef4444', fontSize: 12, textDecoration: 'none', fontWeight: 500 }}>Sair</a>
          </header>
        )}

        <main style={{ flex: 1, overflow: 'auto' }}>

          {/* MODAL NOTIFICAÇÕES */}
          {mostrarPopup && !comunicadoAtual && (
            <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
              <div style={{ background: '#ffffff', borderRadius: 16, padding: 32, width: '100%', maxWidth: 360, textAlign: 'center', boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }}>
                <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                  <span style={{ fontSize: 28 }}>🔔</span>
                </div>
                <h2 style={{ color: '#0f172a', fontWeight: 700, fontSize: 20, marginBottom: 8 }}>Ativar notificações</h2>
                <p style={{ color: '#64748b', fontSize: 14, marginBottom: 24 }}>Receba avisos quando o admin abrir as confirmações de presença.</p>
                <button onClick={ativarNotificacoes} disabled={ativando}
                  style={{ width: '100%', padding: 12, borderRadius: 10, border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 14, color: 'white', background: '#1e40af', opacity: ativando ? 0.5 : 1 }}>
                  {ativando ? 'Ativando...' : '🔔 Ativar notificações'}
                </button>
              </div>
            </div>
          )}

          {/* MODAL CIÊNCIA COMUNICADO */}
          {comunicadoAtual && (
            <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
              <div style={{ background: '#ffffff', borderRadius: 16, width: '100%', maxWidth: 480, boxShadow: '0 20px 60px rgba(0,0,0,0.2)', overflow: 'hidden' }}>

                {/* Cabeçalho */}
                <div style={{ background: '#1e3a5f', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 18 }}>📢</span>
                    <span style={{ color: '#fff', fontWeight: 700, fontSize: 14 }}>Comunicado</span>
                  </div>
                  {comunicadosPendentes.length > 1 && (
                    <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>
                      {comunicadosPendentes.indexOf(comunicadoAtual) + 1} de {comunicadosPendentes.length}
                    </span>
                  )}
                </div>

                {/* Conteúdo */}
                <div style={{ padding: '24px 24px 20px' }}>
                  <h3 style={{ fontSize: 17, fontWeight: 800, color: '#1e293b', margin: '0 0 12px' }}>{comunicadoAtual.titulo}</h3>
                  <p style={{ fontSize: 14, color: '#475569', lineHeight: 1.7, margin: '0 0 20px', maxHeight: 200, overflowY: 'auto' }}>
                    {comunicadoAtual.conteudo}
                  </p>
                 
                  <button
                    onClick={confirmarCiencia}
                    disabled={marcandoCiente}
                    style={{
                      width: '100%', padding: '12px 0', borderRadius: 10, border: 'none',
                      background: marcandoCiente ? '#86efac' : '#16a34a',
                      color: '#fff', fontSize: 14, fontWeight: 700,
                      cursor: marcandoCiente ? 'not-allowed' : 'pointer',
                      transition: 'background 0.15s',
                    }}
                  >
                    {marcandoCiente ? 'Registrando...' : '✅ Estou ciente'}
                  </button>
                  <p style={{ fontSize: 11, color: '#94a3b8', textAlign: 'center', marginTop: 10 }}>
                    Você precisa dar ciência para continuar usando o app.
                  </p>
                </div>
              </div>
            </div>
          )}
{/* TELA DE BLOQUEIO */}
{acessoBloqueado && pathname !== '/dashboard/completar-cadastro' && (
  <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.85)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
    <div style={{ background: '#fff', borderRadius: 20, width: '100%', maxWidth: 400, textAlign: 'center', overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
      <div style={{ background: '#dc2626', padding: '28px 24px 20px' }}>
        <span style={{ fontSize: 48 }}>🔒</span>
        <h2 style={{ color: '#fff', fontSize: 20, fontWeight: 800, margin: '12px 0 6px' }}>Acesso Bloqueado</h2>
        <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: 13, margin: 0 }}>
          Seu cadastro está incompleto e o prazo venceu.
        </p>
      </div>
      <div style={{ padding: '24px' }}>
        <p style={{ fontSize: 14, color: '#475569', lineHeight: 1.7, margin: '0 0 20px' }}>
          Para continuar usando o app, você precisa completar seu cadastro. Entre em contato com o administrador caso precise de ajuda.
        </p>
        <a href="/dashboard/completar-cadastro" style={{
          display: 'block', width: '100%', padding: '12px', borderRadius: 10,
          background: '#2563eb', color: '#fff', fontSize: 14, fontWeight: 700,
          textDecoration: 'none', textAlign: 'center', boxSizing: 'border-box',
        }}>
          📝 Completar Cadastro Agora
        </a>
      </div>
    </div>
  </div>
)}
          {semPermissao ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '96px 0' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ width: 80, height: 80, borderRadius: '50%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
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