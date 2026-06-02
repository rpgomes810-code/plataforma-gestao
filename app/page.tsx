'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'

const VERSICULOS = [
  { texto: 'Porque tive fome e me destes de comer; tive sede e me destes de beber; era forasteiro e me hospedastes; estava nu e me vestistes; enfermo e me visitastes.', ref: 'Mateus 25:35-36' },
  { texto: 'Cada um contribua segundo propôs no seu coração, não com tristeza ou por necessidade; porque Deus ama ao que dá com alegria.', ref: '2 Coríntios 9:7' },
  { texto: 'E tudo quanto fizerdes, fazei-o de todo o coração, como ao Senhor e não aos homens.', ref: 'Colossenses 3:23' },
  { texto: 'Porque eu estava enfermo e me visitastes... Em verdade vos digo que quando o fizestes a um destes meus pequeninos irmãos, a mim o fizestes.', ref: 'Mateus 25:36,40' },
  { texto: 'O generoso prosperará; o que refrigera os outros também será refrigerado.', ref: 'Provérbios 11:25' },
  { texto: 'Portanto, enquanto temos oportunidade, façamos o bem a todos.', ref: 'Gálatas 6:10' },
]

function VersiaculoRotativo() {
  const [idx, setIdx] = useState(0)
  useEffect(() => { setIdx(Math.floor(Math.random() * VERSICULOS.length)) }, [])
  const v = VERSICULOS[idx]
  return (
    <div style={{ marginTop: 8 }}>
      <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.85)', lineHeight: 1.7, margin: '0 0 8px', fontStyle: 'italic' }}>
        "{v.texto}"
      </p>
      <p style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.5)', margin: 0, letterSpacing: 1 }}>
        — {v.ref}
      </p>
    </div>
  )
}

export default function Login() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')
  const [loading, setLoading] = useState(false)
  const [modo, setModo] = useState<'login' | 'recuperar'>('login')
  const [mensagem, setMensagem] = useState('')
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [mostrarSenha, setMostrarSenha] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const [mostrarBanner, setMostrarBanner] = useState(false)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    const ios = /iphone|ipad|ipod/i.test(navigator.userAgent)
    setIsIOS(ios)
    const jaInstalou = localStorage.getItem('app_instalado') === 'true'
    if (!jaInstalou) setMostrarBanner(true)
    const handler = (e: any) => { e.preventDefault(); setDeferredPrompt(e) }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const instalarApp = async () => {
    if (!deferredPrompt) return
    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    setDeferredPrompt(null)
    if (outcome === 'accepted') {
      localStorage.setItem('app_instalado', 'true')
      setMostrarBanner(false)
    }
  }

  const jaInstalei = () => {
    localStorage.setItem('app_instalado', 'true')
    setMostrarBanner(false)
  }

  const agoraNao = () => setMostrarBanner(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErro('')
    const { error } = await supabase.auth.signInWithPassword({ email, password: senha })
    if (error) { setErro('Email ou senha incorretos'); setLoading(false) }
    else { router.refresh(); router.push('/dashboard') }
  }

  const handleRecuperar = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErro('')
    setMensagem('')
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'https://darpe-jundiai.vercel.app/redefinir-senha',
    })
    if (error) setErro(error.message)
    else setMensagem('E-mail enviado! Verifique sua caixa de entrada.')
    setLoading(false)
  }

  if (mostrarBanner) {
    return (
      <div style={{ minHeight: '100vh', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px 16px' }}>
        <style>{`
          @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
          .banner-card { animation: fadeIn 0.4s ease; }
        `}</style>

        <div className="banner-card" style={{ width: '100%', maxWidth: 420 }}>
          <div style={{ background: '#fff', borderRadius: 24, boxShadow: '0 8px 32px rgba(0,0,0,0.1)', border: '1px solid #e2e8f0', overflow: 'hidden' }}>

            <div style={{ background: '#1e3a5f', padding: '36px 32px 28px', textAlign: 'center' }}>
              <div style={{
                width: 64, height: 64, borderRadius: 18,
                background: 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 16px',
              }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12.01" y2="18"/>
                </svg>
              </div>
              <h2 style={{ fontSize: 22, fontWeight: 800, color: '#fff', margin: '0 0 8px' }}>Instale o App!</h2>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', margin: 0, lineHeight: 1.6 }}>
                Tenha o DARPE sempre à mão na sua tela inicial, sem precisar abrir o navegador.
              </p>
            </div>

            <div style={{ padding: '24px 32px 0' }}>
              {[
                { icon: '⚡', text: 'Acesso rápido com um toque' },
                { icon: '🔔', text: 'Receba notificações de escalas' },
                { icon: '📶', text: 'Funciona mesmo com internet lenta' },
              ].map(item => (
                <div key={item.text} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                  <span style={{ width: 36, height: 36, borderRadius: 10, background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>{item.icon}</span>
                  <span style={{ fontSize: 13, color: '#475569', fontWeight: 500 }}>{item.text}</span>
                </div>
              ))}
            </div>

            {isIOS && (
              <div style={{ margin: '16px 32px 0', borderRadius: 12, background: '#f8fafc', border: '1px solid #e2e8f0', padding: 16 }}>
                <p style={{ fontSize: 12, fontWeight: 700, color: '#1e293b', margin: '0 0 10px' }}>Como instalar no iPhone:</p>
                {['Abra este site no Safari', 'Toque no ícone de compartilhar (□↑)', 'Toque em "Adicionar à Tela de Início"', 'Toque em "Adicionar"'].map((passo, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 6 }}>
                    <span style={{ width: 18, height: 18, borderRadius: '50%', flexShrink: 0, background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700 }}>{i + 1}</span>
                    <span style={{ fontSize: 12, color: '#64748b' }}>{passo}</span>
                  </div>
                ))}
              </div>
            )}

            <div style={{ padding: '20px 32px 32px', display: 'flex', flexDirection: 'column', gap: 10 }}>
              {deferredPrompt && !isIOS && (
                <button onClick={instalarApp} style={{
                  width: '100%', padding: '13px', borderRadius: 12, border: 'none',
                  background: '#2563eb', color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer',
                }}>
                  📲 Instalar agora
                </button>
              )}
              <button onClick={jaInstalei} style={{
                width: '100%', padding: '13px', borderRadius: 12, border: '1px solid #2563eb',
                background: '#fff', color: '#2563eb', fontSize: 14, fontWeight: 700, cursor: 'pointer',
              }}>
                ✅ Já instalei!
              </button>
              <button onClick={agoraNao} style={{
                width: '100%', padding: '11px', borderRadius: 12,
                border: '1px solid #e2e8f0', background: '#fff',
                color: '#94a3b8', fontSize: 13, fontWeight: 600, cursor: 'pointer',
              }}>
                Agora não
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px 16px' }}>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        .login-card { animation: fadeIn 0.4s ease; }
        .input-login:focus { border-color: #2563eb !important; background: #fff !important; box-shadow: 0 0 0 3px rgba(37,99,235,0.1); }
        .btn-primary:hover:not(:disabled) { background: #1d4ed8 !important; transform: translateY(-1px); box-shadow: 0 4px 12px rgba(37,99,235,0.4); }
        .btn-primary { transition: all 0.2s; }
        .btn-secondary:hover { background: #e2e8f0 !important; }
        .btn-secondary { transition: background 0.2s; }
        @media (max-width: 768px) {
          .login-inner { flex-direction: column !important; border-radius: 16px !important; }
          .login-left { display: none !important; }
          .login-right { width: 100% !important; padding: 32px 24px !important; }
        }
      `}</style>

      <div className="login-card" style={{ width: '100%', maxWidth: 860 }}>
        <div className="login-inner" style={{
          display: 'flex', borderRadius: 24, overflow: 'hidden',
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)', border: '1px solid #e2e8f0',
        }}>

          {/* Lado esquerdo */}
          <div className="login-left" style={{
            flex: 1, background: '#1e3a5f',
            padding: '48px 40px',
            display: 'flex', flexDirection: 'column', justifyContent: 'center',
          }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.5)', letterSpacing: 3, textTransform: 'uppercase', margin: '0 0 6px' }}>DARPE CCB</p>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: '#fff', margin: '0 0 32px', lineHeight: 1.3 }}>Setor 4 — Hospitais</h2>
            <h3 style={{ fontSize: 26, fontWeight: 800, color: '#fff', margin: '0 0 16px', lineHeight: 1.3 }}>
              Sistema de Gestão
            </h3>
            <VersiaculoRotativo />
          </div>

          {/* Lado direito */}
          <div className="login-right" style={{
            width: 400, background: '#fff',
            padding: '48px 40px',
            display: 'flex', flexDirection: 'column', justifyContent: 'center',
          }}>
            <div style={{ marginBottom: 32 }}>
              <h2 style={{ fontSize: 24, fontWeight: 800, color: '#0f172a', margin: '0 0 6px' }}>
                {modo === 'login' ? 'A Paz de Deus!' : 'Recuperar senha'}
              </h2>
              <p style={{ fontSize: 13, color: '#64748b', margin: 0 }}>
                {modo === 'login' ? 'Insira suas credenciais para acessar o sistema.' : 'Enviaremos um link para seu e-mail.'}
              </p>
            </div>

            {modo === 'login' ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#94a3b8', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8 }}>E-MAIL</label>
                  <div style={{ position: 'relative' }}>
                    <svg style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
                    </svg>
                    <input className="input-login" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="seu@email.com"
                      style={{ width: '100%', padding: '12px 14px 12px 42px', borderRadius: 10, border: '1.5px solid #e2e8f0', background: '#f8fafc', fontSize: 14, color: '#1e293b', outline: 'none', boxSizing: 'border-box', transition: 'all 0.2s' }} />
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <label style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', letterSpacing: 1, textTransform: 'uppercase' }}>SENHA</label>
                    <button type="button" onClick={() => { setModo('recuperar'); setErro('') }} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 11, fontWeight: 700, color: '#94a3b8', letterSpacing: 1, textTransform: 'uppercase' }}>
                      ESQUECI A SENHA
                    </button>
                  </div>
                  <div style={{ position: 'relative' }}>
                    <svg style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                    </svg>
                    <input className="input-login" type={mostrarSenha ? 'text' : 'password'} value={senha} onChange={e => setSenha(e.target.value)} placeholder="••••••••"
                      style={{ width: '100%', padding: '12px 42px 12px 42px', borderRadius: 10, border: '1.5px solid #e2e8f0', background: '#f8fafc', fontSize: 14, color: '#1e293b', outline: 'none', boxSizing: 'border-box', transition: 'all 0.2s' }} />
                    <button type="button" onClick={() => setMostrarSenha(!mostrarSenha)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: 0 }}>
                      {mostrarSenha ? (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/>
                        </svg>
                      ) : (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                {erro && (
                  <div style={{ borderRadius: 10, padding: '10px 14px', background: '#fee2e2', border: '1px solid #fecaca', color: '#dc2626', fontSize: 13 }}>{erro}</div>
                )}

                <button className="btn-primary" onClick={handleLogin} disabled={loading} style={{
                  width: '100%', padding: '13px', borderRadius: 10, border: 'none',
                  background: '#2563eb', color: '#fff',
                  fontSize: 13, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase',
                  cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                }}>
                  {loading ? 'Acessando...' : <>ACESSAR SISTEMA <span>→</span></>}
                </button>

                <a href="/solicitar-acesso" className="btn-secondary" style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                  padding: '12px', borderRadius: 10, border: 'none',
                  background: '#f1f5f9', color: '#64748b',
                  fontSize: 13, fontWeight: 600, textDecoration: 'none', textTransform: 'uppercase', letterSpacing: 1,
                }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/>
                  </svg>
                  SOLICITAR ACESSO
                </a>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#94a3b8', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8 }}>E-MAIL</label>
                  <div style={{ position: 'relative' }}>
                    <svg style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
                    </svg>
                    <input className="input-login" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="seu@email.com"
                      style={{ width: '100%', padding: '12px 14px 12px 42px', borderRadius: 10, border: '1.5px solid #e2e8f0', background: '#f8fafc', fontSize: 14, color: '#1e293b', outline: 'none', boxSizing: 'border-box', transition: 'all 0.2s' }} />
                  </div>
                </div>

                {erro && <div style={{ borderRadius: 10, padding: '10px 14px', background: '#fee2e2', border: '1px solid #fecaca', color: '#dc2626', fontSize: 13 }}>{erro}</div>}
                {mensagem && <div style={{ borderRadius: 10, padding: '10px 14px', background: '#dcfce7', border: '1px solid #bbf7d0', color: '#16a34a', fontSize: 13 }}>{mensagem}</div>}

                <button className="btn-primary" onClick={handleRecuperar} disabled={loading} style={{
                  width: '100%', padding: '13px', borderRadius: 10, border: 'none',
                  background: '#2563eb', color: '#fff',
                  fontSize: 13, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase',
                  cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1,
                }}>
                  {loading ? 'Enviando...' : 'ENVIAR LINK DE RECUPERAÇÃO'}
                </button>

                <button type="button" onClick={() => { setModo('login'); setErro(''); setMensagem('') }} className="btn-secondary" style={{
                  background: '#f1f5f9', border: 'none', cursor: 'pointer',
                  fontSize: 13, color: '#64748b', textAlign: 'center',
                  padding: '12px', borderRadius: 10, fontWeight: 600,
                }}>
                  ← Voltar para o login
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}