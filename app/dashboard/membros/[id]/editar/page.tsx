'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'

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

const PERFIS = [
  'Músico/Vocal',
  'Atendente',
  'Organizador',
  'Ancião',
  'Cooperador Jovens',
  'Cooperador Oficial',
  'Diácono',
  'Encarregado Local',
  'Encarregado Regional',
  'Administrador',
  'Secretário',
]

type Grupo = { id: string; nome: string }

function normalizarTexto(s: string) {
  return (s || '')
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .trim()
    .toLowerCase()
}

function ajustarParaOption(valorBanco: string, opcoes: string[]) {
  const alvo = normalizarTexto(valorBanco)
  const achou = opcoes.find((o) => normalizarTexto(o) === alvo)
  return achou || ''
}

function yyyyMmDd(v: any) {
  if (!v) return ''
  if (typeof v === 'string') {
    // aceita "2026-06-04" e "2026-06-04T00:00:00.000Z"
    return v.slice(0, 10)
  }
  try {
    const d = new Date(v)
    if (Number.isNaN(d.getTime())) return ''
    return d.toISOString().slice(0, 10)
  } catch {
    return ''
  }
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  border: '1px solid #e2e8f0',
  borderRadius: 8,
  padding: '10px 14px',
  fontSize: 14,
  color: '#1e293b',
  background: '#f8fafc',
  outline: 'none',
  boxSizing: 'border-box',
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: 12,
  fontWeight: 600,
  color: '#64748b',
  marginBottom: 6,
}

const secaoStyle: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 700,
  color: '#94a3b8',
  letterSpacing: 1,
  textTransform: 'uppercase',
  marginBottom: 16,
}

export default function EditarMembro() {
  const router = useRouter()
  const params = useParams()

  const formRef = useRef<HTMLFormElement>(null)

  const [loading, setLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(true)
  const [dadosOriginais, setDadosOriginais] = useState<any>(null)
  const [usuarioNome, setUsuarioNome] = useState('')
  const [grupos, setGrupos] = useState<Grupo[]>([])
  const [form, setForm] = useState({
    nome: '',
    telefone: '',
    email: '',
    data_nascimento: '',
    comum: '',
    cidade: '',
    instrumento: '',
    tipo: '',
    grupo: '',
    nivel_acesso: '',
    cargo: '',
    status: '',
    observacoes: '',
    data_inscricao_darpe: '',
    data_integracao: '',
    perfil: '',
  })

  function debugInvalid() {
    const formEl = formRef.current
    if (!formEl) return

    formEl.reportValidity()

    const invalids = Array.from(formEl.elements).filter((el) => {
      if (
        !(el instanceof HTMLInputElement) &&
        !(el instanceof HTMLSelectElement) &&
        !(el instanceof HTMLTextAreaElement)
      ) {
        return false
      }
      return !el.checkValidity()
    }) as Array<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>

    if (invalids.length > 0) {
      const el = invalids[0]
      // eslint-disable-next-line no-console
      console.log('Campo bloqueando submit:', {
        name: el.name,
        id: el.id,
        tag: el.tagName,
        value: el.value,
        message: el.validationMessage,
      })
      el.focus()
    }
  }

  useEffect(() => {
    fetch(`/api/membros/${params.id}`)
      .then((res) => res.json())
      .then((data) => {
        setDadosOriginais(data)

        setForm({
          nome: data?.nome || '',
          telefone: data?.telefone || '',
          email: data?.email || '',
          data_nascimento: yyyyMmDd(data?.data_nascimento ?? data?.dataNascimento),
          comum: data?.comum || '',
          cidade: data?.cidade || '',
          instrumento: data?.instrumento ? ajustarParaOption(data.instrumento, ['Nenhum', 'Violino', 'Viola', 'Violoncelo', 'Vocal']) : '',
          tipo: data?.tipo || '',
          grupo: data?.grupo || '',
          nivel_acesso: data?.nivel_acesso ?? data?.nivelAcesso ?? '',
          cargo: data?.cargo || 'Nenhum',
          status: data?.status || '',
          observacoes: data?.observacoes || '',
          data_inscricao_darpe: yyyyMmDd(data?.data_inscricao_darpe ?? data?.dataInscricaoDarpe),
          data_integracao: yyyyMmDd(data?.data_integracao ?? data?.dataIntegracao),
          perfil: data?.perfil ? ajustarParaOption(data.perfil, PERFIS) : '',
        })

        setLoadingData(false)
      })

    fetch('/api/membros/eu')
      .then((res) => res.json())
      .then((data) => {
        if (data?.nome) setUsuarioNome(data.nome)
      })

    fetch('/api/grupos')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setGrupos(data)
      })
  }, [params.id])

  useEffect(() => {
    if (!form.grupo) return
    if (!grupos.length) return

    const nomes = grupos.map((g) => g.nome)
    const corrigido = ajustarParaOption(form.grupo, nomes)

    if (corrigido && corrigido !== form.grupo) {
      setForm((prev) => ({ ...prev, grupo: corrigido }))
    }
  }, [grupos]) // intencional

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => {
    if (e.target.name === 'telefone') {
      setForm({ ...form, telefone: mascaraTelefone(e.target.value) })
    } else {
      setForm({ ...form, [e.target.name]: e.target.value })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formRef.current?.checkValidity()) {
      debugInvalid()
      return
    }

    setLoading(true)

    // envia snake_case + camelCase (pra API não ignorar campo)
   const dadosParaEnviar: any = {
  ...form,
  data_nascimento: form.data_nascimento || null,
  data_inscricao_darpe: form.data_inscricao_darpe || null,
  data_integracao: form.data_integracao || null,
  nivel_acesso: form.nivel_acesso || null,
}

    const res = await fetch(`/api/membros/${params.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dadosParaEnviar),
    })

    if (res.ok) {
      await fetch('/api/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          usuario_nome: usuarioNome || 'Administrador',
          acao: `Editou membro: ${form.nome}`,
          tabela: 'membros',
          registro_id: params.id,
          dados_antes: dadosOriginais,
          dados_depois: dadosParaEnviar,
        }),
      })
      router.push('/dashboard/membros')
      return
    }

    let msg = 'Erro desconhecido'
    try {
      const erro = await res.json()
      msg = erro?.error || msg
    } catch {
      // ignora
    }
    alert('Erro ao atualizar membro: ' + msg)
    setLoading(false)
  }

  if (loadingData)
    return (
      <div
        style={{
          background: '#f1f5f9',
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <p style={{ color: '#64748b', fontSize: 14 }}>Carregando...</p>
      </div>
    )

  return (
    <div style={{ background: '#f1f5f9', minHeight: '100vh', padding: '28px 40px' }} className="editar-wrap">
      <style>{`
        @media (max-width: 768px) {
          .editar-wrap { padding: 16px !important; }
          .grid-2 { grid-template-columns: 1fr !important; }
          .grid-3 { grid-template-columns: 1fr !important; }
        }
        input:focus, select:focus, textarea:focus {
          border-color: #2563eb !important;
          background: #fff !important;
        }
      `}</style>

      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: '#1e293b', margin: 0 }}>Editar Membro</h1>
            <p style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>Atualize as informações do membro</p>
          </div>
          <a
            href="/dashboard/membros"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              fontSize: 13,
              fontWeight: 600,
              color: '#64748b',
              textDecoration: 'none',
            }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
            Voltar
          </a>
        </div>

        <form ref={formRef} onSubmit={handleSubmit}>
          <div
            style={{
              background: '#fff',
              border: '1px solid #e2e8f0',
              borderRadius: 12,
              boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
              overflow: 'hidden',
            }}
          >
            <div style={{ padding: '24px 28px', borderBottom: '1px solid #f1f5f9' }}>
              <p style={secaoStyle}>Dados Pessoais</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <label style={labelStyle}>Nome completo *</label>
                  <input name="nome" type="text" required value={form.nome} onChange={handleChange} style={inputStyle} />
                </div>

                <div className="grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div>
                    <label style={labelStyle}>Telefone *</label>
                    <input
                      name="telefone"
                      type="text"
                      required
                      value={form.telefone}
                      onChange={handleChange}
                      style={inputStyle}
                      placeholder="(11) 99999-0000"
                      maxLength={15}
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>E-mail *</label>
                    <input name="email" type="email" required value={form.email} onChange={handleChange} style={inputStyle} />
                  </div>
                </div>

                <div className="grid-3" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
                  <div>
                    <label style={labelStyle}>Data de nascimento *</label>
                    <input
                      name="data_nascimento"
                      type="date"
                      required
                      value={form.data_nascimento}
                      onChange={handleChange}
                      style={inputStyle}
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Comum *</label>
                    <input name="comum" type="text" required value={form.comum} onChange={handleChange} style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Cidade *</label>
                    <input name="cidade" type="text" required value={form.cidade} onChange={handleChange} style={inputStyle} />
                  </div>
                </div>
              </div>
            </div>

            <div style={{ padding: '24px 28px', borderBottom: '1px solid #f1f5f9' }}>
              <p style={secaoStyle}>Dados do Ministério</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div className="grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div>
                    <label style={labelStyle}>Perfil *</label>
                    <select name="perfil" required value={form.perfil} onChange={handleChange} style={inputStyle}>
                      <option value="">Selecione...</option>
                      {PERFIS.map((p) => (
                        <option key={p} value={p}>
                          {p}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label style={labelStyle}>Instrumento</label>
                    <select name="instrumento" value={form.instrumento} onChange={handleChange} style={inputStyle}>
                      <option value="">Selecione...</option>
                      <option value="Nenhum">Nenhum</option>
                      <option value="Violino">Violino</option>
                      <option value="Viola">Viola</option>
                      <option value="Violoncelo">Violoncelo</option>
                      <option value="Vocal">Vocal</option>
                    </select>
                  </div>
                </div>

                <div className="grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div>
                    <label style={labelStyle}>Grupo *</label>
                    <select name="grupo" required value={form.grupo} onChange={handleChange} style={inputStyle}>
                      <option value="">Selecione...</option>
                      {grupos.map((g) => (
                        <option key={g.id} value={g.nome}>
                          {g.nome}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label style={labelStyle}>Status *</label>
                    <select name="status" required value={form.status} onChange={handleChange} style={inputStyle}>
                      <option value="">Selecione...</option>
                      <option value="Ativo">Ativo</option>
                      <option value="Inativo">Inativo</option>
                    </select>
                  </div>
                </div>

                <div className="grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div>
                    <label style={labelStyle}>Data de inscrição no DARPE *</label>
                    <input
                      name="data_inscricao_darpe"
                      type="date"
                      required
                      value={form.data_inscricao_darpe}
                      onChange={handleChange}
                      style={inputStyle}
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Data de integração</label>
                    <input
                      name="data_integracao"
                      type="date"
                      value={form.data_integracao || ''}
                      onChange={handleChange}
                      style={inputStyle}
                    />
                  </div>
                </div>

                <div>
                  <label style={labelStyle}>Observações</label>
                  <textarea
                    name="observacoes"
                    rows={3}
                    value={form.observacoes}
                    onChange={handleChange}
                    style={{ ...inputStyle, resize: 'vertical' }}
                  />
                </div>
              </div>
            </div>

            <div style={{ padding: '20px 28px', display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <button
                type="submit"
                disabled={loading}
                style={{
                  padding: '10px 24px',
                  borderRadius: 8,
                  border: 'none',
                  background: loading ? '#93c5fd' : '#2563eb',
                  color: '#fff',
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: loading ? 'not-allowed' : 'pointer',
                }}
              >
                {loading ? 'Salvando...' : 'Salvar Alterações'}
              </button>

              <a
                href="/dashboard/membros"
                style={{
                  padding: '10px 24px',
                  borderRadius: 8,
                  background: '#f1f5f9',
                  color: '#475569',
                  fontSize: 14,
                  fontWeight: 600,
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                }}
              >
                Cancelar
              </a>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
