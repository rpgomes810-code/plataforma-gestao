'use client'

import { useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'

const inputClass = "w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
const labelClass = "block text-sm font-medium text-gray-700 mb-1"

export default function SolicitarAcesso() {
  const [loading, setLoading] = useState(false)
  const [enviado, setEnviado] = useState(false)
  const [form, setForm] = useState({
    nome: '',
    email: '',
    telefone: '',
    grupo: '',
    tipo: '',
    instrumento: '',
    mensagem: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const { error } = await supabase
      .from('solicitacoes')
      .insert([{ ...form, status: 'pendente' }])

    if (error) {
      alert('Erro ao enviar solicitação. Tente novamente.')
      setLoading(false)
    } else {
      setEnviado(true)
    }
  }

  if (enviado) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow p-8 w-full max-w-sm text-center">
          <p className="text-5xl mb-4">🎉</p>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Solicitação enviada!</h2>
          <p className="text-sm text-gray-500 mb-6">Aguarde a aprovação do administrador. Você receberá um contato em breve.</p>
          <a href="/" className="text-blue-600 text-sm hover:underline">← Voltar para o login</a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4 py-10">
      <div className="bg-white rounded-2xl shadow p-8 w-full max-w-lg">

        <div className="mb-6">
          <a href="/" className="text-gray-400 text-sm hover:text-gray-600">← Voltar para o login</a>
          <div className="mt-3">
            <p className="text-xs text-gray-400 uppercase tracking-wider">DARPE</p>
            <h1 className="text-2xl font-bold text-gray-800">Solicitar Acesso</h1>
            <p className="text-sm text-gray-500 mt-1">Preencha os dados abaixo para solicitar acesso à plataforma</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">

          <div>
            <label className={labelClass}>Nome completo *</label>
            <input name="nome" type="text" required value={form.nome} onChange={handleChange}
              placeholder="Seu nome completo" className={inputClass}/>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>E-mail *</label>
              <input name="email" type="email" required value={form.email} onChange={handleChange}
                placeholder="seu@email.com" className={inputClass}/>
            </div>
            <div>
              <label className={labelClass}>Telefone / WhatsApp *</label>
              <input name="telefone" type="text" required value={form.telefone} onChange={handleChange}
                placeholder="(11) 99999-0000" className={inputClass}/>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Grupo</label>
              <input name="grupo" type="text" value={form.grupo} onChange={handleChange}
                placeholder="Ex: Grupo 3" className={inputClass}/>
            </div>
            <div>
              <label className={labelClass}>Função</label>
              <select name="tipo" value={form.tipo} onChange={handleChange} className={inputClass}>
                <option value="">Selecione...</option>
                <option value="Músico">Músico</option>
                <option value="Atendente">Atendente</option>
                <option value="Organizador">Organizador</option>
                <option value="Outro">Outro</option>
              </select>
            </div>
          </div>

          <div>
            <label className={labelClass}>Instrumento (se músico)</label>
            <input name="instrumento" type="text" value={form.instrumento} onChange={handleChange}
              placeholder="Ex: Violão, Teclado, Voz..." className={inputClass}/>
          </div>

          <div>
            <label className={labelClass}>Mensagem (opcional)</label>
            <textarea name="mensagem" rows={3} value={form.mensagem} onChange={handleChange}
              placeholder="Alguma informação adicional..."
              className={inputClass}/>
          </div>

          <button type="submit" disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 text-sm">
            {loading ? 'Enviando...' : 'Enviar Solicitação'}
          </button>

        </form>
      </div>
    </div>
  )
}