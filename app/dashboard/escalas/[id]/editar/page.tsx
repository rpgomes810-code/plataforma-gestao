'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'

const inputClass = "w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
const labelClass = "block text-sm font-medium text-gray-700 mb-1"

type Hospital = { id: string; nome: string }
type Grupo = { id: string; nome: string }
type Membro = { id: string; nome: string }

export default function EditarEscala() {
  const router = useRouter()
  const params = useParams()
  const [loading, setLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(true)
  const [hospitais, setHospitais] = useState<Hospital[]>([])
  const [grupos, setGrupos] = useState<Grupo[]>([])
  const [atendentes, setAtendentes] = useState<Membro[]>([])
  const [form, setForm] = useState({
    data: '',
    grupo: '',
    hospital_id: '',
    local_texto: '',
    hora_inicio: '',
    atendentes: '',
    observacoes: '',
  })

  useEffect(() => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    supabase.from('hospitais').select('id, nome').order('nome', { ascending: true })
      .then(({ data }) => setHospitais(data || []))

    supabase.from('membros').select('id, nome').eq('perfil', 'Atendente').eq('status', 'Ativo').order('nome', { ascending: true })
  .then(({ data }) => setAtendentes(data || []))

    fetch('/api/grupos').then(res => res.json()).then(data => { if (Array.isArray(data)) setGrupos(data) })

    supabase.from('escalas').select('*').eq('id', params.id).single()
      .then(({ data }) => {
        if (data) {
          setForm({
            data: data.data || '',
            grupo: data.grupo || '',
            hospital_id: data.hospital_id || '',
            local_texto: data.local_texto || '',
            hora_inicio: data.hora_inicio || '',
            atendentes: data.atendentes || '',
            observacoes: data.observacoes || '',
          })
        }
        setLoadingData(false)
      })
  }, [params.id])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    if (name === 'hospital_id') {
      const hospital = hospitais.find(h => h.id === value)
      setForm({ ...form, hospital_id: value, local_texto: hospital?.nome || '' })
    } else {
      setForm({ ...form, [name]: value })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const res = await fetch(`/api/escalas/${params.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })

    if (res.ok) {
      router.push('/dashboard/escalas')
    } else {
      alert('Erro ao atualizar escala')
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Tem certeza que deseja excluir esta escala?')) return

    const res = await fetch(`/api/escalas/${params.id}`, { method: 'DELETE' })

    if (res.ok) {
      router.push('/dashboard/escalas')
    } else {
      alert('Erro ao excluir escala')
    }
  }

  if (loadingData) return <div className="p-8 text-gray-500">Carregando...</div>

  return (
    <div className="p-4 md:p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Editar Escala</h2>
          <p className="text-sm text-gray-500">Atualize as informações da escala</p>
        </div>
        <a href="/dashboard/escalas" className="text-gray-500 hover:text-gray-700 text-sm">← Voltar</a>
      </div>

      <div className="bg-white rounded-2xl shadow p-4 md:p-8 w-full">
        <form onSubmit={handleSubmit} className="space-y-4">

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className={labelClass}>Data *</label>
              <input name="data" type="date" required value={form.data} onChange={handleChange} className={inputClass}/>
            </div>
            <div>
              <label className={labelClass}>Grupo *</label>
              <select name="grupo" required value={form.grupo} onChange={handleChange} className={inputClass}>
                <option value="">Selecione o grupo...</option>
                {grupos.map(g => (<option key={g.id} value={g.nome}>{g.nome}</option>))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Hora de início *</label>
              <input name="hora_inicio" type="time" required value={form.hora_inicio} onChange={handleChange} className={inputClass}/>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Hospital</label>
              <select name="hospital_id" value={form.hospital_id} onChange={handleChange} className={inputClass}>
                <option value="">Selecione um hospital...</option>
                {hospitais.map(h => (<option key={h.id} value={h.id}>{h.nome}</option>))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Local (texto livre)</label>
              <input name="local_texto" type="text" value={form.local_texto} onChange={handleChange} className={inputClass}/>
            </div>
          </div>

          <div>
            <label className={labelClass}>Atendente(s) *</label>
            <select name="atendentes" required value={form.atendentes} onChange={handleChange} className={inputClass}>
              <option value="">Selecione o atendente...</option>
              {atendentes.map(a => (<option key={a.id} value={a.nome}>{a.nome}</option>))}
            </select>
          </div>

          <div>
            <label className={labelClass}>Observações</label>
            <textarea name="observacoes" rows={2} value={form.observacoes} onChange={handleChange} className={inputClass}/>
          </div>

          <div className="flex flex-col md:flex-row gap-3 pt-2">
            <button type="submit" disabled={loading}
              className="w-full md:w-auto bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 text-sm">
              {loading ? 'Salvando...' : 'Salvar Alterações'}
            </button>
            <a href="/dashboard/escalas"
              className="w-full md:w-auto text-center bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-200 transition text-sm">
              Cancelar
            </a>
            <button type="button" onClick={handleDelete}
              className="w-full md:w-auto bg-red-50 text-red-600 px-6 py-3 rounded-lg font-semibold hover:bg-red-100 transition text-sm md:ml-auto">
              🗑️ Excluir
            </button>
          </div>

        </form>
      </div>
    </div>
  )
}