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
    if (!aberta) await fetch('/api/push/notificar', { method: 'POST' })
    setEscalas(prev => prev.map(e => e.id === id ? { ...e, confirmacao_aberta: !aberta } : e))
    setLiberando(null)
  }

  const excluirMes = async () => {
    if (!confirm(`Excluir TODAS as escalas de ${meses[mes - 1]} ${ano}? Esta ação não pode ser desfeita!`)) return
    await fetch('/api/escalas/gerar', {
      method: 'DELETE', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mes, ano }),
    })
    carregarEscalas()
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

  const selectStyle: React.CSSProperties = {
    padding: '5px 28px 5px 10px', borderRadius: 7,
    border: '1px solid #e2e8f0', background: '#f8fafc',
    fontSize: 12, color: '#334155', outline: 'none',
    appearance: 'none', WebkitAppearance: 'none', cursor: 'pointer',
    minWidth: 140,
  }

  return (
    <div style={{ background: '#f1f5f9', minHeight: '100vh', padding: '28px 40px' }} className="escalas-wrap">
      <style>{`
        @media (max-width: 768px) {
          .escalas-wrap { padding: 16px !important; }
          .escalas-header { flex-direction: column !important; align-items: flex-start !important; }
          .col-atendente, .col-hora, .col-liberar { display: none !important; }
        }
        .escala-row:hover { background: #f8fafc; }
      `}</style>

      <div style={{ maxWidth: 1280, margin: '0 auto' }}>

        <div className="escalas-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, gap: 16 }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: '#1e293b', margin: 0 }}>Escalas</h1>
            <p style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>
              {escalas.length} escala{escalas.length !== 1 ? 's' : ''} em {meses[mes - 1]} {ano}
            </p>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <button onClick={() => navMes(-1)} style={{ width: 34, height: 34, borderRadius: 8, border: '1px solid #e2e8f0', background: '#fff', cursor: 'pointer', color: '#475569', fontSize: 14 }}>←</button>
              <span style={{ padding: '7px 16px', background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 13, fontWeight: 600, color: '#334155' }}>
                {meses[mes - 1]} {ano}
              </span>
              <button onClick={() => navMes(1)} style={{ width: 34, height: 34, borderRadius: 8, border: '1px solid #e2e8f0', background: '#fff', cursor: 'pointer', color: '#475569', fontSize: 14 }}>→</button>
            </div>

            {podeExcluir && escalas.length > 0 && (
              <button onClick={excluirMes} style={{
                padding: '8px 14px', borderRadius: 8, border: '1px solid #fecaca',
                background: '#fff', color: '#dc2626', fontSize: 13, fontWeight: 600, cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 6,
              }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
                </svg>
                Excluir mês
              </button>
            )}

            {podeCriar && (
              <a href="/dashboard/escalas/gerar" style={{
                padding: '8px 16px', borderRadius: 8, border: '1px solid #e2e8f0',
                background: '#fff', color: '#475569', fontSize: 13, fontWeight: 600,
                textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6,
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
                padding: '8px 16px', borderRadius: 8, border: '1px solid #2563eb',
                background: '#fff', color: '#2563eb', fontSize: 13, fontWeight: 600,
                textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6,
              }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
                Nova Escala
              </a>
            )}
          </div>
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
            {Object.entries(datasPorDia).sort(([a], [b]) => a.localeCompare(b)).map(([data, itens]) => (
              <div key={data} style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
                <div style={{ background: '#1e3a5f', padding: '12px 20px' }}>
                  <h3 style={{ color: '#fff', fontWeight: 700, fontSize: 14, margin: 0, textTransform: 'capitalize' }}>{formatarData(data)}</h3>
                </div>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                    <thead>
                      <tr style={{ background: '#f8fafc', borderBottom: '1px solid #f1f5f9' }}>
                        <th style={{ textAlign: 'left', padding: '10px 20px', fontSize: 11, fontWeight: 700, color: '#94a3b8', letterSpacing: 1 }}>GRUPO</th>
                        <th style={{ textAlign: 'left', padding: '10px 16px', fontSize: 11, fontWeight: 700, color: '#94a3b8', letterSpacing: 1 }}>LOCAL</th>
                        <th className="col-hora" style={{ textAlign: 'left', padding: '10px 16px', fontSize: 11, fontWeight: 700, color: '#94a3b8', letterSpacing: 1 }}>HORA</th>
                        <th className="col-atendente" style={{ textAlign: 'left', padding: '10px 16px', fontSize: 11, fontWeight: 700, color: '#94a3b8', letterSpacing: 1 }}>ATENDENTE</th>
                        <th className="col-liberar" style={{ textAlign: 'center', padding: '10px 16px', fontSize: 11, fontWeight: 700, color: '#94a3b8', letterSpacing: 1 }}>STATUS</th>
                        <th style={{ textAlign: 'right', padding: '10px 20px', fontSize: 11, fontWeight: 700, color: '#94a3b8', letterSpacing: 1 }}>AÇÕES</th>
                      </tr>
                    </thead>
                    <tbody>
                      {itens.map((escala, idx) => (
                        <tr key={escala.id} className="escala-row" style={{ borderBottom: idx < itens.length - 1 ? '1px solid #f1f5f9' : 'none', transition: 'background 0.15s' }}>
                          <td style={{ padding: '12px 20px', fontWeight: 600, color: '#1e293b' }}>{escala.grupo}</td>
                          <td style={{ padding: '12px 16px', color: '#475569' }}>{escala.local_texto}</td>
                          <td className="col-hora" style={{ padding: '12px 16px', color: '#475569' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                              </svg>
                              {escala.hora_inicio}
                            </span>
                          </td>
                          <td className="col-atendente" style={{ padding: '12px 16px' }}>
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
                              <span style={{ color: escala.atendentes ? '#475569' : '#cbd5e1' }}>
                                {escala.atendentes || 'A definir'}
                              </span>
                            )}
                          </td>
                          <td className="col-liberar" style={{ padding: '12px 16px', textAlign: 'center' }}>
                            {podeEditar ? (
                              <button
                                onClick={() => liberarEscala(escala.id, escala.confirmacao_aberta)}
                                disabled={liberando === escala.id}
                                style={{
                                  padding: '4px 12px', borderRadius: 999, border: 'none',
                                  fontSize: 11, fontWeight: 600, cursor: 'pointer',
                                  background: escala.confirmacao_aberta ? '#dcfce7' : '#f1f5f9',
                                  color: escala.confirmacao_aberta ? '#16a34a' : '#64748b',
                                }}
                              >
                                {liberando === escala.id ? '...' : escala.confirmacao_aberta ? '✅ Liberada' : 'Liberar'}
                              </button>
                            ) : (
                              <span style={{
                                fontSize: 11, fontWeight: 600, padding: '4px 12px', borderRadius: 999,
                                background: escala.confirmacao_aberta ? '#dcfce7' : '#f1f5f9',
                                color: escala.confirmacao_aberta ? '#16a34a' : '#64748b',
                              }}>
                                {escala.confirmacao_aberta ? '✅ Liberada' : 'Pendente'}
                              </span>
                            )}
                          </td>
                          <td style={{ padding: '12px 20px' }}>
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
                              {podeExcluir && <BotaoExcluirEscala id={escala.id} />}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}