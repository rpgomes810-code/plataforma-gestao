'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

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

function formatUrl(value: string) {
  if (!value) return ''
  if (value.startsWith('http://') || value.startsWith('https://')) return value
  return 'https://' + value
}

export default function NovoHospital() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)

    const hospital = {
      nome:        formData.get('nome'),
      endereco:    formData.get('endereco'),
      numero:      formData.get('numero'),
      bairro:      formData.get('bairro'),
      cidade:      formData.get('cidade'),
      estado:      formData.get('estado'),
      contato:     formData.get('contato'),
      turno:       formData.get('turno'),
      responsavel: formData.get('responsavel'),
      dia_semana:  formData.get('dia_semana'),
      site:        formatUrl(formData.get('site') as string),
      localizacao: formatUrl(formData.get('localizacao') as string),
      observacoes: formData.get('observacoes'),
    }

    const res = await fetch('/api/hospitais', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(hospital),
    })

    if (res.ok) {
      router.push('/dashboard/hospitais')
    } else {
      alert('Erro ao salvar hospital')
      setLoading(false)
    }
  }

  return (
    <div className="p-4 md:p-6">

      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Novo Hospital</h2>
          <p className="text-sm text-gray-500">Cadastre um novo hospital</p>
        </div>
        <a href="/dashboard/hospitais" className="text-gray-500 hover:text-gray-700 text-sm">← Voltar</a>
      </div>

      <div className="bg-white rounded-2xl shadow p-4 md:p-8 w-full">
        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Nome + Contato */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-3">
              <label className={labelClass}>Nome do hospital *</label>
              <input name="nome" type="text" required placeholder="Ex: Hospital Santa Casa" className={inputClass}/>
            </div>
            <div>
              <label className={labelClass}>Contato</label>
              <input name="contato" type="text" placeholder="(11) 4521-0000" className={inputClass}/>
            </div>
          </div>

          {/* Endereço, Número, Bairro, Cidade */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            <div className="md:col-span-5">
              <label className={labelClass}>Endereço</label>
              <input name="endereco" type="text" placeholder="Ex: Rua das Flores" className={inputClass}/>
            </div>
            <div className="md:col-span-1">
              <label className={labelClass}>Número</label>
              <input name="numero" type="text" placeholder="Nº" className={inputClass}/>
            </div>
            <div className="md:col-span-3">
              <label className={labelClass}>Bairro</label>
              <input name="bairro" type="text" placeholder="Ex: Centro" className={inputClass}/>
            </div>
            <div className="md:col-span-3">
              <label className={labelClass}>Cidade</label>
              <input name="cidade" type="text" placeholder="Ex: Jundiaí" className={inputClass}/>
            </div>
          </div>

          {/* Estado, Turno, Dia, Responsável */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className={labelClass}>Estado</label>
              <select name="estado" className={inputClass}>
                <option value="">Selecione...</option>
                {estados.map(uf => <option key={uf} value={uf}>{uf}</option>)}
              </select>
            </div>
            <div>
              <label className={labelClass}>Turno *</label>
              <select name="turno" required className={inputClass}>
                <option value="">Selecione...</option>
                <option value="Manhã">Manhã</option>
                <option value="Tarde">Tarde</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Dia da semana</label>
              <select name="dia_semana" className={inputClass}>
                {diasSemana.map(dia => <option key={dia} value={dia}>{dia}</option>)}
              </select>
            </div>
            <div>
              <label className={labelClass}>Responsável</label>
              <input name="responsavel" type="text" placeholder="Nome do responsável" className={inputClass}/>
            </div>
          </div>

          {/* Site e Localização */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Site da instituição</label>
              <input name="site" type="text" placeholder="www.santacasa.org.br" className={inputClass}/>
            </div>
            <div>
              <label className={labelClass}>Link de localização (Google Maps)</label>
              <input name="localizacao" type="text" placeholder="maps.google.com/?q=..." className={inputClass}/>
            </div>
          </div>

          {/* Observações */}
          <div>
            <label className={labelClass}>Observações / Regras específicas</label>
            <textarea name="observacoes" rows={3}
              placeholder="Regras específicas deste hospital, setores permitidos, restrições..."
              className={inputClass}/>
          </div>

          {/* Botões */}
          <div className="flex flex-col md:flex-row gap-3 pt-2">
            <button type="submit" disabled={loading}
              className="w-full md:w-auto bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 text-sm">
              {loading ? 'Salvando...' : 'Salvar Hospital'}
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