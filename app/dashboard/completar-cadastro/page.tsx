'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

const estados = ['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO']

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

function mascaraCPF(v: string) {
  return v.replace(/\D/g, '').slice(0, 11)
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
}

function mascaraCEP(v: string) {
  return v.replace(/\D/g, '').slice(0, 8).replace(/(\d{5})(\d)/, '$1-$2')
}

export default function CompletarCadastro() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(true)
  const [membro, setMembro] = useState<any>(null)
  const [form, setForm] = useState({
    cpf: '', rg: '', sexo: '', estado_civil: '', data_batismo: '',
    logradouro: '', numero_endereco: '', complemento: '', bairro: '',
    cidade: '', estado: '', cep: '', funcao_darpe: '',
  })

  useEffect(() => {
    fetch('/api/membros/eu')
      .then(r => r.json())
      .then(data => {
        setMembro(data)
        setForm({
          cpf: data.cpf || '',
          rg: data.rg || '',
          sexo: data.sexo || '',
          estado_civil: data.estado_civil || '',
          data_batismo: data.data_batismo || '',
          logradouro: data.logradouro || '',
          numero_endereco: data.numero_endereco || '',
          complemento: data.complemento || '',
          bairro: data.bairro || '',
          cidade: data.cidade || '',
          estado: data.estado || '',
          cep: data.cep || '',
          funcao_darpe: data.funcao_darpe || '',
        })
        setLoadingData(false)
      })
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    if (name === 'cpf') setForm({ ...form, cpf: mascaraCPF(value) })
    else if (name === 'cep') setForm({ ...form, cep: mascaraCEP(value) })
    else setForm({ ...form, [name]: value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const res = await fetch('/api/membros/completar-cadastro', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, cadastro_completo: true }),
    })

    if (res.ok) {
      router.push('/dashboard')
    } else {
      alert('Erro ao salvar. Tente novamente.')
      setLoading(false)
    }
  }

  if (loadingData) return (
    <div style={{ background: '#f1f5f9', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: '#64748b', fontSize: 14 }}>Carregando...</p>
    </div>
  )

  return (
    <div style={{ background: '#f1f5f9', minHeight: '100vh', padding: '28px 40px' }} className="completar-wrap">
      <style>{`
        @media (max-width: 768px) {
          .completar-wrap { padding: 16px !important; }
          .grid-2 { grid-template-columns: 1fr !important; }
          .grid-3 { grid-template-columns: 1fr !important; }
          .grid-4 { grid-template-columns: 1fr !important; }
        }
        input:focus, select:focus { border-color: #2563eb !important; background: #fff !important; }
      `}</style>

      <div style={{ maxWidth: 1280, margin: '0 auto' }}>

        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: '#1e293b', margin: 0 }}>Completar Cadastro</h1>
          <p style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>
            Dados necessários para o DARPE Bras-SP — {membro?.nome}
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.06)', overflow: 'hidden' }}>

            {/* Dados pessoais */}
            <div style={{ padding: '24px 28px', borderBottom: '1px solid #f1f5f9' }}>
              <p style={secaoStyle}>Dados Pessoais</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div className="grid-3" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
                  <div>
                    <label style={labelStyle}>CPF *</label>
                    <input name="cpf" type="text" required value={form.cpf} onChange={handleChange} style={inputStyle} placeholder="000.000.000-00" />
                  </div>
                  <div>
                    <label style={labelStyle}>RG *</label>
                    <input name="rg" type="text" required value={form.rg} onChange={handleChange} style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Data de Batismo *</label>
                    <input name="data_batismo" type="date" required value={form.data_batismo} onChange={handleChange} style={inputStyle} />
                  </div>
                </div>
                <div className="grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div>
                    <label style={labelStyle}>Sexo *</label>
                    <select name="sexo" required value={form.sexo} onChange={handleChange} style={inputStyle}>
                      <option value="">Selecione...</option>
                      <option value="Masculino">Masculino</option>
                      <option value="Feminino">Feminino</option>
                    </select>
                  </div>
                  <div>
                    <label style={labelStyle}>Estado Civil *</label>
                    <select name="estado_civil" required value={form.estado_civil} onChange={handleChange} style={inputStyle}>
                      <option value="">Selecione...</option>
                      <option value="Solteiro(a)">Solteiro(a)</option>
                      <option value="Casado(a)">Casado(a)</option>
                      <option value="Divorciado(a)">Divorciado(a)</option>
                      <option value="Viúvo(a)">Viúvo(a)</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Endereço */}
            <div style={{ padding: '24px 28px', borderBottom: '1px solid #f1f5f9' }}>
              <p style={secaoStyle}>Endereço</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div className="grid-3" style={{ display: 'grid', gridTemplateColumns: '1fr 100px 1fr', gap: 16 }}>
                  <div>
                    <label style={labelStyle}>Logradouro *</label>
                    <input name="logradouro" type="text" required value={form.logradouro} onChange={handleChange} style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Número *</label>
                    <input name="numero_endereco" type="text" required value={form.numero_endereco} onChange={handleChange} style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Complemento</label>
                    <input name="complemento" type="text" value={form.complemento} onChange={handleChange} style={inputStyle} />
                  </div>
                </div>
                <div className="grid-4" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 120px', gap: 16 }}>
                  <div>
                    <label style={labelStyle}>Bairro *</label>
                    <input name="bairro" type="text" required value={form.bairro} onChange={handleChange} style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Cidade *</label>
                    <input name="cidade" type="text" required value={form.cidade} onChange={handleChange} style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>CEP *</label>
                    <input name="cep" type="text" required value={form.cep} onChange={handleChange} style={inputStyle} placeholder="00000-000" />
                  </div>
                  <div>
                    <label style={labelStyle}>Estado *</label>
                    <select name="estado" required value={form.estado} onChange={handleChange} style={inputStyle}>
                      <option value="">UF</option>
                      {estados.map(uf => <option key={uf} value={uf}>{uf}</option>)}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Função DARPE */}
            <div style={{ padding: '24px 28px', borderBottom: '1px solid #f1f5f9' }}>
              <p style={secaoStyle}>Função no DARPE</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                {['Ministério', 'Atendente', 'Colaborador', 'Encarregado', 'Músico/Organista', 'Grupo de Canto'].map(funcao => (
                  <label key={funcao} style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '12px 14px', borderRadius: 8, cursor: 'pointer',
                    border: `1px solid ${form.funcao_darpe === funcao ? '#2563eb' : '#e2e8f0'}`,
                    background: form.funcao_darpe === funcao ? '#eff6ff' : '#f8fafc',
                  }}>
                    <input type="radio" name="funcao_darpe" value={funcao}
                      checked={form.funcao_darpe === funcao}
                      onChange={handleChange}
                      style={{ accentColor: '#2563eb' }} />
                    <span style={{ fontSize: 13, fontWeight: 600, color: form.funcao_darpe === funcao ? '#2563eb' : '#475569' }}>{funcao}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Declaração */}
            <div style={{ padding: '24px 28px', borderBottom: '1px solid #f1f5f9', background: '#f8fafc' }}>
              <p style={secaoStyle}>Declaração de Voluntariado</p>
              <p style={{ fontSize: 13, color: '#475569', lineHeight: 1.6, margin: 0, fontStyle: 'italic' }}>
                DECLARO ser de minha livre e espontânea vontade o propósito colaborar na realização das reuniões de evangelização promovidas pela Congregação Cristã no Brasil em estabelecimentos atendidos pelo DARPE. DECLARO ainda estar ciente dos riscos inerentes ao exercício destas atividades, não havendo objeção por parte de meus familiares.
              </p>
            </div>

            {/* Botões */}
            <div style={{ padding: '20px 28px', display: 'flex', gap: 12 }}>
              <button type="submit" disabled={loading} style={{
                padding: '10px 24px', borderRadius: 8, border: 'none',
                background: loading ? '#93c5fd' : '#2563eb',
                color: '#fff', fontSize: 14, fontWeight: 600,
                cursor: loading ? 'not-allowed' : 'pointer',
              }}>
                {loading ? 'Salvando...' : 'Salvar e Concluir'}
              </button>
              <a href="/dashboard" style={{
                padding: '10px 24px', borderRadius: 8,
                background: '#f1f5f9', color: '#475569',
                fontSize: 14, fontWeight: 600, textDecoration: 'none',
                display: 'inline-flex', alignItems: 'center',
              }}>
                Fazer depois
              </a>
            </div>

          </div>
        </form>
      </div>
    </div>
  )
}