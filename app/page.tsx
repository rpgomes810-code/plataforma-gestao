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

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #0f172a 100%)' }}>

      {/* Decorative circles */}
      <div className="absolute top-[-100px] right-[-100px] w-96 h-96 rounded-full opacity-10"
        style={{ background: 'radial-gradient(circle, #3b82f6, transparent)' }} />
      <div className="absolute bottom-[-100px] left-[-100px] w-96 h-96 rounded-full opacity-10"
        style={{ background: 'radial-gradient(circle, #60a5fa, transparent)' }} />

      <div className="w-full max-w-sm relative z-10">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center"
  style={{ background: 'linear-gradient(135deg, #1e40af, #3b82f6)' }}>
  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
    <polyline points="9 22 9 12 15 12 15 22"/>
  </svg>
</div>
          <p className="text-blue-300 text-xs uppercase tracking-widest font-semibold mb-1">DARPE CCB</p>
          <h1 className="text-white font-bold text-2xl">Setor 4 — Hospitais</h1>
          <p className="text-blue-200/60 text-sm mt-1">
            {modo === 'login' ? 'Entre com sua conta para continuar' : 'Recupere sua senha'}
          </p>
        </div>

        {/* Card */}
        <div className="rounded-2xl p-8" style={{ background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.1)' }}>

          {/* Instalar Android */}
          {deferredPrompt && !isIOS && (
            <button onClick={instalarApp}
              className="w-full py-3 rounded-xl font-semibold text-sm mb-4 transition"
              style={{ background: 'linear-gradient(135deg, #059669, #10b981)', color: 'white' }}>
              📲 Instalar app no celular
            </button>
          )}

          {/* Instalar iPhone */}
          {isIOS && !mostrarPassoIOS && (
            <button onClick={() => setMostrarPassoIOS(true)}
              className="w-full py-3 rounded-xl font-semibold text-sm mb-4 transition"
              style={{ background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.2)' }}>
              📲 Instalar app no iPhone
            </button>
          )}

          {isIOS && mostrarPassoIOS && (
            <div className="rounded-xl p-4 mb-4 text-sm" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
              <p className="font-bold text-white mb-3">Como instalar no iPhone:</p>
              <ol className="space-y-2">
                {['Abra este site no Safari', 'Toque no ícone de compartilhar (□↑)', 'Toque em "Adicionar à Tela de Início"', 'Toque em "Adicionar"'].map((passo, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-xs font-bold text-white"
                      style={{ background: 'rgba(59,130,246,0.5)' }}>{i + 1}</span>
                    <p className="text-blue-100/70">{passo}</p>
                  </li>
                ))}
              </ol>
              <button onClick={() => setMostrarPassoIOS(false)} className="text-xs text-blue-300/50 mt-3 hover:text-blue-300">← Fechar</button>
            </div>
          )}

          {modo === 'login' ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-blue-100/70 mb-1.5">E-mail</label>
                <input
                  type="email" required value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  className="w-full px-4 py-3 rounded-xl text-sm text-white placeholder-blue-300/30 outline-none transition"
                  style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-blue-100/70 mb-1.5">Senha</label>
                <div className="relative">
                  <input
                    type={mostrarSenha ? 'text' : 'password'} required value={senha}
                    onChange={e => setSenha(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-3 rounded-xl text-sm text-white placeholder-blue-300/30 outline-none transition pr-10"
                    style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}
                  />
                  <button type="button" onClick={() => setMostrarSenha(!mostrarSenha)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-300/40 hover:text-blue-300">
                    {mostrarSenha ? (
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                        <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                        <line x1="1" y1="1" x2="23" y2="23"/>
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                        <circle cx="12" cy="12" r="3"/>
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {erro && (
                <div className="rounded-xl px-4 py-3 text-sm text-red-300" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>
                  {erro}
                </div>
              )}

              <button type="submit" disabled={loading}
                className="w-full py-3 rounded-xl font-semibold text-white text-sm transition disabled:opacity-50"
                style={{ background: 'linear-gradient(135deg, #1e40af, #3b82f6)' }}>
                {loading ? 'Entrando...' : 'Entrar'}
              </button>

              <button type="button" onClick={() => { setModo('recuperar'); setErro('') }}
                className="w-full text-center text-sm text-blue-300/50 hover:text-blue-300 transition">
                Esqueci minha senha
              </button>

              <a href="/solicitar-acesso"
                className="w-full block text-center py-3 rounded-xl font-semibold text-sm transition"
                style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.1)' }}>
                Solicitar Acesso
              </a>
            </form>
          ) : (
            <form onSubmit={handleRecuperar} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-blue-100/70 mb-1.5">E-mail</label>
                <input
                  type="email" required value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  className="w-full px-4 py-3 rounded-xl text-sm text-white placeholder-blue-300/30 outline-none"
                  style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}
                />
              </div>

              {erro && (
                <div className="rounded-xl px-4 py-3 text-sm text-red-300" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>
                  {erro}
                </div>
              )}
              {mensagem && (
                <div className="rounded-xl px-4 py-3 text-sm text-green-300" style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)' }}>
                  {mensagem}
                </div>
              )}

              <button type="submit" disabled={loading}
                className="w-full py-3 rounded-xl font-semibold text-white text-sm transition disabled:opacity-50"
                style={{ background: 'linear-gradient(135deg, #1e40af, #3b82f6)' }}>
                {loading ? 'Enviando...' : 'Enviar link de recuperação'}
              </button>

              <button type="button" onClick={() => { setModo('login'); setErro(''); setMensagem('') }}
                className="w-full text-center text-sm text-blue-300/50 hover:text-blue-300 transition">
                ← Voltar para o login
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}