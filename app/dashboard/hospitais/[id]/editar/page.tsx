'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'

const estados = [
  'AC','AL','AP','AM','BA','CE','DF','ES','GO','MA',
  'MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN',
  'RS','RO','RR','SC','SP','SE','TO'
]

const diasSemana = [
  'Segunda-feira','Terça-feira','Quarta-feira',
  'Quinta-feira','Sexta-feira','Sábado','Domingo'
]

const inputClass = "w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
const labelClass = "block text-sm font-medium text-gray-700 mb-1"

export default function EditarHospital() {
  const router = useRouter()
  const params = useParams()
  const [loading, setLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(true)
  const [form, setForm] = useState({
    nome: '', endereco: '', numero: '', bairro: '', cidade: '',
    estado: '', contato: '', turno: '', responsavel: '',
    dia_semana: '', site: '', localizacao: '', observacoes: ''
  })

  useEffect(() => {
    fetch(`/api/hospitais/${params.id}`)
      .then(res => res.json())
      .then(data => {
        setForm({
          nome:        data.nome || '',
          endereco:    data.endereco || '',
          numero:      data.numero || '',
          bairro:      data.bairro || '',
          cidade:      data.cidade || '',
          estado:      data.estado || '',
          contato:     data.contato || '',
          turno:       data.turno || '',
          responsavel: data.responsavel || '',
          dia_semana:  data.dia_semana || '',
          site:        data.site || '',
          localizacao: data.localizacao || '',
          observacoes: data.observacoes || '',
        })
        setLoadingData(false)
      })
  }, [params.id])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const res = await fetch(`/api/hospitais/${params.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })

    if (res.ok) {
      router.push('/dashboard/hospitais')
    } else {
      alert('Erro ao atualizar hospital')
      setLoading(false)
    }
  }

  if (loadingData) return <div className="p-8 text-gray-500">Carregando...</div>

  return (
    <div className="p-4 md:p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Editar Hospital</h2>
          <p className="text-sm text-gray-500">Atualize as informações do hospital</p>
        </div>
        <a href="/dashboard/hospitais" className="text-gray-500 hover:text-gray-700 text-sm">← Voltar</a>
      </div>

      <div className="bg-white rounded-2xl shadow p-4 md:p-8 w-full">
        <form onSubmit={handleSubmit} className="space-y-4">

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-3">
              <label className={labelClass}>Nome do hospital *</label>
              <input name="nome" type="text" required value={form.nome} onChange={handleChange} className={inputClass}/>
            </div>
            <div>
              <label className={labelClass}>Contato</label>
              <input name="contato" type="text" value={form.contato} onChange={handleChange} className={inputClass}/>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            <div className="md:col-span-4">
              <label className={labelClass}>Endereço</label>
              <input name="endereco" type="text" value={form.endereco} onChange={handleChange} className={inputClass}/>
            </div>
            <div className="md:col-span-1">
              <label className={labelClass}>Número</label>
              <input name="numero" type="text" value={form.numero} onChange={handleChange} className={inputClass}/>
            </div>
            <div className="md:col-span-3">
              <label className={labelClass}>Bairro</label>
              <input name="bairro" type="text" value={form.bairro} onChange={handleChange} className={inputClass}/>
            </div>
            <div className="md:col-span-2">
              <label className={labelClass}>Cidade</label>
              <input name="cidade" type="text" value={form.cidade} onChange={handleChange} className={inputClass}/>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className={labelClass}>Estado</label>
              <select name="estado" value={form.estado} onChange={handleChange} className={inputClass}>
                <option value="">Selecione...</option>
                {estados.map(uf => <option key={uf} value={uf}>{uf}</option>)}
              </select>
            </div>
            <div>
              <label className={labelClass}>Turno *</label>
              <select name="turno" required value={form.turno} onChange={handleChange} className={inputClass}>
                <option value="">Selecione...</option>
                <option value="Manhã">Manhã</option>
                <option value="Tarde">Tarde</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Dia da semana</label>
              <select name="dia_semana" value={form.dia_semana} onChange={handleChange} className={inputClass}>
                {diasSemana.map(dia => <option key={dia} value={dia}>{dia}</option>)}
              </select>
            </div>
            <div>
              <label className={labelClass}>Responsável</label>
              <input name="responsavel" type="text" value={form.responsavel} onChange={handleChange} className={inputClass}/>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Site da instituição</label>
              <input name="site" type="text" value={form.site} onChange={handleChange} className={inputClass}/>
            </div>
            <div>
              <label className={labelClass}>Link de localização (Google Maps)</label>
              <input name="localizacao" type="text" value={form.localizacao} onChange={handleChange} className={inputClass}/>
            </div>
          </div>

          <div>
            <label className={labelClass}>Observações / Regras específicas</label>
            <textarea name="observacoes" rows={3} value={form.observacoes} onChange={handleChange} className={inputClass}/>
          </div>

          <div className="flex flex-col md:flex-row gap-3 pt-2">
            <button type="submit" disabled={loading}
              className="w-full md:w-auto bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 text-sm">
              {loading ? 'Salvando...' : 'Salvar Alterações'}
            </button>
            <a href="/dashboard/hospitais"
              className="w-full md:w-auto text-center bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-200 transition text-sm">
              Cancelar
            </a>
          </div>

        </form>
      </div>
    </div>
  )
}