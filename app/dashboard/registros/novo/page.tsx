'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

const inputClass = "w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
const labelClass = "block text-sm font-medium text-gray-700 mb-1"

type Hospital = { id: string; nome: string }
type Membro = { id: string; nome: string }

export default function NovoRegistro() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [hospitais, setHospitais] = useState<Hospital[]>([])
  const [membros, setMembros] = useState<Membro[]>([])
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
      .then(setHospitais)

    fetch('/api/membros')
      .then(res => res.json())
      .then(setMembros)
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const toggleMembro = (nome: string) => {
    setMembrosSelecionados(prev =>
      prev.includes(nome) ? prev.filter(n => n !== nome) : [...prev, nome]
    )
  }

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
    <div className="p-4 md:p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Novo Registro de Atendimento</h2>
          <p className="text-sm text-gray-500">Preencha os dados do atendimento</p>
        </div>
        <a href="/dashboard/registros" className="text-gray-500 hover:text-gray-700 text-sm">← Voltar</a>
      </div>

      <div className="bg-white rounded-2xl shadow p-4 md:p-8 w-full">
        <form onSubmit={handleSubmit} className="space-y-6">

          <div>
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">Informações do atendimento</h3>
            <div className="space-y-4">
              <div>
                <label className={labelClass}>Hospital *</label>
                <select name="hospital_id" required value={form.hospital_id} onChange={handleChange} className={inputClass}>
                  <option value="">Selecione o hospital...</option>
                  {hospitais.map(h => (
                    <option key={h.id} value={h.id}>{h.nome}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className={labelClass}>Data *</label>
                  <input name="data" type="date" required value={form.data} onChange={handleChange} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Hora de início *</label>
                  <input name="hora_inicio" type="time" required value={form.hora_inicio} onChange={handleChange} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Hora de término *</label>
                  <input name="hora_termino" type="time" required value={form.hora_termino} onChange={handleChange} className={inputClass} />
                </div>
              </div>
              <div>
                <label className={labelClass}>Quem autorizou a entrada</label>
                <input name="quem_autorizou" type="text" value={form.quem_autorizou} onChange={handleChange} className={inputClass} placeholder="Nome do responsável que autorizou" />
              </div>
            </div>
          </div>

          <hr className="border-gray-100" />

          <div>
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">Membros presentes</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-2">
              {membros.map(membro => (
                <button
                  key={membro.id}
                  type="button"
                  onClick={() => toggleMembro(membro.nome)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium border transition text-left ${
                    membrosSelecionados.includes(membro.nome)
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {membrosSelecionados.includes(membro.nome) ? '✓ ' : ''}{membro.nome}
                </button>
              ))}
            </div>
            {membrosSelecionados.length > 0 && (
              <p className="text-xs text-gray-400 mt-2">{membrosSelecionados.length} membro(s) selecionado(s)</p>
            )}
          </div>

          <hr className="border-gray-100" />

          <div>
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">Detalhes</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              <div>
                <label className={labelClass}>Observações</label>
                <textarea name="observacoes" rows={3} value={form.observacoes} onChange={handleChange} className={inputClass} placeholder="Alguma observação sobre o atendimento..." />
              </div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-3 pt-2">
            <button type="submit" disabled={loading}
              className="w-full md:w-auto bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 text-sm">
              {loading ? 'Salvando...' : 'Salvar Registro'}
            </button>
            <a href="/dashboard/registros"
              className="w-full md:w-auto text-center bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-200 transition text-sm">
              Cancelar
            </a>
          </div>

        </form>
      </div>
    </div>
  )
}