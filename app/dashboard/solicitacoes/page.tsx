'use client'

import { useState, useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'

type Solicitacao = {
  id: string
  nome: string
  telefone: string
  email: string
  data_nascimento: string
  comum: string
  cidade: string
  instrumento: string
  status: string
  created_at: string
}

export default function Solicitacoes() {
  const [solicitacoes, setSolicitacoes] = useState<Solicitacao[]>([])
  const [loading, setLoading] = useState(true)
  const [filtro, setFiltro] = useState('pendente')
  const [processando, setProcessando] = useState<string | null>(null)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const carregar = () => {
    setLoading(true)
    supabase
      .from('solicitacoes')
      .select('*')
      .eq('status', filtro)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setSolicitacoes(data || [])
        setLoading(false)
      })
  }

  useEffect(() => { carregar() }, [filtro])

  const aprovar = async (id: string) => {
    setProcessando(id)
    const res = await fetch('/api/aprovar-solicitacao', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })

    if (res.ok) {
      carregar()
    } else {
      const data = await res.json()
      alert('Erro ao aprovar: ' + data.error)
    }
    setProcessando(null)
  }

  const rejeitar = async (id: string) => {
    setProcessando(id)
    await supabase.from('solicitacoes').update({ status: 'rejeitado' }).eq('id', id)
    carregar()
    setProcessando(null)
  }

  const calcularIdade = (dataNascimento: string) => {
    if (!dataNascimento) return '—'
    const hoje = new Date()
    const nascimento = new Date(dataNascimento + 'T12:00:00')
    let idade = hoje.getFullYear() - nascimento.getFullYear()
    const mes = hoje.getMonth() - nascimento.getMonth()
    if (mes < 0 || (mes === 0 && hoje.getDate() < nascimento.getDate())) {
      idade--
    }
    return `${idade} anos`
  }

  const formatarData = (data: string) => {
    if (!data) return '—'
    return new Date(data + 'T12:00:00').toLocaleDateString('pt-BR')
  }

  const formatarDataHora = (data: string) => {
    return new Date(data).toLocaleDateString('pt-BR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    })
  }

  return (
    <div className="p-4 md:p-6">

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Solicitações de Acesso</h2>
          <p className="text-sm text-gray-500">{solicitacoes.length} solicitações {filtro}s</p>
        </div>
        <div className="flex gap-2">
          {['pendente', 'aprovado', 'rejeitado'].map(f => (
            <button key={f} onClick={() => setFiltro(f)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                filtro === f
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-600 border hover:bg-gray-50'
              }`}>
              {f === 'pendente' ? '⏳ Pendentes' : f === 'aprovado' ? '✅ Aprovados' : '❌ Rejeitados'}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500">Carregando...</div>
      ) : solicitacoes.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl shadow">
          <p className="text-4xl mb-3">📭</p>
          <p className="text-gray-500">Nenhuma solicitação {filtro}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {solicitacoes.map(s => (
            <div key={s.id} className="bg-white rounded-2xl shadow p-6">
              <div className="flex flex-col md:flex-row justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
                      {s.nome.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-gray-800">{s.nome}</p>
                      <p className="text-xs text-gray-400">Solicitado em {formatarDataHora(s.created_at)}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                    <div>
                      <p className="text-gray-400 text-xs">Telefone</p>
                      <p className="text-gray-700 font-medium">📱 {s.telefone || '—'}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-xs">E-mail</p>
                      <p className="text-gray-700 font-medium">✉️ {s.email || '—'}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-xs">Nascimento / Idade</p>
                      <p className="text-gray-700 font-medium">🎂 {formatarData(s.data_nascimento)} — {calcularIdade(s.data_nascimento)}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-xs">Comum</p>
                      <p className="text-gray-700 font-medium">⛪ {s.comum || '—'}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-xs">Cidade</p>
                      <p className="text-gray-700 font-medium">📍 {s.cidade || '—'}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-xs">Instrumento</p>
                      <p className="text-gray-700 font-medium">🎵 {s.instrumento || '—'}</p>
                    </div>
                  </div>
                </div>

                {filtro === 'pendente' && (
                  <div className="flex md:flex-col gap-2 justify-end">
                    <button onClick={() => aprovar(s.id)} disabled={processando === s.id}
                      className="bg-green-500 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-green-600 transition disabled:opacity-50">
                      {processando === s.id ? 'Processando...' : '✅ Aprovar'}
                    </button>
                    <button onClick={() => rejeitar(s.id)} disabled={processando === s.id}
                      className="bg-red-50 text-red-600 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-red-100 transition disabled:opacity-50">
                      ❌ Rejeitar
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}