'use client'

import { useState, useEffect } from 'react'

const meses = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro']

export default function Historico() {
  const hoje = new Date()
  const [mes, setMes] = useState(hoje.getMonth())
  const [ano, setAno] = useState(hoje.getFullYear())
  const [aba, setAba] = useState<'escalas' | 'registros' | 'confirmacoes'>('escalas')
  const [escalas, setEscalas] = useState<any[]>([])
  const [registros, setRegistros] = useState<any[]>([])
  const [confirmacoes, setConfirmacoes] = useState<any[]>([])
  const [membros, setMembros] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [detalhesAbertos, setDetalhesAbertos] = useState<Record<string, boolean>>({})

  useEffect(() => {
    fetch('/api/membros').then(r => r.json()).then(data => { if (Array.isArray(data)) setMembros(data) })
  }, [])

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
      fetch(`/api/registros?mes=${mes + 1}&ano=${ano}`)
        .then(r => r.json())
        .then(data => {
          setRegistros(Array.isArray(data) ? data : [])
          setLoading(false)
        })
    }
  }, [mes, ano, aba])

  const toggleDetalhes = (id: string) => {
    setDetalhesAbertos(prev => ({ ...prev, [id]: !prev[id] }))
  }

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

  const badgeStatus = (status: string) => {
    const config: Record<string, { bg: string, color: string, label: string }> = {
      confirmado: { bg: '#dcfce7', color: '#16a34a', label: 'Confirmou' },
      ausente: { bg: '#fee2e2', color: '#dc2626', label: 'Ausente' },
      dispensado: { bg: '#f1f5f9', color: '#64748b', label: 'Dispensado' },
      pendente: { bg: '#fef9c3', color: '#854d0e', label: 'Pendente' },
    }
    const c = config[status] || config.pendente
    return (
      <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 999, background: c.bg, color: c.color }}>
        {c.label}
      </span>
    )
  }

  return (
    <div style={{ background: '#f1f5f9', minHeight: '100vh', padding: '28px 40px' }} className="historico-wrap">
      <style>{`
        @media (max-width: 768px) {
          .historico-wrap { padding: 16px !important; }
          .historico-header { flex-direction: column !important; align-items: flex-start !important; }
          .col-extra { display: none !important; }
        }
        .hist-row:hover { background: #f8fafc; }
      `}</style>

      <div style={{ maxWidth: 1280, margin: '0 auto' }}>

        {/* Header */}
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

        {/* Abas */}
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
                      <div className="hist-row" style={{
                        display: 'grid', gridTemplateColumns: '1fr 200px 100px',
                        padding: '14px 20px', alignItems: 'center', transition: 'background 0.15s',
                      }}>
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
                    const criadoEm = registro.criado_em
                      ? new Date(registro.criado_em).toLocaleString('pt-BR')
                      : null
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
                    const pendentes = membrosDoGrupo.filter((m: any) =>
                      !confs.some((c: any) => String(c.membro_id) === String(m.id))
                    )
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
                            <span style={{
                              fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 999,
                              background: completo ? '#dcfce7' : '#fef9c3',
                              color: completo ? '#16a34a' : '#854d0e',
                            }}>
                              {completo ? 'Completo' : 'Incompleto'}
                            </span>
                          </div>
                          <button onClick={() => toggleDetalhes(escala.id)} style={{
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

                        {aberto && (
                          <div style={{ borderTop: '1px solid #f1f5f9', padding: '16px 20px', background: '#f8fafc', display: 'flex', flexDirection: 'column', gap: 12 }}>
                            {confirmados.length > 0 && (
                              <div>
                                <p style={{ fontSize: 11, fontWeight: 700, color: '#16a34a', letterSpacing: 1, margin: '0 0 8px' }}>✅ CONFIRMADOS ({confirmados.length})</p>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                                  {confirmados.map((c: any) => (
                                    <span key={c.id} style={{ fontSize: 12, background: '#dcfce7', color: '#16a34a', padding: '3px 10px', borderRadius: 999, fontWeight: 600 }}>
                                      {c.membros?.nome || '—'}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                            {ausentes.length > 0 && (
                              <div>
                                <p style={{ fontSize: 11, fontWeight: 700, color: '#dc2626', letterSpacing: 1, margin: '0 0 8px' }}>❌ AUSENTES ({ausentes.length})</p>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                                  {ausentes.map((c: any) => (
                                    <span key={c.id} style={{ fontSize: 12, background: '#fee2e2', color: '#dc2626', padding: '3px 10px', borderRadius: 999, fontWeight: 600 }}>
                                      {c.membros?.nome || '—'}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                            {dispensados.length > 0 && (
                              <div>
                                <p style={{ fontSize: 11, fontWeight: 700, color: '#64748b', letterSpacing: 1, margin: '0 0 8px' }}>🔕 DISPENSADOS ({dispensados.length})</p>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                                  {dispensados.map((c: any) => (
                                    <span key={c.id} style={{ fontSize: 12, background: '#f1f5f9', color: '#64748b', padding: '3px 10px', borderRadius: 999, fontWeight: 600 }}>
                                      {c.membros?.nome || '—'}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                            {pendentes.length > 0 && (
                              <div>
                                <p style={{ fontSize: 11, fontWeight: 700, color: '#854d0e', letterSpacing: 1, margin: '0 0 8px' }}>⏳ PENDENTES ({pendentes.length})</p>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                                  {pendentes.map((m: any) => (
                                    <span key={m.id} style={{ fontSize: 12, background: '#fef9c3', color: '#854d0e', padding: '3px 10px', borderRadius: 999, fontWeight: 600 }}>
                                      {m.nome}
                                    </span>
                                  ))}
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