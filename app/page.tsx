'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'

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
  const [mostrarPassoIOS, setMostrarPassoIOS] = useState(false)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    const ios = /iphone|ipad|ipod/i.test(navigator.userAgent)
    setIsIOS(ios)
    const handler = (e: any) => { e.preventDefault(); setDeferredPrompt(e) }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const instalarApp = async () => {
    if (!deferredPrompt) return
    deferredPrompt.prompt()
    await deferredPrompt.userChoice
    setDeferredPrompt(null)
  }

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

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '10px 14px', borderRadius: 8,
    border: '1px solid #e2e8f0', background: '#f8fafc',
    fontSize: 14, color: '#1e293b', outline: 'none', boxSizing: 'border-box',
  }

  const labelStyle: React.CSSProperties = {
    display: 'block', fontSize: 12, fontWeight: 600,
    color: '#64748b', marginBottom: 6,
  }

  return (
    <div style={{
      minHeight: '100vh', background: '#f1f5f9',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '24px 16px',
    }}>
      <div style={{ width: '100%', maxWidth: 400 }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{
            width: 56, height: 56, borderRadius: 14, margin: '0 auto 12px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: '#1e3a5f',
          }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
          </div>
          <p style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 4 }}>DARPE CCB</p>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: '#1e293b', margin: 0 }}>Setor 4 — Hospitais</h1>
          <p style={{ fontSize: 13, color: '#64748b', marginTop: 6 }}>
            {modo === 'login' ? 'Entre com sua conta para continuar' : 'Recupere sua senha'}
          </p>
        </div>

        {/* Card */}
        <div style={{
          background: '#fff', borderRadius: 16,
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
          padding: 28,
        }}>

          {/* Instalar Android */}
          {deferredPrompt && !isIOS && (
            <button onClick={instalarApp} style={{
              width: '100%', padding: '10px', borderRadius: 8, border: 'none',
              background: '#dcfce7', color: '#16a34a',
              fontSize: 13, fontWeight: 600, cursor: 'pointer', marginBottom: 16,
            }}>
              📲 Instalar app no celular
            </button>
          )}

          {/* Instalar iPhone */}
          {isIOS && !mostrarPassoIOS && (
            <button onClick={() => setMostrarPassoIOS(true)} style={{
              width: '100%', padding: '10px', borderRadius: 8,
              border: '1px solid #e2e8f0', background: '#f8fafc',
              fontSize: 13, fontWeight: 600, color: '#475569', cursor: 'pointer', marginBottom: 16,
            }}>
              📲 Instalar app no iPhone
            </button>
          )}

          {isIOS && mostrarPassoIOS && (
            <div style={{
              borderRadius: 10, padding: 16, marginBottom: 16,
              background: '#f8fafc', border: '1px solid #e2e8f0',
            }}>
              <p style={{ fontWeight: 700, color: '#1e293b', fontSize: 13, marginBottom: 10 }}>Como instalar no iPhone:</p>
              <ol style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
                {['Abra este site no Safari', 'Toque no ícone de compartilhar (□↑)', 'Toque em "Adicionar à Tela de Início"', 'Toque em "Adicionar"'].map((passo, i) => (
                  <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                    <span style={{
                      width: 20, height: 20, borderRadius: '50%', flexShrink: 0,
                      background: '#eff6ff', color: '#2563eb',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 11, fontWeight: 700,
                    }}>{i + 1}</span>
                    <p style={{ fontSize: 13, color: '#64748b', margin: 0 }}>{passo}</p>
                  </li>
                ))}
              </ol>
              <button onClick={() => setMostrarPassoIOS(false)} style={{
                background: 'none', border: 'none', cursor: 'pointer',
                fontSize: 12, color: '#94a3b8', marginTop: 10, padding: 0,
              }}>← Fechar</button>
            </div>
          )}

          {modo === 'login' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={labelStyle}>E-mail</label>
                <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="seu@email.com" style={inputStyle} />
              </div>

              <div>
                <label style={labelStyle}>Senha</label>
                <div style={{ position: 'relative' }}>
                  <input type={mostrarSenha ? 'text' : 'password'} required value={senha}
                    onChange={e => setSenha(e.target.value)} placeholder="••••••••"
                    style={{ ...inputStyle, paddingRight: 40 }} />
                  <button type="button" onClick={() => setMostrarSenha(!mostrarSenha)} style={{
                    position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: 0,
                  }}>
                    {mostrarSenha ? (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/>
                        <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/>
                        <line x1="1" y1="1" x2="23" y2="23"/>
                      </svg>
                    ) : (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                        <circle cx="12" cy="12" r="3"/>
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {erro && (
                <div style={{
                  borderRadius: 8, padding: '10px 14px',
                  background: '#fee2e2', border: '1px solid #fecaca',
                  color: '#dc2626', fontSize: 13,
                }}>
                  {erro}
                </div>
              )}

              <button onClick={handleLogin} disabled={loading} style={{
                width: '100%', padding: '11px', borderRadius: 8, border: 'none',
                background: '#2563eb', color: '#fff',
                fontSize: 14, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.6 : 1,
              }}>
                {loading ? 'Entrando...' : 'Entrar'}
              </button>

              <button type="button" onClick={() => { setModo('recuperar'); setErro('') }} style={{
                background: 'none', border: 'none', cursor: 'pointer',
                fontSize: 13, color: '#94a3b8', textAlign: 'center',
              }}>
                Esqueci minha senha
              </button>

              <a href="/solicitar-acesso" style={{
                display: 'block', textAlign: 'center', padding: '10px', borderRadius: 8,
                border: '1px solid #e2e8f0', background: '#f8fafc',
                fontSize: 13, fontWeight: 600, color: '#475569', textDecoration: 'none',
              }}>
                Solicitar Acesso
              </a>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={labelStyle}>E-mail</label>
                <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="seu@email.com" style={inputStyle} />
              </div>

              {erro && (
                <div style={{
                  borderRadius: 8, padding: '10px 14px',
                  background: '#fee2e2', border: '1px solid #fecaca',
                  color: '#dc2626', fontSize: 13,
                }}>
                  {erro}
                </div>
              )}

              {mensagem && (
                <div style={{
                  borderRadius: 8, padding: '10px 14px',
                  background: '#dcfce7', border: '1px solid #bbf7d0',
                  color: '#16a34a', fontSize: 13,
                }}>
                  {mensagem}
                </div>
              )}

              <button onClick={handleRecuperar} disabled={loading} style={{
                width: '100%', padding: '11px', borderRadius: 8, border: 'none',
                background: '#2563eb', color: '#fff',
                fontSize: 14, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.6 : 1,
              }}>
                {loading ? 'Enviando...' : 'Enviar link de recuperação'}
              </button>

              <button type="button" onClick={() => { setModo('login'); setErro(''); setMensagem('') }} style={{
                background: 'none', border: 'none', cursor: 'pointer',
                fontSize: 13, color: '#94a3b8', textAlign: 'center',
              }}>
                ← Voltar para o login
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}