'use client'

import { useState } from 'react'
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

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErro('')

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password: senha,
    })

    if (error) {
      setErro('Email ou senha incorretos')
      setLoading(false)
    } else {
      router.refresh()
      router.push('/dashboard')
    }
  }

  const handleRecuperar = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErro('')
    setMensagem('')

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'https://darpe-jundiai.vercel.app/redefinir-senha',
    })

    if (error) {
      setErro(error.message)
    } else {
      setMensagem('E-mail enviado! Verifique sua caixa de entrada para redefinir a senha.')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow p-8 w-full max-w-sm">
        <div className="mb-6 text-center">
          <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">DARPE</p>
          <h1 className="text-2xl font-bold text-gray-800">Setor 4 — Hospitais</h1>
          <p className="text-sm text-gray-500 mt-1">
            {modo === 'login' ? 'Entre com sua conta para continuar' : 'Informe seu e-mail para recuperar a senha'}
          </p>
        </div>

        {modo === 'login' ? (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="seu@email.com"
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Senha</label>
              <input
                type="password"
                required
                value={senha}
                onChange={e => setSenha(e.target.value)}
                placeholder="••••••••"
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>

            {erro && <p className="text-red-500 text-sm text-center">{erro}</p>}

            <button type="submit" disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 text-sm">
              {loading ? 'Entrando...' : 'Entrar'}
            </button>

            <button type="button" onClick={() => { setModo('recuperar'); setErro('') }}
              className="w-full text-center text-sm text-gray-500 hover:text-blue-600 transition">
              Esqueci minha senha
            </button>

            <a href="/solicitar-acesso"
              className="w-full block text-center bg-gray-100 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-200 transition text-sm">
              Solicitar Acesso
            </a>
          </form>
        ) : (
          <form onSubmit={handleRecuperar} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="seu@email.com"
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>

            {erro && <p className="text-red-500 text-sm text-center">{erro}</p>}
            {mensagem && <p className="text-green-600 text-sm text-center">{mensagem}</p>}

            <button type="submit" disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 text-sm">
              {loading ? 'Enviando...' : 'Enviar link de recuperação'}
            </button>

            <button type="button" onClick={() => { setModo('login'); setErro(''); setMensagem('') }}
              className="w-full text-center text-sm text-gray-500 hover:text-blue-600 transition">
              ← Voltar para o login
            </button>
          </form>
        )}
      </div>
    </div>
  )
}