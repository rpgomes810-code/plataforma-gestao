'use client'

import { useState, useEffect } from 'react'

const meses = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro']

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '9px 12px', borderRadius: 8,
  border: '1px solid #e2e8f0', background: '#f8fafc',
  fontSize: 13, color: '#1e293b', outline: 'none', boxSizing: 'border-box',
}

export default function Historico() {
  const hoje = new Date()
  const [mes, setMes] = useState(hoje.getMonth())
  const [ano, setAno] = useState(hoje.getFullYear())
  const [aba, setAba] = useState<'escalas' | 'registros' | 'confirmacoes'>('escalas')
  const [escalas, setEscalas] = useState<any[]>([])
  const [registros, setRegistros] = useState<any[]>([])
  const [confirmacoes, setConfirmacoes] = useState<any[]>([])
  const [membros, setMembros] = useState<any[]>([])
  const [hospitais, setHospitais] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [detalhesAbertos, setDetalhesAbertos] = useState<Record<string, boolean>>({})
  const [permissoes, setPermissoes] = useState<any>(null)

  // Modal edição
  const [modalEdicao, setModalEdicao] = useState<any>(null)
  const [formEdicao, setFormEdicao] = useState<any>(null)
  const [salvandoEdicao, setSalvandoEdicao] = useState(false)
  const [buscaMembro, setBuscaMembro] = useState('')
  const [grupos, setGrupos] = useState<string[]>([])

  useEffect(() => {
    fetch('/api/membros').then(r => r.json()).then(data => {
      if (Array.isArray(data)) {
        setMembros(data)
        const gs = [...new Set(data.map((m: any) => m.grupo).filter(Boolean))].sort((a: any, b: any) => {
          const numA = parseInt(a.replace(/\D/g, '')) || 999
          const numB = parseInt(b.replace(/\D/g, '')) || 999
          return numA - numB
        }) as string[]
        setGrupos(gs)
      }
    })
    fetch('/api/hospitais').then(r => r.json()).then(data => { if (Array.isArray(data)) setHospitais(data) })
    fetch('/api/membros/eu').then(r => r.json()).then(data => setPermissoes(data.permissoes || {}))
  }, [])

  const podeEditar = permissoes?.registros?.editar === true
  const podeExcluir = permissoes?.registros?.excluir === true

  const carregarRegistros = () => {
    setLoading(true)
    fetch(`/api/registros?mes=${mes + 1}&ano=${ano}`)
      .then(r => r.json())
      .then(data => { setRegistros(Array.isArray(data) ? data : []); setLoading(false) })
  }

  useEffect(() => {
    setLoading(true)
    setDetalhesAbertos({})

    if (aba === 'escalas' || aba === 'confirmacoes') {
      fetch(`/api/escalas/historico?mes=${mes + 1}&ano=${ano}`)
        .then(r => r.json())
        .then(data => {
          const lista = Array.isArray(data) ? data : []
          if (aba === 'escalas') setEscalas(lista)
          else setConfirmacoes(lista)
          setLoading(false)
        })
    } else {
      carregarRegistros()
    }
  }, [mes, ano, aba])

  const toggleDetalhes = (id: string) => {
    setDetalhesAbertos(prev => ({ ...prev, [id]: !prev[id] }))
  }

  const abrirEdicao = (registro: any) => {
    setModalEdicao(registro)
    const membrosPresentes = registro.membros_presentes
      ? registro.membros_presentes.split(',').map((n: string) => n.trim()).filter(Boolean)
      : []
    setFormEdicao({
      hospital_id: registro.hospital_id || '',
      data: registro.data || '',
      hora_inicio: registro.hora_inicio || '',
      hora_termino: registro.hora_termino || '',
      quem_autorizou: registro.quem_autorizou || '',
      hinos_executados: registro.hinos_executados || 0,
      teve_oracao: registro.teve_oracao ? 'true' : 'false',
      observacoes: registro.observacoes || '',
      membros_presentes: membrosPresentes,
    })
    setBuscaMembro('')
  }

  const salvarEdicao = async () => {
    if (!modalEdicao) return
    setSalvandoEdicao(true)
    const body = {
      ...formEdicao,
      hinos_executados: parseInt(formEdicao.hinos_executados),
      teve_oracao: formEdicao.teve_oracao === 'true',
      membros_presentes: formEdicao.membros_presentes.join(', '),
    }
    const res = await fetch(`/api/registros/${modalEdicao.id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    if (res.ok) {
      setModalEdicao(null)
      carregarRegistros()
    } else {
      alert('Erro ao salvar')
    }
    setSalvandoEdicao(false)
  }

  const excluirRegistro = async (id: string) => {
    if (!confirm('Excluir este registro? Esta ação não pode ser desfeita.')) return
    const res = await fetch(`/api/registros/${id}`, { method: 'DELETE' })
    if (res.ok) carregarRegistros()
    else alert('Erro ao excluir')
  }

  const adicionarMembroEdicao = (nome: string) => {
    if (!formEdicao.membros_presentes.includes(nome)) {
      setFormEdicao((prev: any) => ({ ...prev, membros_presentes: [...prev.membros_presentes, nome] }))
    }
    setBuscaMembro('')
  }

  const adicionarGrupoEdicao = (grupo: string) => {
    const membrosDoGrupo = membros.filter(m => m.grupo === grupo).map(m => m.nome)
    const novos = membrosDoGrupo.filter(n => !formEdicao.membros_presentes.includes(n))
    setFormEdicao((prev: any) => ({ ...prev, membros_presentes: [...prev.membros_presentes, ...novos] }))
    setBuscaMembro('')
  }

  const removerMembroEdicao = (nome: string) => {
    setFormEdicao((prev: any) => ({ ...prev, membros_presentes: prev.membros_presentes.filter((n: string) => n !== nome) }))
  }

  const gruposFiltrados = grupos.filter(g => buscaMembro.length > 0 && g.toLowerCase().includes(buscaMembro.toLowerCase()))
  const membrosFiltrados = membros.filter(m =>
    buscaMembro.length > 0 &&
    m.nome.toLowerCase().includes(buscaMembro.toLowerCase()) &&
    !formEdicao?.membros_presentes?.includes(m.nome)
  )

  const formatarData = (data: string) => new Date(data + 'T12:00:00').toLocaleDateString('pt-BR', {
    weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric'
  })

  const resumoMembros = (membrosPresentes: string) => {
    if (!membrosPresentes) return []
    const nomes = membrosPresentes.split(',').map((n: string) => n.trim()).filter(Boolean)
    const porGrupo: Record<string, number> = {}
    nomes.forEach(nome => {
      const membro = membros.find((m: any) => m.nome === nome)
      const grupo = membro?.grupo || 'Avulso'
      porGrupo[grupo] = (porGrupo[grupo] || 0) + 1
    })
    return Object.entries(porGrupo).sort((a, b) => {
      const numA = parseInt(a[0].replace(/\D/g, '')) || 999
      const numB = parseInt(b[0].replace(/\D/g, '')) || 999
      return numA - numB
    })
  }

  const abaStyle = (a: string): React.CSSProperties => ({
    padding: '8px 18px', borderRadius: 8, cursor: 'pointer',
    fontSize: 13, fontWeight: 600,
    background: aba === a ? '#1e3a5f' : '#fff',
    color: aba === a ? '#fff' : '#475569',
    border: aba === a ? '1px solid #1e3a5f' : '1px solid #e2e8f0',
  })

  return (
    <div style={{ background: '#f1f5f9', minHeight: '100vh', padding: '28px 40px' }} className="historico-wrap">
      <style>{`
        @media (max-width: 768px) {
          .historico-wrap { padding: 16px !important; }
          .historico-header { flex-direction: column !important; align-items: flex-start !important; }
          .col-extra { display: none !important; }
        }
        .hist-row:hover { background: #f8fafc; }
        input:focus, select:focus, textarea:focus { border-color: #2563eb !important; background: #fff !important; }
      `}</style>

      {/* MODAL EDIÇÃO */}
      {modalEdicao && formEdicao && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div style={{ background: '#fff', borderRadius: 16, width: '100%', maxWidth: 600, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
            <div style={{ background: '#1e3a5f', padding: '16px 24px', borderRadius: '16px 16px 0 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ color: '#fff', fontWeight: 700, fontSize: 15, margin: 0 }}>Editar Registro</h3>
              <button onClick={() => setModalEdicao(null)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.7)', cursor: 'pointer', fontSize: 18 }}>✕</button>
            </div>

            <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#94a3b8', letterSpacing: 1, marginBottom: 6 }}>HOSPITAL</label>
                  <select value={formEdicao.hospital_id} onChange={e => setFormEdicao((p: any) => ({ ...p, hospital_id: e.target.value }))} style={inputStyle}>
                    <option value="">Selecione...</option>
                    {hospitais.map(h => <option key={h.id} value={h.id}>{h.nome}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#94a3b8', letterSpacing: 1, marginBottom: 6 }}>DATA</label>
                  <input type="date" value={formEdicao.data} onChange={e => setFormEdicao((p: any) => ({ ...p, data: e.target.value }))} style={inputStyle} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#94a3b8', letterSpacing: 1, marginBottom: 6 }}>HORA INÍCIO</label>
                  <input type="time" value={formEdicao.hora_inicio} onChange={e => setFormEdicao((p: any) => ({ ...p, hora_inicio: e.target.value }))} style={inputStyle} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#94a3b8', letterSpacing: 1, marginBottom: 6 }}>HORA TÉRMINO</label>
                  <input type="time" value={formEdicao.hora_termino} onChange={e => setFormEdicao((p: any) => ({ ...p, hora_termino: e.target.value }))} style={inputStyle} />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#94a3b8', letterSpacing: 1, marginBottom: 6 }}>QUEM AUTORIZOU</label>
                <input type="text" value={formEdicao.quem_autorizou} onChange={e => setFormEdicao((p: any) => ({ ...p, quem_autorizou: e.target.value }))} style={inputStyle} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#94a3b8', letterSpacing: 1, marginBottom: 6 }}>HINOS EXECUTADOS</label>
                  <input type="number" min="0" value={formEdicao.hinos_executados} onChange={e => setFormEdicao((p: any) => ({ ...p, hinos_executados: e.target.value }))} style={inputStyle} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#94a3b8', letterSpacing: 1, marginBottom: 6 }}>HOUVE ORAÇÃO?</label>
                  <select value={formEdicao.teve_oracao} onChange={e => setFormEdicao((p: any) => ({ ...p, teve_oracao: e.target.value }))} style={inputStyle}>
                    <option value="true">✅ Sim</option>
                    <option value="false">❌ Não</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#94a3b8', letterSpacing: 1, marginBottom: 6 }}>MEMBROS PRESENTES</label>
                <div style={{ position: 'relative', marginBottom: 8 }}>
                  <input type="text" value={buscaMembro} onChange={e => setBuscaMembro(e.target.value)} style={inputStyle} placeholder="Buscar membro ou grupo..." />
                  {(gruposFiltrados.length > 0 || membrosFiltrados.length > 0) && (
                    <div style={{ position: 'absolute', zIndex: 10, width: '100%', background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8, boxShadow: '0 4px 12px rgba(0,0,0,0.1)', marginTop: 4, maxHeight: 180, overflowY: 'auto' }}>
                      {gruposFiltrados.map(g => (
                        <button key={g} type="button" onClick={() => adicionarGrupoEdicao(g)} style={{ width: '100%', textAlign: 'left', padding: '8px 12px', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600, color: '#2563eb', borderBottom: '1px solid #f1f5f9' }}>
                          🎻 Adicionar todos do {g}
                        </button>
                      ))}
                      {membrosFiltrados.map(m => (
                        <button key={m.id} type="button" onClick={() => adicionarMembroEdicao(m.nome)} style={{ width: '100%', textAlign: 'left', padding: '8px 12px', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: '#334155', borderBottom: '1px solid #f1f5f9' }}>
                          {m.nome} <span style={{ fontSize: 11, color: '#94a3b8' }}>({m.grupo})</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {formEdicao.membros_presentes.map((nome: string) => (
                    <span key={nome} style={{ display: 'flex', alignItems: 'center', gap: 4, background: '#eff6ff', color: '#2563eb', fontSize: 12, fontWeight: 600, padding: '3px 10px', borderRadius: 999 }}>
                      {nome}
                      <button type="button" onClick={() => removerMembroEdicao(nome)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#93c5fd', fontWeight: 700, fontSize: 14, padding: 0, lineHeight: 1 }}>×</button>
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#94a3b8', letterSpacing: 1, marginBottom: 6 }}>OBSERVAÇÕES</label>
                <textarea rows={3} value={formEdicao.observacoes} onChange={e => setFormEdicao((p: any) => ({ ...p, observacoes: e.target.value }))} style={{ ...inputStyle, resize: 'vertical' }} />
              </div>

              <div style={{ display: 'flex', gap: 8, paddingTop: 4 }}>
                <button onClick={salvarEdicao} disabled={salvandoEdicao} style={{
                  flex: 1, padding: '10px', borderRadius: 8, border: 'none',
                  background: salvandoEdicao ? '#93c5fd' : '#2563eb',
                  color: '#fff', fontSize: 13, fontWeight: 700,
                  cursor: salvandoEdicao ? 'not-allowed' : 'pointer',
                }}>
                  {salvandoEdicao ? 'Salvando...' : 'Salvar Alterações'}
                </button>
                <button onClick={() => setModalEdicao(null)} style={{
                  flex: 1, padding: '10px', borderRadius: 8,
                  border: '1px solid #e2e8f0', background: '#fff',
                  color: '#475569', fontSize: 13, fontWeight: 600, cursor: 'pointer',
                }}>
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div style={{ maxWidth: 1280, margin: '0 auto' }}>

        <div className="historico-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, gap: 16 }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: '#1e293b', margin: 0 }}>Histórico</h1>
            <p style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>Escalas, registros e confirmações anteriores</p>
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            <button onClick={() => { if (mes === 0) { setMes(11); setAno(ano - 1) } else setMes(mes - 1) }}
              style={{ width: 34, height: 34, borderRadius: 8, border: '1px solid #e2e8f0', background: '#fff', cursor: 'pointer', color: '#475569', fontSize: 14 }}>←</button>
            <span style={{ padding: '7px 16px', background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 13, fontWeight: 600, color: '#334155' }}>
              {meses[mes]} {ano}
            </span>
            <button onClick={() => { if (mes === 11) { setMes(0); setAno(ano + 1) } else setMes(mes + 1) }}
              style={{ width: 34, height: 34, borderRadius: 8, border: '1px solid #e2e8f0', background: '#fff', cursor: 'pointer', color: '#475569', fontSize: 14 }}>→</button>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
          <button style={abaStyle('escalas')} onClick={() => setAba('escalas')}>Escalas</button>
          <button style={abaStyle('registros')} onClick={() => setAba('registros')}>Registros</button>
          <button style={abaStyle('confirmacoes')} onClick={() => setAba('confirmacoes')}>Confirmações</button>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 48, color: '#64748b' }}>Carregando...</div>
        ) : (
          <>
            {/* ESCALAS */}
            {aba === 'escalas' && (
              escalas.length === 0 ? (
                <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', padding: 48, textAlign: 'center' }}>
                  <p style={{ fontSize: 36, marginBottom: 12 }}>📅</p>
                  <p style={{ color: '#64748b', fontSize: 14 }}>Nenhuma escala anterior em {meses[mes]} {ano}</p>
                </div>
              ) : (
                <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
                  <div style={{ padding: '10px 20px', background: '#f8fafc', borderBottom: '1px solid #f1f5f9', display: 'grid', gridTemplateColumns: '1fr 200px 100px' }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', letterSpacing: 1 }}>ESCALA</span>
                    <span className="col-extra" style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', letterSpacing: 1 }}>LOCAL</span>
                    <span className="col-extra" style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', letterSpacing: 1 }}>HORA</span>
                  </div>
                  {escalas.map((escala, idx) => (
                    <div key={escala.id} style={{ borderBottom: idx < escalas.length - 1 ? '1px solid #f1f5f9' : 'none' }}>
                      <div className="hist-row" style={{ display: 'grid', gridTemplateColumns: '1fr 200px 100px', padding: '14px 20px', alignItems: 'center', transition: 'background 0.15s' }}>
                        <div>
                          <p style={{ fontSize: 14, fontWeight: 600, color: '#1e293b', margin: 0 }}>{escala.grupo}</p>
                          <p style={{ fontSize: 12, color: '#94a3b8', margin: 0 }}>{formatarData(escala.data)}</p>
                        </div>
                        <span className="col-extra" style={{ fontSize: 13, color: '#475569' }}>{escala.local_texto}</span>
                        <span className="col-extra" style={{ fontSize: 13, color: '#475569' }}>{escala.hora_inicio}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )
            )}

            {/* REGISTROS */}
            {aba === 'registros' && (
              registros.length === 0 ? (
                <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', padding: 48, textAlign: 'center' }}>
                  <p style={{ fontSize: 36, marginBottom: 12 }}>📋</p>
                  <p style={{ color: '#64748b', fontSize: 14 }}>Nenhum registro em {meses[mes]} {ano}</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {registros.map(registro => {
                    const resumo = resumoMembros(registro.membros_presentes)
                    const aberto = detalhesAbertos[registro.id]
                    const criadoEm = registro.criado_em ? new Date(registro.criado_em).toLocaleString('pt-BR') : null
                    return (
                      <div key={registro.id} style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
                        <div style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#1e3a5f', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
                              </svg>
                            </div>
                            <div>
                              <p style={{ fontSize: 15, fontWeight: 700, color: '#1e293b', margin: 0 }}>{registro.hospitais?.nome || '—'}</p>
                              <p style={{ fontSize: 12, color: '#94a3b8', margin: 0 }}>{formatarData(registro.data)} · {registro.hora_inicio} às {registro.hora_termino}</p>
                            </div>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            {podeEditar && (
                              <button onClick={() => abrirEdicao(registro)} title="Editar" style={{
                                width: 30, height: 30, borderRadius: 7, border: 'none',
                                background: '#eff6ff', cursor: 'pointer',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                              }}>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                                  <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                                </svg>
                              </button>
                            )}
                            {podeExcluir && (
                              <button onClick={() => excluirRegistro(registro.id)} title="Excluir" style={{
                                width: 30, height: 30, borderRadius: 7, border: 'none',
                                background: '#fff1f2', cursor: 'pointer',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                              }}>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <polyline points="3 6 5 6 21 6"/>
                                  <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
                                </svg>
                              </button>
                            )}
                            <button onClick={() => toggleDetalhes(registro.id)} style={{
                              fontSize: 12, fontWeight: 600, color: '#2563eb',
                              background: 'none', border: 'none', cursor: 'pointer',
                              display: 'flex', alignItems: 'center', gap: 4,
                            }}>
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                {aberto ? <polyline points="18 15 12 9 6 15"/> : <polyline points="6 9 12 15 18 9"/>}
                              </svg>
                              {aberto ? 'Ocultar' : 'Ver detalhes'}
                            </button>
                          </div>
                        </div>

                        {aberto && (
                          <div style={{ borderTop: '1px solid #f1f5f9', padding: '16px 20px', background: '#f8fafc' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: criadoEm ? 12 : 0 }}>
                              <div>
                                <p style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', letterSpacing: 1, margin: '0 0 4px' }}>AUTORIZOU</p>
                                <p style={{ fontSize: 13, color: '#475569', margin: 0 }}>{registro.quem_autorizou || '—'}</p>
                              </div>
                              <div>
                                <p style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', letterSpacing: 1, margin: '0 0 4px' }}>MEMBROS</p>
                                {resumo.length > 0 ? resumo.map(([grupo, total]) => (
                                  <p key={grupo} style={{ fontSize: 13, color: '#475569', margin: 0 }}>{total} — {grupo}</p>
                                )) : <p style={{ fontSize: 13, color: '#94a3b8', margin: 0 }}>—</p>}
                              </div>
                              <div>
                                <p style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', letterSpacing: 1, margin: '0 0 4px' }}>HINOS</p>
                                <p style={{ fontSize: 13, color: '#475569', margin: 0 }}>🎵 {registro.hinos_executados}</p>
                              </div>
                              <div>
                                <p style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', letterSpacing: 1, margin: '0 0 4px' }}>ORAÇÃO</p>
                                <p style={{ fontSize: 13, color: '#475569', margin: 0 }}>{registro.teve_oracao ? '✅ Sim' : '❌ Não'}</p>
                              </div>
                            </div>
                            {criadoEm && (
                              <p style={{ fontSize: 11, color: '#94a3b8', margin: 0, paddingTop: 8, borderTop: '1px solid #e2e8f0' }}>
                                Registrado em: {criadoEm}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )
            )}

            {/* CONFIRMAÇÕES */}
            {aba === 'confirmacoes' && (
              confirmacoes.length === 0 ? (
                <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', padding: 48, textAlign: 'center' }}>
                  <p style={{ fontSize: 36, marginBottom: 12 }}>✅</p>
                  <p style={{ color: '#64748b', fontSize: 14 }}>Nenhuma confirmação anterior em {meses[mes]} {ano}</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {confirmacoes.map(escala => {
                    const confs = escala.confirmacoes || []
                    const membrosDoGrupo = escala.membrosDoGrupo || []
                    const confirmados = confs.filter((c: any) => c.status === 'confirmado')
                    const ausentes = confs.filter((c: any) => c.status === 'ausente')
                    const dispensados = confs.filter((c: any) => c.status === 'dispensado')
                    const pendentes = membrosDoGrupo.filter((m: any) => !confs.some((c: any) => String(c.membro_id) === String(m.id)))
                    const total = membrosDoGrupo.length
                    const completo = total > 0 && pendentes.length === 0
                    const aberto = detalhesAbertos[escala.id]

                    return (
                      <div key={escala.id} style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
                        <div style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                            <div>
                              <p style={{ fontSize: 14, fontWeight: 700, color: '#1e293b', margin: 0 }}>{escala.grupo}</p>
                              <p style={{ fontSize: 12, color: '#94a3b8', margin: 0 }}>{formatarData(escala.data)} · {escala.local_texto}</p>
                            </div>
                            <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 999, background: completo ? '#dcfce7' : '#fef9c3', color: completo ? '#16a34a' : '#854d0e' }}>
                              {completo ? 'Completo' : 'Incompleto'}
                            </span>
                          </div>
                          <button onClick={() => toggleDetalhes(escala.id)} style={{ fontSize: 12, fontWeight: 600, color: '#2563eb', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              {aberto ? <polyline points="18 15 12 9 6 15"/> : <polyline points="6 9 12 15 18 9"/>}
                            </svg>
                            {aberto ? 'Ocultar' : 'Ver detalhes'}
                          </button>
                        </div>

                        {aberto && (
                          <div style={{ borderTop: '1px solid #f1f5f9', padding: '16px 20px', background: '#f8fafc', display: 'flex', flexDirection: 'column', gap: 12 }}>
                            {confirmados.length > 0 && (
                              <div>
                                <p style={{ fontSize: 11, fontWeight: 700, color: '#16a34a', letterSpacing: 1, margin: '0 0 8px' }}>✅ CONFIRMADOS ({confirmados.length})</p>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                                  {confirmados.map((c: any) => <span key={c.id} style={{ fontSize: 12, background: '#dcfce7', color: '#16a34a', padding: '3px 10px', borderRadius: 999, fontWeight: 600 }}>{c.membros?.nome || '—'}</span>)}
                                </div>
                              </div>
                            )}
                            {ausentes.length > 0 && (
                              <div>
                                <p style={{ fontSize: 11, fontWeight: 700, color: '#dc2626', letterSpacing: 1, margin: '0 0 8px' }}>❌ AUSENTES ({ausentes.length})</p>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                                  {ausentes.map((c: any) => <span key={c.id} style={{ fontSize: 12, background: '#fee2e2', color: '#dc2626', padding: '3px 10px', borderRadius: 999, fontWeight: 600 }}>{c.membros?.nome || '—'}</span>)}
                                </div>
                              </div>
                            )}
                            {dispensados.length > 0 && (
                              <div>
                                <p style={{ fontSize: 11, fontWeight: 700, color: '#64748b', letterSpacing: 1, margin: '0 0 8px' }}>🔕 DISPENSADOS ({dispensados.length})</p>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                                  {dispensados.map((c: any) => <span key={c.id} style={{ fontSize: 12, background: '#f1f5f9', color: '#64748b', padding: '3px 10px', borderRadius: 999, fontWeight: 600 }}>{c.membros?.nome || '—'}</span>)}
                                </div>
                              </div>
                            )}
                            {pendentes.length > 0 && (
                              <div>
                                <p style={{ fontSize: 11, fontWeight: 700, color: '#854d0e', letterSpacing: 1, margin: '0 0 8px' }}>⏳ PENDENTES ({pendentes.length})</p>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                                  {pendentes.map((m: any) => <span key={m.id} style={{ fontSize: 12, background: '#fef9c3', color: '#854d0e', padding: '3px 10px', borderRadius: 999, fontWeight: 600 }}>{m.nome}</span>)}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )
            )}
          </>
        )}
      </div>
    </div>
  )
}