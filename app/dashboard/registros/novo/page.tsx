'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

const inputClass = "w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
const labelClass = "block text-sm font-medium text-gray-700 mb-1"

type Hospital = { id: string; nome: string }
type Membro = { id: string; nome: string }

export default function NovoRegistro() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [hospitais, setHospitais] = useState<Hospital[]>([])
  const [membros, setMembros] = useState<Membro[]>([])
  const [busca, setBusca] = useState('')
  const [membrosSelecionados, setMembrosSelecionados] = useState<string[]>([])
  const [form, setForm] = useState({
    hospital_id: '',
    data: '',
    hora_inicio: '',
    hora_termino: '',
    quem_autorizou: '',
    hinos_executados: '0',
    teve_oracao: 'false',
    observacoes: '',
  })

  useEffect(() => {
    fetch('/api/hospitais')
      .then(res => res.json())
      .then(data => { if (Array.isArray(data)) setHospitais(data) })

    fetch('/api/membros')
      .then(res => res.json())
      .then(data => { if (Array.isArray(data)) setMembros(data) })
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const adicionarMembro = (nome: string) => {
    if (!membrosSelecionados.includes(nome)) {
      setMembrosSelecionados(prev => [...prev, nome])
    }
    setBusca('')
  }

  const removerMembro = (nome: string) => {
    setMembrosSelecionados(prev => prev.filter(n => n !== nome))
  }

  const membrosFiltrados = membros.filter(m =>
    busca.length > 0 &&
    m.nome.toLowerCase().includes(busca.toLowerCase()) &&
    !membrosSelecionados.includes(m.nome)
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const res = await fetch('/api/registros', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        hinos_executados: parseInt(form.hinos_executados),
        teve_oracao: form.teve_oracao === 'true',
        membros_presentes: membrosSelecionados.join(', '),
      }),
    })

    if (res.ok) {
      router.push('/dashboard/registros')
    } else {
      alert('Erro ao salvar registro')
      setLoading(false)
    }
  }

  return (
    <div className="p-4 md:p-6 max-w-4xl">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Novo Registro de Atendimento</h2>
          <p className="text-sm text-gray-500">Preencha os dados do atendimento</p>
        </div>
        <a href="/dashboard/registros" className="text-gray-500 hover:text-gray-700 text-sm">← Voltar</a>
      </div>

      <div className="bg-white rounded-2xl shadow p-4 md:p-6 w-full">
        <form onSubmit={handleSubmit} className="space-y-5">

          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            <div className="md:col-span-2">
              <label className={labelClass}>Hospital *</label>
              <select name="hospital_id" required value={form.hospital_id} onChange={handleChange} className={inputClass}>
                <option value="">Selecione...</option>
                {hospitais.map(h => (
                  <option key={h.id} value={h.id}>{h.nome}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Data *</label>
              <input name="data" type="date" required value={form.data} onChange={handleChange} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Hora início *</label>
              <input name="hora_inicio" type="time" required value={form.hora_inicio} onChange={handleChange} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Hora término *</label>
              <input name="hora_termino" type="time" required value={form.hora_termino} onChange={handleChange} className={inputClass} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="md:col-span-2">
              <label className={labelClass}>Quem autorizou a entrada</label>
              <input name="quem_autorizou" type="text" value={form.quem_autorizou} onChange={handleChange} className={inputClass} placeholder="Nome do responsável" />
            </div>
            <div>
              <label className={labelClass}>Hinos executados</label>
              <input name="hinos_executados" type="number" min="0" value={form.hinos_executados} onChange={handleChange} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Houve oração?</label>
              <select name="teve_oracao" value={form.teve_oracao} onChange={handleChange} className={inputClass}>
                <option value="true">✅ Sim</option>
                <option value="false">❌ Não</option>
              </select>
            </div>
          </div>

          <hr className="border-gray-100" />

          <div>
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-2">Membros presentes</h3>
            <div className="relative mb-2">
              <input
                type="text"
                value={busca}
                onChange={e => setBusca(e.target.value)}
                className={inputClass}
                placeholder="Digite o nome para buscar e adicionar..."
              />
              {membrosFiltrados.length > 0 && (
                <div className="absolute z-10 w-full bg-white border border-gray-200 rounded-lg shadow-lg mt-1 max-h-48 overflow-y-auto">
                  {membrosFiltrados.map(m => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => adicionarMembro(m.nome)}
                      className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition"
                    >
                      {m.nome}
                    </button>
                  ))}
                </div>
              )}
            </div>
            {membrosSelecionados.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {membrosSelecionados.map(nome => (
                  <span key={nome} className="flex items-center gap-1 bg-blue-50 text-blue-700 text-sm font-medium px-3 py-1 rounded-full">
                    {nome}
                    <button type="button" onClick={() => removerMembro(nome)} className="text-blue-400 hover:text-blue-700 ml-1 font-bold">×</button>
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400">Nenhum membro adicionado ainda</p>
            )}
          </div>

          <hr className="border-gray-100" />

          <div>
            <label className={labelClass}>Observações</label>
            <textarea name="observacoes" rows={2} value={form.observacoes} onChange={handleChange} className={inputClass} placeholder="Alguma observação sobre o atendimento..." />
          </div>

          <div className="flex flex-col md:flex-row gap-3 pt-1">
            <button type="submit" disabled={loading}
              className="w-full md:w-auto bg-blue-600 text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 text-sm">
              {loading ? 'Salvando...' : 'Salvar Registro'}
            </button>
            <a href="/dashboard/registros"
              className="w-full md:w-auto text-center bg-gray-100 text-gray-700 px-6 py-2.5 rounded-lg font-semibold hover:bg-gray-200 transition text-sm">
              Cancelar
            </a>
          </div>

        </form>
      </div>
    </div>
  )
}