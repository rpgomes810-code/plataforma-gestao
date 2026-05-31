'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

const inputClass = "w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
const labelClass = "block text-sm font-medium text-gray-700 mb-1"

function mascaraTelefone(valor: string) {
  const numeros = valor.replace(/\D/g, '').slice(0, 11)
  if (numeros.length <= 10) {
    return numeros
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{4})(\d)/, '$1-$2')
  }
  return numeros
    .replace(/(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{5})(\d)/, '$1-$2')
}

type Grupo = { id: string; nome: string }

export default function NovoMembro() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [grupos, setGrupos] = useState<Grupo[]>([])
  const [form, setForm] = useState({
    nome: '',
    telefone: '',
    data_nascimento: '',
    comum: '',
    cidade: '',
    tipo: '',
    instrumento: '',
    grupo: '',
    nivel_acesso: '',
    cargo: 'Nenhum',
    observacoes: '',
  })

  useEffect(() => {
    fetch('/api/grupos')
      .then(res => res.json())
      .then(data => { if (Array.isArray(data)) setGrupos(data) })
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    if (e.target.name === 'telefone') {
      setForm({ ...form, telefone: mascaraTelefone(e.target.value) })
    } else {
      setForm({ ...form, [e.target.name]: e.target.value })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData()
    Object.entries(form).forEach(([key, value]) => formData.append(key, value))

    const res = await fetch('/api/membros', {
      method: 'POST',
      body: formData,
    })

    if (res.ok || res.redirected) {
      router.push('/dashboard/membros')
    } else {
      alert('Erro ao salvar membro')
      setLoading(false)
    }
  }

  return (
    <div className="p-4 md:p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Novo Membro</h2>
          <p className="text-sm text-gray-500">Preencha os dados do novo membro</p>
        </div>
        <a href="/dashboard/membros" className="text-gray-500 hover:text-gray-700 text-sm">← Voltar</a>
      </div>

      <div className="bg-white rounded-2xl shadow p-4 md:p-8 w-full">
        <form onSubmit={handleSubmit} className="space-y-6">

          <div>
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">Dados pessoais</h3>
            <div className="space-y-4">
              <div>
                <label className={labelClass}>Nome completo *</label>
                <input name="nome" type="text" required value={form.nome} onChange={handleChange} className={inputClass} placeholder="Nome do membro" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Telefone *</label>
                  <input name="telefone" type="text" required value={form.telefone} onChange={handleChange} className={inputClass} placeholder="(11) 99999-0000" maxLength={15} />
                </div>
                <div>
                  <label className={labelClass}>Data de nascimento *</label>
                  <input name="data_nascimento" type="date" required value={form.data_nascimento} onChange={handleChange} className={inputClass} />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Comum *</label>
                  <input name="comum" type="text" required value={form.comum} onChange={handleChange} className={inputClass} placeholder="Ex: Vila Arens, Jundiaí" />
                </div>
                <div>
                  <label className={labelClass}>Cidade *</label>
                  <input name="cidade" type="text" required value={form.cidade} onChange={handleChange} className={inputClass} placeholder="Ex: Jundiaí" />
                </div>
              </div>
            </div>
          </div>

          <hr className="border-gray-100" />

          <div>
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">Dados do ministério</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Tipo *</label>
                  <select name="tipo" required value={form.tipo} onChange={handleChange} className={inputClass}>
                    <option value="">Selecione...</option>
                    <option value="Músico">Músico</option>
                    <option value="Vocal">Vocal</option>
                    <option value="Atendente">Atendente</option>
                    <option value="Organizador">Organizador</option>
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Instrumento *</label>
                  <select name="instrumento" required value={form.instrumento} onChange={handleChange} className={inputClass}>
                    <option value="">Selecione...</option>
                    <option value="Nenhum">Nenhum</option>
                    <option value="Violino">Violino</option>
                    <option value="Viola">Viola</option>
                    <option value="Violoncelo">Violoncelo</option>
                    <option value="Vocal">Vocal</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Grupo *</label>
                  <select name="grupo" required value={form.grupo} onChange={handleChange} className={inputClass}>
                    <option value="">Selecione...</option>
                    {grupos.map(g => (
                      <option key={g.id} value={g.nome}>{g.nome}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Nível de acesso *</label>
                  <select name="nivel_acesso" required value={form.nivel_acesso} onChange={handleChange} className={inputClass}>
                    <option value="">Selecione...</option>
                    <option value="Colaborador">Colaborador</option>
                    <option value="Auxiliar">Auxiliar</option>
                    <option value="Ministério">Ministério</option>
                    <option value="Administrador">Administrador</option>
                  </select>
                </div>
              </div>
              <div>
                <label className={labelClass}>Cargo</label>
                <select name="cargo" value={form.cargo} onChange={handleChange} className={inputClass}>
                  <option value="Nenhum">Nenhum</option>
                  <option value="Ancião">Ancião</option>
                  <option value="Diácono">Diácono</option>
                  <option value="Secretário">Secretário</option>
                  <option value="Gestor">Gestor</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>Observações</label>
                <textarea name="observacoes" rows={3} value={form.observacoes} onChange={handleChange} className={inputClass} placeholder="Observações sobre o membro..." />
              </div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-3 pt-2">
            <button type="submit" disabled={loading}
              className="w-full md:w-auto bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 text-sm">
              {loading ? 'Salvando...' : 'Salvar Membro'}
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