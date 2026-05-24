'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'

export default function RedefinirSenha() {
  const router = useRouter()
  const [senha, setSenha] = useState('')
  const [confirmar, setConfirmar] = useState('')
  const [erro, setErro] = useState('')
  const [loading, setLoading] = useState(false)
  const [mensagem, setMensagem] = useState('')
  const [pronto, setPronto] = useState(false)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    const code = new URLSearchParams(window.location.search).get('code')
    if (code) {
      supabase.auth.exchangeCodeForSession(code).then(({ error }) => {
        if (error) setErro('Link inválido ou expirado. Solicite um novo.')
        else setPronto(true)
      })
    } else {
      setErro('Link inválido. Solicite um novo e-mail de recuperação.')
    }
  }, [])

  const handleRedefinir = async (e: React.FormEvent) => {
    e.preventDefault()
    setErro('')
    if (senha !== confirmar) { setErro('As senhas não coincidem'); return }
    if (senha.length < 6) { setErro('A senha deve ter pelo menos 6 caracteres'); return }
    setLoading(true)
    const { error } = await supabase.auth.updateUser({ password: senha })
    if (error) { setErro('Erro ao redefinir senha. Tente novamente.'); setLoading(false) }
    else { setMensagem('Senha redefinida com sucesso!'); setTimeout(() => router.push('/'), 2000) }
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
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
              <path d="M7 11V7a5 5 0 0110 0v4"/>
            </svg>
          </div>
          <p style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 4 }}>DARPE CCB</p>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: '#1e293b', margin: 0 }}>Redefinir Senha</h1>
          <p style={{ fontSize: 13, color: '#64748b', marginTop: 6 }}>Digite sua nova senha</p>
        </div>

        <div style={{
          background: '#fff', borderRadius: 16,
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
          padding: 28,
        }}>
          {!pronto && !erro && (
            <p style={{ textAlign: 'center', color: '#64748b', fontSize: 14 }}>Verificando link...</p>
          )}

          {erro && !pronto && (
            <div style={{ textAlign: 'center' }}>
              <div style={{
                borderRadius: 8, padding: '10px 14px', marginBottom: 16,
                background: '#fee2e2', border: '1px solid #fecaca', color: '#dc2626', fontSize: 13,
              }}>
                {erro}
              </div>
              <a href="/" style={{ color: '#2563eb', fontSize: 13, textDecoration: 'none' }}>← Voltar para o login</a>
            </div>
          )}

          {pronto && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={labelStyle}>Nova senha</label>
                <input type="password" required value={senha} onChange={e => setSenha(e.target.value)}
                  placeholder="••••••••" style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Confirmar nova senha</label>
                <input type="password" required value={confirmar} onChange={e => setConfirmar(e.target.value)}
                  placeholder="••••••••" style={inputStyle} />
              </div>

              {erro && (
                <div style={{
                  borderRadius: 8, padding: '10px 14px',
                  background: '#fee2e2', border: '1px solid #fecaca', color: '#dc2626', fontSize: 13,
                }}>
                  {erro}
                </div>
              )}

              {mensagem && (
                <div style={{
                  borderRadius: 8, padding: '10px 14px',
                  background: '#dcfce7', border: '1px solid #bbf7d0', color: '#16a34a', fontSize: 13,
                }}>
                  {mensagem}
                </div>
              )}

              <button onClick={handleRedefinir} disabled={loading} style={{
                width: '100%', padding: '11px', borderRadius: 8, border: 'none',
                background: '#2563eb', color: '#fff',
                fontSize: 14, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.6 : 1,
              }}>
                {loading ? 'Salvando...' : 'Salvar nova senha'}
              </button>

              <a href="/" style={{ textAlign: 'center', color: '#94a3b8', fontSize: 13, textDecoration: 'none' }}>
                ← Voltar para o login
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}