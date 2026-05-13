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

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const handleRedefinir = async (e: React.FormEvent) => {
    e.preventDefault()
    setErro('')

    if (senha !== confirmar) {
      setErro('As senhas não coincidem')
      return
    }

    if (senha.length < 6) {
      setErro('A senha deve ter pelo menos 6 caracteres')
      return
    }

    setLoading(true)

    const { error } = await supabase.auth.updateUser({ password: senha })

    if (error) {
      setErro('Erro ao redefinir senha. Tente novamente.')
      setLoading(false)
    } else {
      setMensagem('Senha redefinida com sucesso!')
      setTimeout(() => router.push('/'), 2000)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow p-8 w-full max-w-sm">
        <div className="mb-6 text-center">
          <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">DARPE</p>
          <h1 className="text-2xl font-bold text-gray-800">Redefinir Senha</h1>
          <p className="text-sm text-gray-500 mt-1">Digite sua nova senha</p>
        </div>

        <form onSubmit={handleRedefinir} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nova senha</label>
            <input
              type="password"
              required
              value={senha}
              onChange={e => setSenha(e.target.value)}
              placeholder="••••••••"
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirmar nova senha</label>
            <input
              type="password"
              required
              value={confirmar}
              onChange={e => setConfirmar(e.target.value)}
              placeholder="••••••••"
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>

          {erro && <p className="text-red-500 text-sm text-center">{erro}</p>}
          {mensagem && <p className="text-green-600 text-sm text-center">{mensagem}</p>}

          <button type="submit" disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 text-sm">
            {loading ? 'Salvando...' : 'Salvar nova senha'}
          </button>
        </form>
      </div>
    </div>
  )
}