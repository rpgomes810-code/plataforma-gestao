'use client'

import { useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'

function mascaraTelefone(valor: string) {
  const numeros = valor.replace(/\D/g, '').slice(0, 11)
  if (numeros.length <= 10) {
    return numeros.replace(/(\d{2})(\d)/, '($1) $2').replace(/(\d{4})(\d)/, '$1-$2')
  }
  return numeros.replace(/(\d{2})(\d)/, '($1) $2').replace(/(\d{5})(\d)/, '$1-$2')
}

function mascaraData(valor: string) {
  const v = valor.replace(/\D/g, '').slice(0, 8)
  return v.replace(/(\d{2})(\d)/, '$1/$2').replace(/(\d{2})(\d)/, '$1/$2')
}

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '10px 14px', borderRadius: 8,
  border: '1px solid #e2e8f0', background: '#f8fafc',
  fontSize: 14, color: '#1e293b', outline: 'none', boxSizing: 'border-box',
}

const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: 12, fontWeight: 600,
  color: '#64748b', marginBottom: 6,
}

export default function SolicitarAcesso() {
  const [loading, setLoading] = useState(false)
  const [enviado, setEnviado] = useState(false)
  const [form, setForm] = useState({
    nome: '', email: '', senha: '', telefone: '',
    data_nascimento: '', comum: '', cidade: '', instrumento: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    if (name === 'telefone') {
      setForm({ ...form, telefone: mascaraTelefone(value) })
    } else if (name === 'data_nascimento') {
      setForm({ ...form, data_nascimento: mascaraData(value) })
    } else {
      setForm({ ...form, [name]: value })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const [dia, mes, ano] = form.data_nascimento.split('/')
    const dataNascimentoFormatada = dia && mes && ano ? `${ano}-${mes}-${dia}` : null

    const { error } = await supabase.from('solicitacoes').insert([{
      nome: form.nome.toUpperCase(),
      email: form.email,
      senha: form.senha,
      telefone: form.telefone,
      data_nascimento: dataNascimentoFormatada,
      comum: form.comum.toUpperCase(),
      cidade: form.cidade.toUpperCase(),
      instrumento: form.instrumento.toUpperCase(),
      status: 'pendente',
    }])

    if (error) { alert('Erro ao enviar solicitação. Tente novamente.'); setLoading(false) }
    else setEnviado(true)
  }

  if (enviado) {
    return (
      <div style={{
        minHeight: '100vh', background: '#f1f5f9',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px 16px',
      }}>
        <div style={{
          background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
          padding: 40, maxWidth: 400, width: '100%', textAlign: 'center',
        }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🎉</div>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: '#1e293b', margin: '0 0 8px' }}>Solicitação enviada!</h2>
          <p style={{ fontSize: 13, color: '#64748b', marginBottom: 24 }}>
            Aguarde a aprovação do administrador. Você receberá um contato em breve.
          </p>
          <a href="/" style={{ color: '#2563eb', fontSize: 13, textDecoration: 'none', fontWeight: 600 }}>← Voltar para o login</a>
        </div>
      </div>
    )
  }

  return (
    <div style={{
      minHeight: '100vh', background: '#f1f5f9',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px 16px',
    }}>
      <div style={{ width: '100%', maxWidth: 480 }}>

        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{
            width: 56, height: 56, borderRadius: 14, margin: '0 auto 12px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: '#1e3a5f',
          }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
          </div>
          <p style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 4 }}>DARPE CCB</p>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: '#1e293b', margin: 0 }}>Solicitar Acesso</h1>
          <p style={{ fontSize: 13, color: '#64748b', marginTop: 6 }}>Preencha os dados para solicitar acesso à plataforma</p>
        </div>

        <div style={{
          background: '#fff', borderRadius: 16,
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
          padding: 28,
        }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            <div>
              <label style={labelStyle}>Nome Completo *</label>
              <input name="nome" type="text" required value={form.nome} onChange={handleChange}
                placeholder="Seu nome completo" style={inputStyle} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={labelStyle}>Telefone / WhatsApp *</label>
                <input name="telefone" type="text" required value={form.telefone} onChange={handleChange}
                  placeholder="(11) 99999-0000" maxLength={15} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Data de nascimento *</label>
                <input name="data_nascimento" type="text" required value={form.data_nascimento} onChange={handleChange}
                  placeholder="DD/MM/AAAA" maxLength={10} style={inputStyle} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={labelStyle}>Comum *</label>
                <input name="comum" type="text" required value={form.comum} onChange={handleChange}
                  placeholder="Nome da sua Comum" style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Cidade *</label>
                <input name="cidade" type="text" required value={form.cidade} onChange={handleChange}
                  placeholder="Sua cidade" style={inputStyle} />
              </div>
            </div>

            <div>
              <label style={labelStyle}>Instrumento</label>
              <select name="instrumento" value={form.instrumento} onChange={handleChange} style={inputStyle}>
                <option value="">Selecione...</option>
                <option value="Violino">Violino</option>
                <option value="Viola">Viola</option>
                <option value="Violoncelo">Violoncelo</option>
                <option value="Canto">Canto</option>
                <option value="Nenhum">Nenhum</option>
              </select>
            </div>

            <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: 16 }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 14 }}>
                Dados de acesso
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div>
                  <label style={labelStyle}>E-mail *</label>
                  <input name="email" type="email" required value={form.email} onChange={handleChange}
                    placeholder="seu@email.com" style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Senha *</label>
                  <input name="senha" type="password" required minLength={6} value={form.senha} onChange={handleChange}
                    placeholder="Mínimo 6 caracteres" style={inputStyle} />
                </div>
              </div>
            </div>

            <button type="submit" disabled={loading} style={{
              width: '100%', padding: '11px', borderRadius: 8, border: 'none',
              background: '#2563eb', color: '#fff',
              fontSize: 14, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1, marginTop: 4,
            }}>
              {loading ? 'Enviando...' : 'Enviar Solicitação'}
            </button>

            <a href="/" style={{ textAlign: 'center', color: '#94a3b8', fontSize: 13, textDecoration: 'none' }}>
              ← Voltar para o login
            </a>

          </form>
        </div>
      </div>
    </div>
  )
}