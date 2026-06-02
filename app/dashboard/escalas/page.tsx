'use client'

import { useState, useEffect } from 'react'
import BotaoExcluirEscala from './BotaoExcluirEscala'

type Escala = {
  id: string
  data: string
  grupo: string
  local_texto: string
  hora_inicio: string
  atendentes: string
  confirmacao_aberta: boolean
}

type Atendente = { id: string; nome: string }

const meses = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro']

export default function Escalas() {
  const hoje = new Date()
  const [mes, setMes] = useState(hoje.getMonth() + 1)
  const [ano, setAno] = useState(hoje.getFullYear())
  const [escalas, setEscalas] = useState<Escala[]>([])
  const [atendentes, setAtendentes] = useState<Atendente[]>([])
  const [loading, setLoading] = useState(true)
  const [permissoes, setPermissoes] = useState<any>(null)
  const [salvandoAtendente, setSalvandoAtendente] = useState<string | null>(null)
  const [liberando, setLiberando] = useState<string | null>(null)
  const [liberandoLote, setLiberandoLote] = useState<string | null>(null)
  const [enviandoLembrete, setEnviandoLembrete] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  useEffect(() => {
    fetch('/api/membros/eu').then(res => res.json()).then(data => setPermissoes(data.permissoes || {})).catch(() => setPermissoes({}))
    fetch('/api/membros').then(r => r.json()).then(data => {
      if (Array.isArray(data)) setAtendentes(data.filter((m: any) => m.perfil === 'Atendente' && m.status === 'Ativo'))
    })
  }, [])

  const podeCriar = permissoes?.escalas?.criar === true
  const podeEditar = permissoes?.escalas?.editar === true
  const podeExcluir = permissoes?.escalas?.excluir === true

  const carregarEscalas = () => {
    setLoading(true)
    fetch(`/api/escalas?mes=${mes}&ano=${ano}`)
      .then(res => res.json())
      .then(data => {
        const todas = Array.isArray(data) ? data : []
        const mesAtual = hoje.getMonth() + 1
        const anoAtual = hoje.getFullYear()
        let filtradas = todas
        if (mes === mesAtual && ano === anoAtual) {
          const ontem = new Date()
          ontem.setHours(0, 0, 0, 0)
          filtradas = todas.filter((e: Escala) => new Date(e.data + 'T12:00:00') >= ontem)
        }
        setEscalas(filtradas)
        setLoading(false)
      })
      .catch(() => { setEscalas([]); setLoading(false) })
  }

  useEffect(() => { carregarEscalas() }, [mes, ano])

  const navMes = (dir: number) => {
    if (dir === -1) { if (mes === 1) { setMes(12); setAno(ano - 1) } else setMes(mes - 1) }
    else { if (mes === 12) { setMes(1); setAno(ano + 1) } else setMes(mes + 1) }
  }

  const salvarAtendente = async (id: string, nome: string) => {
    setSalvandoAtendente(id)
    await fetch(`/api/escalas/${id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ atendentes: nome }),
    })
    setEscalas(prev => prev.map(e => e.id === id ? { ...e, atendentes: nome } : e))
    setSalvandoAtendente(null)
  }

  const liberarEscala = async (id: string, aberta: boolean) => {
    if (!aberta) {
      const escala = escalas.find(e => e.id === id)
      if (!escala?.atendentes) {
        alert('Defina o atendente antes de liberar a escala!')
        return
      }
    }
    setLiberando(id)
    await fetch(`/api/escalas/${id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ confirmacao_aberta: !aberta }),
    })
    if (!aberta) await fetch('/api/push/notificar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ escala_id: id }),
    })
    setEscalas(prev => prev.map(e => e.id === id ? { ...e, confirmacao_aberta: !aberta } : e))
    setLiberando(null)
  }

  const liberarTodasDoDia = async (data: string, itens: Escala[]) => {
    const comAtendente = itens.filter(e => !e.confirmacao_aberta && e.atendentes)
    const semAtendente = itens.filter(e => !e.confirmacao_aberta && !e.atendentes)

    if (comAtendente.length === 0) {
      alert('Nenhuma escala pendente com atendente definido neste dia.')
      return
    }

    const dataFormatada = new Date(data + 'T12:00:00').toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: '2-digit' })
    const avisoSemAtendente = semAtendente.length > 0
      ? `\n⚠️ ${semAtendente.length} escala(s) sem atendente serão ignoradas.`
      : ''

    if (!confirm(`Liberar ${comAtendente.length} escala(s) de ${dataFormatada}?${avisoSemAtendente}\n\nUma notificação será enviada para cada grupo.`)) return

    setLiberandoLote(data)

    for (const escala of comAtendente) {
      await fetch(`/api/escalas/${escala.id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ confirmacao_aberta: true }),
      })
      await fetch('/api/push/notificar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ escala_id: escala.id }),
      })
      setEscalas(prev => prev.map(e => e.id === escala.id ? { ...e, confirmacao_aberta: true } : e))
    }

    setLiberandoLote(null)
  }

  const excluirMes = async () => {
    if (!confirm(`Excluir TODAS as escalas de ${meses[mes - 1]} ${ano}? Esta ação não pode ser desfeita!`)) return
    await fetch('/api/escalas/gerar', {
      method: 'DELETE', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mes, ano }),
    })
    carregarEscalas()
  }

  const enviarLembrete = async () => {
    if (!confirm('Enviar lembrete para todos os membros escalados no próximo sábado?')) return
    setEnviandoLembrete(true)
    const res = await fetch('/api/escalas/lembrete', { method: 'POST' })
    const data = await res.json()
    if (res.ok) alert(`✅ Lembrete enviado para ${data.enviados} dispositivo(s)!`)
    else alert('❌ ' + (data.error || 'Erro ao enviar lembrete'))
    setEnviandoLembrete(false)
  }

  const datasPorDia = escalas.reduce((acc, escala) => {
    if (!acc[escala.data]) acc[escala.data] = []
    acc[escala.data].push(escala)
    return acc
  }, {} as Record<string, Escala[]>)

  const formatarData = (dataStr: string) => new Date(dataStr + 'T12:00:00').toLocaleDateString('pt-BR', {
    weekday: 'long', day: '2-digit', month: '2-digit'
  })

  const mesAtual = hoje.getMonth() + 1
  const anoAtual = hoje.getFullYear()
  const isMesPassado = ano < anoAtual || (ano === anoAtual && mes < mesAtual)
  const diasParaSabado = (6 - hoje.getDay() + 7) % 7 || 7
  const estaНаSemanaDeSabado = diasParaSabado <= 6

  const selectStyle: React.CSSProperties = {
    padding: '5px 28px 5px 10px', borderRadius: 7,
    border: '1px solid #e2e8f0', background: '#f8fafc',
    fontSize: 12, color: '#334155', outline: 'none',
    appearance: 'none', WebkitAppearance: 'none', cursor: 'pointer',
    minWidth: isMobile ? 100 : 140,
  }

  // Ícone de lixeira para excluir (substitui o texto "Excluir")
  const IconeLixeira = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6"/>
      <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
      <path d="M10 11v6M14 11v6"/>
      <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/>
    </svg>
  )

  return (
    <div style={{ background: '#f1f5f9', minHeight: '100vh', padding: isMobile ? '16px' : '28px 40px' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>

        {/* Cabeçalho */}
        <div style={{ marginBottom: 20 }}>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: '#1e293b', margin: 0 }}>Escalas</h1>
          <p style={{ fontSize: 13, color: '#64748b', marginTop: 4, marginBottom: 0 }}>
            {escalas.length} escala{escalas.length !== 1 ? 's' : ''} em {meses[mes - 1]} {ano}
          </p>
        </div>

        {/* Controles */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 20, alignItems: 'center' }}>
          {/* Navegação mês */}
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <button onClick={() => navMes(-1)} style={{ width: 34, height: 34, borderRadius: 8, border: '1px solid #e2e8f0', background: '#fff', cursor: 'pointer', color: '#475569', fontSize: 14 }}>←</button>
            <span style={{ padding: '7px 12px', background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 13, fontWeight: 600, color: '#334155', whiteSpace: 'nowrap' }}>
              {meses[mes - 1]} {ano}
            </span>
            <button onClick={() => navMes(1)} style={{ width: 34, height: 34, borderRadius: 8, border: '1px solid #e2e8f0', background: '#fff', cursor: 'pointer', color: '#475569', fontSize: 14 }}>→</button>
          </div>

          {podeExcluir && escalas.length > 0 && (
            <button onClick={excluirMes} style={{
              padding: '8px 14px', borderRadius: 8, border: '1px solid #fecaca',
              background: '#fff', color: '#dc2626', fontSize: 13, fontWeight: 600, cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap',
            }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
              </svg>
              Excluir mês
            </button>
          )}

          {podeCriar && estaНаSemanaDeSabado && (
            <button onClick={enviarLembrete} disabled={enviandoLembrete} style={{
              padding: '8px 14px', borderRadius: 8, border: '1px solid #7c3aed',
              background: '#fff', color: '#7c3aed', fontSize: 13, fontWeight: 600,
              cursor: enviandoLembrete ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', gap: 6,
              opacity: enviandoLembrete ? 0.5 : 1, whiteSpace: 'nowrap',
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
              </svg>
              {enviandoLembrete ? 'Enviando...' : 'Enviar lembrete'}
            </button>
          )}

          {podeCriar && (
            <a href="/dashboard/escalas/gerar" style={{
              padding: '8px 14px', borderRadius: 8, border: '1px solid #e2e8f0',
              background: '#fff', color: '#475569', fontSize: 13, fontWeight: 600,
              textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap',
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/>
                <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
              </svg>
              Gerar Escalas
            </a>
          )}

          {podeCriar && (
            <a href="/dashboard/escalas/nova" style={{
              padding: '8px 14px', borderRadius: 8, border: '1px solid #2563eb',
              background: '#fff', color: '#2563eb', fontSize: 13, fontWeight: 600,
              textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap',
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              Nova Escala
            </a>
          )}
        </div>

        {isMesPassado && (
          <div style={{ background: '#fef9c3', border: '1px solid #fde68a', borderRadius: 10, padding: '10px 16px', marginBottom: 16, fontSize: 13, color: '#854d0e', display: 'flex', alignItems: 'center', gap: 8 }}>
            ⚠️ Você está visualizando um mês passado.
          </div>
        )}

        {loading ? (
          <div style={{ textAlign: 'center', padding: 48, color: '#64748b' }}>Carregando...</div>
        ) : escalas.length === 0 ? (
          <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', padding: 48, textAlign: 'center' }}>
            <p style={{ fontSize: 36, marginBottom: 12 }}>📅</p>
            <p style={{ color: '#64748b', fontSize: 14 }}>Nenhuma escala em {meses[mes - 1]} {ano}</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {Object.entries(datasPorDia).sort(([a], [b]) => a.localeCompare(b)).map(([data, itens]) => {
              const pendentesComAtendente = itens.filter(e => !e.confirmacao_aberta && e.atendentes)
              const todasLiberadas = itens.every(e => e.confirmacao_aberta)
              const isLiberandoEsseDia = liberandoLote === data

              return (
                <div key={data} style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
                  <div style={{ background: '#1e3a5f', padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                    <h3 style={{ color: '#fff', fontWeight: 700, fontSize: 13, margin: 0, textTransform: 'capitalize' }}>{formatarData(data)}</h3>
                    {podeEditar && !todasLiberadas && pendentesComAtendente.length > 0 && (
                      <button
                        onClick={() => liberarTodasDoDia(data, itens)}
                        disabled={isLiberandoEsseDia}
                        style={{
                          padding: '5px 12px', borderRadius: 999,
                          border: '1px solid rgba(255,255,255,0.4)',
                          background: isLiberandoEsseDia ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.15)',
                          color: '#fff', fontSize: 11, fontWeight: 600,
                          cursor: isLiberandoEsseDia ? 'not-allowed' : 'pointer',
                          display: 'flex', alignItems: 'center', gap: 5,
                          opacity: isLiberandoEsseDia ? 0.7 : 1,
                          whiteSpace: 'nowrap', flexShrink: 0,
                        }}
                      >
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M5 12l5 5L20 7"/>
                        </svg>
                        {isLiberandoEsseDia ? 'Liberando...' : `Liberar todas (${pendentesComAtendente.length})`}
                      </button>
                    )}
                    {podeEditar && todasLiberadas && (
                      <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', fontWeight: 600, flexShrink: 0 }}>✅ Todas liberadas</span>
                    )}
                  </div>

                  <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' } as React.CSSProperties}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: isMobile ? 600 : 'auto' }}>
                      <thead>
                        <tr style={{ background: '#f8fafc', borderBottom: '1px solid #f1f5f9' }}>
                          <th style={{ textAlign: 'left', padding: '10px 16px', fontSize: 11, fontWeight: 700, color: '#94a3b8', letterSpacing: 1, whiteSpace: 'nowrap' }}>GRUPO</th>
                          <th style={{ textAlign: 'left', padding: '10px 16px', fontSize: 11, fontWeight: 700, color: '#94a3b8', letterSpacing: 1, whiteSpace: 'nowrap' }}>LOCAL</th>
                          <th style={{ textAlign: 'left', padding: '10px 16px', fontSize: 11, fontWeight: 700, color: '#94a3b8', letterSpacing: 1, whiteSpace: 'nowrap' }}>HORA</th>
                          <th style={{ textAlign: 'left', padding: '10px 16px', fontSize: 11, fontWeight: 700, color: '#94a3b8', letterSpacing: 1, whiteSpace: 'nowrap' }}>ATENDENTE</th>
                          <th style={{ textAlign: 'center', padding: '10px 16px', fontSize: 11, fontWeight: 700, color: '#94a3b8', letterSpacing: 1, whiteSpace: 'nowrap' }}>STATUS</th>
                          <th style={{ textAlign: 'right', padding: '10px 16px', fontSize: 11, fontWeight: 700, color: '#94a3b8', letterSpacing: 1, whiteSpace: 'nowrap' }}>AÇÕES</th>
                        </tr>
                      </thead>
                      <tbody>
                        {itens.map((escala, idx) => (
                          <tr key={escala.id} style={{ borderBottom: idx < itens.length - 1 ? '1px solid #f1f5f9' : 'none' }}>
                            <td style={{ padding: '12px 16px', fontWeight: 600, color: '#1e293b', whiteSpace: 'nowrap' }}>{escala.grupo}</td>
                            <td style={{ padding: '12px 16px', color: '#475569', minWidth: 120 }}>{escala.local_texto}</td>
                            <td style={{ padding: '12px 16px', color: '#475569', whiteSpace: 'nowrap' }}>
                              <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                                </svg>
                                {escala.hora_inicio}
                              </span>
                            </td>
                            <td style={{ padding: '12px 16px' }}>
                              {podeEditar ? (
                                <div style={{ position: 'relative', display: 'inline-block' }}>
                                  <select
                                    value={escala.atendentes || ''}
                                    onChange={e => salvarAtendente(escala.id, e.target.value)}
                                    disabled={salvandoAtendente === escala.id}
                                    style={selectStyle}
                                  >
                                    <option value="">A definir</option>
                                    {atendentes.map(a => <option key={a.id} value={a.nome}>{a.nome}</option>)}
                                  </select>
                                  <svg style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
                                    width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="6 9 12 15 18 9"/>
                                  </svg>
                                </div>
                              ) : (
                                <span style={{ color: escala.atendentes ? '#475569' : '#cbd5e1', whiteSpace: 'nowrap' }}>
                                  {escala.atendentes || 'A definir'}
                                </span>
                              )}
                            </td>
                            <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                              {podeEditar ? (
                                <button
                                  onClick={() => liberarEscala(escala.id, escala.confirmacao_aberta)}
                                  disabled={liberando === escala.id}
                                  style={{
                                    padding: '4px 10px', borderRadius: 999, border: 'none',
                                    fontSize: 11, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap',
                                    background: escala.confirmacao_aberta ? '#dcfce7' : '#f1f5f9',
                                    color: escala.confirmacao_aberta ? '#16a34a' : '#64748b',
                                  }}
                                >
                                  {liberando === escala.id ? '...' : escala.confirmacao_aberta ? '✅ Liberada' : 'Liberar'}
                                </button>
                              ) : (
                                <span style={{
                                  fontSize: 11, fontWeight: 600, padding: '4px 10px', borderRadius: 999, whiteSpace: 'nowrap',
                                  background: escala.confirmacao_aberta ? '#dcfce7' : '#f1f5f9',
                                  color: escala.confirmacao_aberta ? '#16a34a' : '#64748b',
                                }}>
                                  {escala.confirmacao_aberta ? '✅ Liberada' : 'Pendente'}
                                </span>
                              )}
                            </td>
                            <td style={{ padding: '12px 16px' }}>
                              <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                                {podeEditar && (
                                  <a href={`/dashboard/escalas/${escala.id}/editar`} title="Editar" style={{
                                    width: 30, height: 30, borderRadius: 7, background: '#eff6ff',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none',
                                  }}>
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                      <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                                      <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                                    </svg>
                                  </a>
                                )}
                                {podeExcluir && (
                                  <div style={{
                                    width: 30, height: 30, borderRadius: 7, background: '#fee2e2',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                  }}>
                                    <BotaoExcluirEscala id={escala.id} />
                                  </div>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}