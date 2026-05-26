'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '10px 14px', borderRadius: 8,
  border: '1px solid #e2e8f0', background: '#f8fafc',
  fontSize: 14, color: '#1e293b', outline: 'none', boxSizing: 'border-box',
}

const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: 12, fontWeight: 600, color: '#64748b', marginBottom: 6,
}

const secaoStyle: React.CSSProperties = {
  fontSize: 11, fontWeight: 700, color: '#94a3b8',
  letterSpacing: 1, textTransform: 'uppercase', marginBottom: 16,
}

const estados = ['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO']
const diasSemana = ['Segunda-feira','Terça-feira','Quarta-feira','Quinta-feira','Sexta-feira','Sábado','Domingo']

export default function NovoHospital() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    nome: '', endereco: '', numero: '', bairro: '', cidade: '',
    estado: '', contato: '', turno: '', responsavel: '',
    dia_semana: '', site: '', localizacao: '', observacoes: '',
    data_inicio_atividade: ''
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const res = await fetch('/api/hospitais', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, data_inicio_atividade: form.data_inicio_atividade || null }),
    })

    if (res.ok) router.push('/dashboard/hospitais')
    else { alert('Erro ao salvar hospital'); setLoading(false) }
  }

  return (
    <div style={{ background: '#f1f5f9', minHeight: '100vh', padding: '28px 40px' }} className="novo-wrap">
      <style>{`
        @media (max-width: 768px) {
          .novo-wrap { padding: 16px !important; }
          .grid-2 { grid-template-columns: 1fr !important; }
          .grid-3 { grid-template-columns: 1fr !important; }
          .grid-4 { grid-template-columns: 1fr !important; }
        }
        input:focus, select:focus, textarea:focus { border-color: #2563eb !important; background: #fff !important; }
      `}</style>

      <div style={{ maxWidth: 1280, margin: '0 auto' }}>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: '#1e293b', margin: 0 }}>Novo Hospital</h1>
            <p style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>Cadastre um novo hospital</p>
          </div>
          <a href="/dashboard/hospitais" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: '#64748b', textDecoration: 'none' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
            </svg>
            Voltar
          </a>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.06)', overflow: 'hidden' }}>

            {/* Identificação - ÚNICO CAMPO OBRIGATÓRIO */}
            <div style={{ padding: '24px 28px', borderBottom: '1px solid #f1f5f9' }}>
              <p style={secaoStyle}>Identificação</p>
              <div>
                <label style={labelStyle}>Nome do hospital *</label>
                <input name="nome" type="text" required value={form.nome} onChange={handleChange} style={inputStyle} placeholder="Ex: Hospital Santa Casa" />
              </div>
            </div>

            {/* Endereço - opcional */}
            <div style={{ padding: '24px 28px', borderBottom: '1px solid #f1f5f9' }}>
              <p style={secaoStyle}>Endereço <span style={{ fontSize: 10, color: '#cbd5e1', fontWeight: 400, letterSpacing: 0 }}>(opcional)</span></p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div className="grid-3" style={{ display: 'grid', gridTemplateColumns: '1fr 100px 1fr', gap: 16 }}>
                  <div>
                    <label style={labelStyle}>Endereço</label>
                    <input name="endereco" type="text" value={form.endereco} onChange={handleChange} style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Número</label>
                    <input name="numero" type="text" value={form.numero} onChange={handleChange} style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Bairro</label>
                    <input name="bairro" type="text" value={form.bairro} onChange={handleChange} style={inputStyle} />
                  </div>
                </div>
                <div className="grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 120px', gap: 16 }}>
                  <div>
                    <label style={labelStyle}>Cidade</label>
                    <input name="cidade" type="text" value={form.cidade} onChange={handleChange} style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Estado</label>
                    <select name="estado" value={form.estado} onChange={handleChange} style={inputStyle}>
                      <option value="">UF</option>
                      {estados.map(uf => <option key={uf} value={uf}>{uf}</option>)}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Funcionamento - opcional */}
            <div style={{ padding: '24px 28px', borderBottom: '1px solid #f1f5f9' }}>
              <p style={secaoStyle}>Funcionamento <span style={{ fontSize: 10, color: '#cbd5e1', fontWeight: 400, letterSpacing: 0 }}>(opcional)</span></p>
              <div className="grid-4" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 16 }}>
                <div>
                  <label style={labelStyle}>Turno</label>
                  <select name="turno" value={form.turno} onChange={handleChange} style={inputStyle}>
                    <option value="">Selecione...</option>
                    <option value="Manhã">Manhã</option>
                    <option value="Tarde">Tarde</option>
                    <option value="Manhã e Tarde">Manhã e Tarde</option>
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Dia da semana</label>
                  <select name="dia_semana" value={form.dia_semana} onChange={handleChange} style={inputStyle}>
                    <option value="">Selecione...</option>
                    {diasSemana.map(dia => <option key={dia} value={dia}>{dia}</option>)}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Responsável</label>
                  <input name="responsavel" type="text" value={form.responsavel} onChange={handleChange} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Início das atividades</label>
                  <input name="data_inicio_atividade" type="date" value={form.data_inicio_atividade} onChange={handleChange} style={inputStyle} />
                </div>
              </div>
            </div>

            {/* Informações adicionais - opcional */}
            <div style={{ padding: '24px 28px', borderBottom: '1px solid #f1f5f9' }}>
              <p style={secaoStyle}>Informações adicionais <span style={{ fontSize: 10, color: '#cbd5e1', fontWeight: 400, letterSpacing: 0 }}>(opcional)</span></p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div className="grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div>
                    <label style={labelStyle}>Contato</label>
                    <input name="contato" type="text" value={form.contato} onChange={handleChange} style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Link Google Maps</label>
                    <input name="localizacao" type="text" value={form.localizacao} onChange={handleChange} style={inputStyle} placeholder="https://maps.app.goo.gl/..." />
                  </div>
                </div>
                <div>
                  <label style={labelStyle}>Site da instituição</label>
                  <input name="site" type="text" value={form.site} onChange={handleChange} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Observações / Regras específicas</label>
                  <textarea name="observacoes" rows={3} value={form.observacoes} onChange={handleChange} style={{ ...inputStyle, resize: 'vertical' }} />
                </div>
              </div>
            </div>

            {/* Botões */}
            <div style={{ padding: '20px 28px', display: 'flex', gap: 12 }}>
              <button type="submit" disabled={loading} style={{
                padding: '10px 24px', borderRadius: 8, border: 'none',
                background: loading ? '#93c5fd' : '#2563eb',
                color: '#fff', fontSize: 14, fontWeight: 600,
                cursor: loading ? 'not-allowed' : 'pointer',
              }}>
                {loading ? 'Salvando...' : 'Salvar Hospital'}
              </button>
              <a href="/dashboard/hospitais" style={{
                padding: '10px 24px', borderRadius: 8, background: '#f1f5f9',
                color: '#475569', fontSize: 14, fontWeight: 600, textDecoration: 'none',
                display: 'inline-flex', alignItems: 'center',
              }}>
                Cancelar
              </a>
            </div>

          </div>
        </form>
      </div>
    </div>
  )
}