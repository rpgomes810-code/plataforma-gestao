'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

type Hospital = { id: string; nome: string }
type Membro = { id: string; nome: string; grupo: string }

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '10px 14px', borderRadius: 8,
  border: '1px solid #e2e8f0', background: '#f8fafc',
  fontSize: 14, color: '#1e293b', outline: 'none', boxSizing: 'border-box',
}

const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: 12, fontWeight: 600,
  color: '#64748b', marginBottom: 6,
}

const secaoStyle: React.CSSProperties = {
  fontSize: 11, fontWeight: 700, color: '#94a3b8',
  letterSpacing: 1, textTransform: 'uppercase', marginBottom: 16,
}

function NovoRegistroForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const escala_id = searchParams.get('escala_id') || ''
  const hospital_id_param = searchParams.get('hospital_id') || ''
  const data_param = searchParams.get('data') || ''

  const [loading, setLoading] = useState(false)
  const [hospitais, setHospitais] = useState<Hospital[]>([])
  const [membros, setMembros] = useState<Membro[]>([])
  const [grupos, setGrupos] = useState<string[]>([])
  const [busca, setBusca] = useState('')
  const [membrosSelecionados, setMembrosSelecionados] = useState<string[]>([])
  const [usuarioNome, setUsuarioNome] = useState('Atendente')
  const [form, setForm] = useState({
    hospital_id: hospital_id_param,
    data: data_param,
    data_registro: new Date().toISOString().split('T')[0],
    hora_inicio: '',
    hora_termino: '',
    quem_autorizou: '',
    hinos_executados: '0',
    teve_oracao: 'false',
    observacoes: '',
    quantidade_participantes: '0',
  })

  useEffect(() => {
    fetch('/api/hospitais').then(res => res.json()).then(data => { if (Array.isArray(data)) setHospitais(data) })
    fetch('/api/membros').then(res => res.json()).then(data => {
      if (Array.isArray(data)) {
        setMembros(data)
        const gs = [...new Set(data.map((m: Membro) => m.grupo).filter(Boolean))].sort((a: string, b: string) => {
          const numA = parseInt(a.replace(/\D/g, '')) || 0
          const numB = parseInt(b.replace(/\D/g, '')) || 0
          return numA - numB
        }) as string[]
        setGrupos(gs)
      }
    })
    fetch('/api/membros/eu').then(res => res.json()).then(data => { if (data?.nome) setUsuarioNome(data.nome) })
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const adicionarMembro = (nome: string) => {
    if (!membrosSelecionados.includes(nome)) setMembrosSelecionados(prev => [...prev, nome])
    setBusca('')
  }

  const adicionarGrupo = (grupo: string) => {
    const membrosDoGrupo = membros.filter(m => m.grupo === grupo).map(m => m.nome)
    const novos = membrosDoGrupo.filter(n => !membrosSelecionados.includes(n))
    setMembrosSelecionados(prev => [...prev, ...novos])
    setBusca('')
  }

  const removerMembro = (nome: string) => {
    setMembrosSelecionados(prev => prev.filter(n => n !== nome))
  }

  const gruposFiltrados = grupos.filter(g => busca.length > 0 && g.toLowerCase().includes(busca.toLowerCase()))
  const membrosFiltrados = membros.filter(m =>
    busca.length > 0 &&
    m.nome.toLowerCase().includes(busca.toLowerCase()) &&
    !membrosSelecionados.includes(m.nome)
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (membrosSelecionados.length === 0) {
      alert('Adicione pelo menos um membro presente antes de salvar!')
      return
    }

    setLoading(true)

    const dadosRegistro = {
      hospital_id: form.hospital_id,
      data: form.data,
      data_registro: form.data_registro,
      hora_inicio: form.hora_inicio,
      hora_termino: form.hora_termino,
      quem_autorizou: form.quem_autorizou,
      hinos_executados: parseInt(form.hinos_executados),
      teve_oracao: form.teve_oracao === 'true',
      observacoes: form.observacoes,
      membros_presentes: membrosSelecionados.join(', '),
      quantidade_participantes: parseInt(form.quantidade_participantes) || 0,
      escala_id: escala_id || null,
    }

    const res = await fetch('/api/registros', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dadosRegistro),
    })

    if (res.ok) {
      router.push('/dashboard/registros')
    } else {
      alert('Erro ao salvar registro')
      setLoading(false)
    }
  }

  const hospitalPreenchido = hospitais.find(h => h.id === hospital_id_param)

  return (
    <div style={{ background: '#f1f5f9', minHeight: '100vh', padding: '28px 40px' }} className="reg-wrap">
      <style>{`
        @media (max-width: 768px) { .reg-wrap { padding: 16px !important; } .grid-2 { grid-template-columns: 1fr !important; } .grid-3 { grid-template-columns: 1fr !important; } .grid-4 { grid-template-columns: 1fr 1fr !important; } }
        input:focus, select:focus, textarea:focus { border-color: #2563eb !important; background: #fff !important; }
      `}</style>

      <div style={{ maxWidth: 1280, margin: '0 auto' }}>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: '#1e293b', margin: 0 }}>Novo Registro de Atendimento</h1>
            <p style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>Preencha os dados do atendimento</p>
          </div>
          <a href="/dashboard/registros" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: '#64748b', textDecoration: 'none' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
            </svg>
            Voltar
          </a>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.06)', overflow: 'hidden' }}>

            <div style={{ padding: '24px 28px', borderBottom: '1px solid #f1f5f9' }}>
              <p style={secaoStyle}>Dados do Atendimento</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

                <div className="grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div>
                    <label style={labelStyle}>Hospital *</label>
                    {hospitalPreenchido ? (
                      <div style={{ ...inputStyle, color: '#475569', background: '#f1f5f9' }}>🏥 {hospitalPreenchido.nome}</div>
                    ) : (
                      <select name="hospital_id" required value={form.hospital_id} onChange={handleChange} style={inputStyle}>
                        <option value="">Selecione...</option>
                        {hospitais.map(h => <option key={h.id} value={h.id}>{h.nome}</option>)}
                      </select>
                    )}
                  </div>
                  <div>
                    <label style={labelStyle}>Data do atendimento *</label>
                    {data_param ? (
                      <div style={{ ...inputStyle, color: '#475569', background: '#f1f5f9' }}>
                        📅 {new Date(data_param + 'T12:00:00').toLocaleDateString('pt-BR')}
                      </div>
                    ) : (
                      <input name="data" type="date" required value={form.data} onChange={handleChange} style={inputStyle} />
                    )}
                  </div>
                </div>

                <div className="grid-3" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
                  <div>
                    <label style={labelStyle}>Data do registro</label>
                    <div style={{ ...inputStyle, color: '#475569', background: '#f1f5f9' }}>
                      📋 {new Date().toLocaleDateString('pt-BR')}
                    </div>
                  </div>
                  <div>
                    <label style={labelStyle}>Hora início *</label>
                    <input name="hora_inicio" type="time" required value={form.hora_inicio} onChange={handleChange} style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Hora término *</label>
                    <input name="hora_termino" type="time" required value={form.hora_termino} onChange={handleChange} style={inputStyle} />
                  </div>
                </div>

                <div className="grid-4" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 16 }}>
                  <div>
                    <label style={labelStyle}>Quem autorizou a entrada *</label>
                    <input name="quem_autorizou" type="text" required value={form.quem_autorizou} onChange={handleChange} style={inputStyle} placeholder="Nome do responsável" />
                  </div>
                  <div>
                    <label style={labelStyle}>Hinos executados *</label>
                    <input name="hinos_executados" type="number" required min="1" value={form.hinos_executados} onChange={handleChange} style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Participantes</label>
                    <input name="quantidade_participantes" type="number" min="0" value={form.quantidade_participantes} onChange={handleChange} style={inputStyle} placeholder="0" />
                  </div>
                  <div>
                    <label style={labelStyle}>Houve oração?</label>
                    <select name="teve_oracao" value={form.teve_oracao} onChange={handleChange} style={inputStyle}>
                      <option value="true">✅ Sim</option>
                      <option value="false">❌ Não</option>
                    </select>
                  </div>
                </div>

              </div>
            </div>

            <div style={{ padding: '24px 28px', borderBottom: '1px solid #f1f5f9' }}>
              <p style={secaoStyle}>Membros Presentes *</p>

              <div style={{ position: 'relative', marginBottom: 12 }}>
                <input
                  type="text"
                  value={busca}
                  onChange={e => setBusca(e.target.value)}
                  style={inputStyle}
                  placeholder="Digite o nome do membro ou o grupo (ex: Grupo 1)..."
                />
                {(gruposFiltrados.length > 0 || membrosFiltrados.length > 0) && (
                  <div style={{
                    position: 'absolute', zIndex: 10, width: '100%',
                    background: '#fff', border: '1px solid #e2e8f0',
                    borderRadius: 8, boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    marginTop: 4, maxHeight: 220, overflowY: 'auto',
                  }}>
                    {gruposFiltrados.map(g => (
                      <button key={g} type="button" onClick={() => adicionarGrupo(g)} style={{
                        width: '100%', textAlign: 'left', padding: '10px 14px',
                        background: 'none', border: 'none', cursor: 'pointer',
                        fontSize: 13, fontWeight: 600, color: '#2563eb',
                        borderBottom: '1px solid #f1f5f9',
                      }}>
                        🎻 Adicionar todos do {g}
                      </button>
                    ))}
                    {membrosFiltrados.map(m => (
                      <button key={m.id} type="button" onClick={() => adicionarMembro(m.nome)} style={{
                        width: '100%', textAlign: 'left', padding: '10px 14px',
                        background: 'none', border: 'none', cursor: 'pointer',
                        fontSize: 13, color: '#334155',
                        borderBottom: '1px solid #f1f5f9',
                      }}>
                        {m.nome} <span style={{ fontSize: 11, color: '#94a3b8' }}>({m.grupo})</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {membrosSelecionados.length > 0 ? (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {membrosSelecionados.map(nome => (
                    <span key={nome} style={{
                      display: 'flex', alignItems: 'center', gap: 6,
                      background: '#eff6ff', color: '#2563eb',
                      fontSize: 12, fontWeight: 600,
                      padding: '4px 12px', borderRadius: 999,
                    }}>
                      {nome}
                      <button type="button" onClick={() => removerMembro(nome)} style={{
                        background: 'none', border: 'none', cursor: 'pointer',
                        color: '#93c5fd', fontWeight: 700, fontSize: 14, padding: 0, lineHeight: 1,
                      }}>×</button>
                    </span>
                  ))}
                </div>
              ) : (
                <p style={{ fontSize: 13, color: '#dc2626', margin: 0, fontWeight: 600 }}>⚠️ Adicione pelo menos um membro presente</p>
              )}
            </div>

            <div style={{ padding: '24px 28px', borderBottom: '1px solid #f1f5f9' }}>
              <p style={secaoStyle}>Observações</p>
              <textarea name="observacoes" rows={3} value={form.observacoes} onChange={handleChange}
                style={{ ...inputStyle, resize: 'vertical' }}
                placeholder="Alguma observação sobre o atendimento..." />
            </div>

            <div style={{ padding: '20px 28px', display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <button type="submit" disabled={loading} style={{
                padding: '10px 24px', borderRadius: 8, border: 'none',
                background: loading ? '#93c5fd' : '#2563eb',
                color: '#fff', fontSize: 14, fontWeight: 600,
                cursor: loading ? 'not-allowed' : 'pointer',
              }}>
                {loading ? 'Salvando...' : 'Salvar Registro'}
              </button>
              <a href="/dashboard/registros" style={{
                padding: '10px 24px', borderRadius: 8,
                background: '#f1f5f9', color: '#475569',
                fontSize: 14, fontWeight: 600,
                textDecoration: 'none', display: 'inline-flex', alignItems: 'center',
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

export default function NovoRegistro() {
  return (
    <Suspense fallback={<div style={{ background: '#f1f5f9', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><p style={{ color: '#64748b', fontSize: 14 }}>Carregando...</p></div>}>
      <NovoRegistroForm />
    </Suspense>
  )
}