'use client'

import { useState } from 'react'

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '10px 14px', borderRadius: 8,
  border: '1px solid #e2e8f0', background: '#f8fafc',
  fontSize: 14, color: '#1e293b', outline: 'none', boxSizing: 'border-box',
}

const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: 12, fontWeight: 600, color: '#64748b', marginBottom: 6,
}

function mascaraTelefone(valor: string) {
  const numeros = valor.replace(/\D/g, '').slice(0, 11)
  if (numeros.length <= 10) return numeros.replace(/(\d{2})(\d)/, '($1) $2').replace(/(\d{4})(\d)/, '$1-$2')
  return numeros.replace(/(\d{2})(\d)/, '($1) $2').replace(/(\d{5})(\d)/, '$1-$2')
}

export default function Candidatar() {
  const [form, setForm] = useState({
    nome: '', telefone: '', data_nascimento: '', comum: '', cidade: '',
    instrumento: '', instrumento_outro: '',
    como_conheceu: '', como_conheceu_indicacao: '', como_conheceu_outros: '',
    disponibilidade: '',
  })
  const [enviando, setEnviando] = useState(false)
  const [enviado, setEnviado] = useState(false)
  const [erro, setErro] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    if (name === 'telefone') {
      setForm({ ...form, telefone: mascaraTelefone(value) })
    } else {
      setForm({ ...form, [name]: value })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setEnviando(true)
    setErro('')
    const res = await fetch('/api/candidatos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    if (res.ok) {
      setEnviado(true)
    } else {
      setErro('Erro ao enviar. Tente novamente.')
    }
    setEnviando(false)
  }

  if (enviado) return (
    <div style={{ minHeight: '100vh', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ background: '#fff', borderRadius: 16, padding: '48px 32px', maxWidth: 480, width: '100%', textAlign: 'center', border: '1px solid #e2e8f0', boxShadow: '0 8px 32px rgba(0,0,0,0.08)' }}>
        <p style={{ fontSize: 48, marginBottom: 16 }}>🎉</p>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: '#1e293b', margin: '0 0 12px' }}>Candidatura enviada!</h2>
        <p style={{ fontSize: 14, color: '#64748b', lineHeight: 1.7, margin: '0 0 24px' }}>
          Obrigado pelo interesse em fazer parte do DARPE Setor 4 — Hospitais.<br />
          Sua candidatura será analisada e entraremos em contato em breve.
        </p>
        <p style={{ fontSize: 13, color: '#94a3b8', fontStyle: 'italic' }}>
          "E tudo quanto fizerdes, fazei-o de todo o coração, como ao Senhor e não aos homens." — Colossenses 3:23
        </p>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#f1f5f9', padding: '32px 16px' }}>
      <style>{`
        input:focus, select:focus, textarea:focus { border-color: #2563eb !important; background: #fff !important; }
        @media (max-width: 768px) { .grid-2 { grid-template-columns: 1fr !important; } }
      `}</style>

      <div style={{ maxWidth: 600, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ width: 64, height: 64, borderRadius: 18, background: '#1e3a5f', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: '#1e293b', margin: '0 0 8px' }}>Candidatura DARPE</h1>
          <p style={{ fontSize: 14, color: '#64748b', margin: 0 }}>Setor 4 — Hospitais · Preencha o formulário abaixo</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0', boxShadow: '0 4px 16px rgba(0,0,0,0.06)', overflow: 'hidden' }}>

            {/* Dados pessoais */}
            <div style={{ padding: '24px 24px', borderBottom: '1px solid #f1f5f9' }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', letterSpacing: 1, margin: '0 0 16px' }}>DADOS PESSOAIS</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <label style={labelStyle}>Nome Completo *</label>
                  <input name="nome" type="text" required value={form.nome} onChange={handleChange} placeholder="Seu nome completo" style={inputStyle} />
                </div>
                <div className="grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <div>
                    <label style={labelStyle}>Telefone / WhatsApp *</label>
                    <input name="telefone" type="text" required value={form.telefone} onChange={handleChange} placeholder="(11) 99999-0000" maxLength={15} style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Data de nascimento *</label>
                    <input name="data_nascimento" type="date" required value={form.data_nascimento} onChange={handleChange} style={inputStyle} />
                  </div>
                </div>
                <div className="grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <div>
                    <label style={labelStyle}>Comum *</label>
                    <input name="comum" type="text" required value={form.comum} onChange={handleChange} placeholder="Nome da sua Comum" style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Cidade *</label>
                    <input name="cidade" type="text" required value={form.cidade} onChange={handleChange} placeholder="Sua cidade" style={inputStyle} />
                  </div>
                </div>
              </div>
            </div>

            {/* Instrumento */}
            <div style={{ padding: '24px', borderBottom: '1px solid #f1f5f9' }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', letterSpacing: 1, margin: '0 0 16px' }}>INSTRUMENTO</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <label style={labelStyle}>Instrumento *</label>
                  <select name="instrumento" required value={form.instrumento} onChange={handleChange} style={{ ...inputStyle, appearance: 'none' as const }}>
                    <option value="">Selecione...</option>
                    <option value="Violino">Violino</option>
                    <option value="Viola">Viola</option>
                    <option value="Violoncelo">Violoncelo</option>
                    <option value="Vocal">Vocal</option>
                    <option value="Outro">Outro instrumento</option>
                  </select>
                </div>
                {form.instrumento === 'Outro' && (
                  <div>
                    <label style={labelStyle}>Qual instrumento?</label>
                    <input name="instrumento_outro" type="text" value={form.instrumento_outro} onChange={handleChange} placeholder="Descreva seu instrumento" style={inputStyle} />
                  </div>
                )}
              </div>
            </div>

            {/* Como conheceu */}
            <div style={{ padding: '24px', borderBottom: '1px solid #f1f5f9' }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', letterSpacing: 1, margin: '0 0 16px' }}>COMO CONHECEU O DARPE?</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[
                  { value: 'indicacao', label: 'Indicação de alguém' },
                  { value: 'ccb', label: 'Ouvir na CCB' },
                  { value: 'ministerio', label: 'O ministério anunciou' },
                  { value: 'outros', label: 'Outros' },
                ].map(op => (
                  <label key={op.value} style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', padding: '10px 14px', borderRadius: 8, border: `1.5px solid ${form.como_conheceu === op.value ? '#2563eb' : '#e2e8f0'}`, background: form.como_conheceu === op.value ? '#eff6ff' : '#f8fafc', transition: 'all 0.15s' }}>
                    <input type="radio" name="como_conheceu" value={op.value} checked={form.como_conheceu === op.value} onChange={handleChange} style={{ accentColor: '#2563eb' }} />
                    <span style={{ fontSize: 13, fontWeight: 500, color: form.como_conheceu === op.value ? '#2563eb' : '#475569' }}>{op.label}</span>
                  </label>
                ))}
                {form.como_conheceu === 'indicacao' && (
                  <div style={{ marginTop: 4 }}>
                    <label style={labelStyle}>Nome de quem indicou *</label>
                    <input name="como_conheceu_indicacao" type="text" required value={form.como_conheceu_indicacao} onChange={handleChange} placeholder="Nome completo" style={inputStyle} />
                  </div>
                )}
                {form.como_conheceu === 'outros' && (
                  <div style={{ marginTop: 4 }}>
                    <label style={labelStyle}>Descreva como conheceu *</label>
                    <textarea name="como_conheceu_outros" required value={form.como_conheceu_outros} onChange={handleChange} placeholder="Conte como conheceu o DARPE..." rows={3} style={{ ...inputStyle, resize: 'vertical' }} />
                  </div>
                )}
              </div>
            </div>

            {/* Disponibilidade */}
            <div style={{ padding: '24px', borderBottom: '1px solid #f1f5f9' }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', letterSpacing: 1, margin: '0 0 16px' }}>DISPONIBILIDADE AOS SÁBADOS PELA MANHÃ</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[
                  { value: 'todos', label: 'Todos os sábados' },
                  { value: 'alguns', label: 'Alguns sábados' },
                  { value: 'nenhum', label: 'Nenhum sábado' },
                ].map(op => (
                  <label key={op.value} style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', padding: '10px 14px', borderRadius: 8, border: `1.5px solid ${form.disponibilidade === op.value ? '#2563eb' : '#e2e8f0'}`, background: form.disponibilidade === op.value ? '#eff6ff' : '#f8fafc', transition: 'all 0.15s' }}>
                    <input type="radio" name="disponibilidade" value={op.value} checked={form.disponibilidade === op.value} onChange={handleChange} style={{ accentColor: '#2563eb' }} />
                    <span style={{ fontSize: 13, fontWeight: 500, color: form.disponibilidade === op.value ? '#2563eb' : '#475569' }}>{op.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Botão */}
            <div style={{ padding: '20px 24px' }}>
              {erro && <p style={{ fontSize: 13, color: '#dc2626', marginBottom: 12 }}>{erro}</p>}
              <button type="submit" disabled={enviando} style={{
                width: '100%', padding: '13px', borderRadius: 10, border: 'none',
                background: enviando ? '#93c5fd' : '#2563eb', color: '#fff',
                fontSize: 14, fontWeight: 700, cursor: enviando ? 'not-allowed' : 'pointer',
              }}>
                {enviando ? 'Enviando...' : '📩 Enviar Candidatura'}
              </button>
              <p style={{ fontSize: 12, color: '#94a3b8', textAlign: 'center', marginTop: 12 }}>
                Após o envio, sua candidatura será analisada pela equipe DARPE.
              </p>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}