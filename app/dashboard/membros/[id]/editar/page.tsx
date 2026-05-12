'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'

const inputClass = "w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
const labelClass = "block text-sm font-medium text-gray-700 mb-1"

export default function EditarMembro() {
  const router = useRouter()
  const params = useParams()
  const [loading, setLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(true)
  const [form, setForm] = useState({
    nome: '',
    telefone: '',
    cidade: '',
    tipo: '',
    instrumento: '',
    grupo: '',
    nivel_acesso: '',
    status: '',
  })

  useEffect(() => {
    fetch(`/api/membros/${params.id}`)
      .then(res => res.json())
      .then(data => {
        setForm({
          nome:         data.nome || '',
          telefone:     data.telefone || '',
          cidade:       data.cidade || '',
          tipo:         data.tipo || '',
          instrumento:  data.instrumento || '',
          grupo:        data.grupo || '',
          nivel_acesso: data.nivel_acesso || '',
          status:       data.status || '',
        })
        setLoadingData(false)
      })
  }, [params.id])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const res = await fetch(`/api/membros/${params.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })

    if (res.ok) {
      router.push('/dashboard/membros')
    } else {
      alert('Erro ao atualizar membro')
      setLoading(false)
    }
  }

  if (loadingData) return <div className="p-8 text-gray-500">Carregando...</div>

  return (
    <div className="p-4 md:p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Editar Membro</h2>
          <p className="text-sm text-gray-500">Atualize as informações do membro</p>
        </div>
        <a href="/dashboard/membros" className="text-gray-500 hover:text-gray-700 text-sm">← Voltar</a>
      </div>

      <div className="bg-white rounded-2xl shadow p-4 md:p-8 w-full">
        <form onSubmit={handleSubmit} className="space-y-4">

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Nome completo *</label>
              <input name="nome" type="text" required value={form.nome} onChange={handleChange} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Telefone</label>
              <input name="telefone" type="text" value={form.telefone} onChange={handleChange} className={inputClass} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Cidade</label>
              <input name="cidade" type="text" value={form.cidade} onChange={handleChange} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Instrumento</label>
              <input name="instrumento" type="text" value={form.instrumento} onChange={handleChange} className={inputClass} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className={labelClass}>Tipo</label>
              <select name="tipo" value={form.tipo} onChange={handleChange} className={inputClass}>
                <option value="">Selecione...</option>
                <option value="Músico">Músico</option>
                <option value="Cantor">Cantor</option>
                <option value="Técnico">Técnico</option>
                <option value="Líder">Líder</option>
                <option value="Outro">Outro</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Grupo</label>
              <select name="grupo" value={form.grupo} onChange={handleChange} className={inputClass}>
                <option value="">Selecione...</option>
                <option value="Grupo A">Grupo A</option>
                <option value="Grupo B">Grupo B</option>
                <option value="Grupo C">Grupo C</option>
                <option value="Grupo D">Grupo D</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Nível de acesso</label>
              <select name="nivel_acesso" value={form.nivel_acesso} onChange={handleChange} className={inputClass}>
                <option value="">Selecione...</option>
                <option value="Administrador">Administrador</option>
                <option value="Ministério">Ministério</option>
                <option value="Auxiliar">Auxiliar</option>
                <option value="Membro">Membro</option>
              </select>
            </div>
          </div>

          <div>
            <label className={labelClass}>Status</label>
            <select name="status" value={form.status} onChange={handleChange} className={inputClass}>
              <option value="">Selecione...</option>
              <option value="Ativo">Ativo</option>
              <option value="Inativo">Inativo</option>
            </select>
          </div>

          <div className="flex flex-col md:flex-row gap-3 pt-2">
            <button type="submit" disabled={loading}
              className="w-full md:w-auto bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 text-sm">
              {loading ? 'Salvando...' : 'Salvar Alterações'}
            </button>
            <a href="/dashboard/membros"
              className="w-full md:w-auto text-center bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-200 transition text-sm">
              Cancelar
            </a>
          </div>

        </form>
      </div>
    </div>
  )
}