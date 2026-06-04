'use client'

import { useState, useEffect } from 'react'

type MembroFicha = {
  id: string
  nome: string
  grupo: string
  situacao: 'completo' | 'no_prazo' | 'vencido'
  diasRestantes: number | null
  acesso_bloqueado: boolean
  temNotificacao: boolean
}

export default function CardStatusFichas() {
  const [membros, setMembros] = useState<MembroFicha[]>([])
  const [loading, setLoading] = useState(true)
  const [aberto, setAberto] = useState(false)
  const [filtroCat, setFiltroCat] = useState<'todos' | 'completo' | 'no_prazo' | 'vencido'>('vencido')
  const [processando, setProcessando] = useState<string | null>(null)
  const [notificado, setNotificado] = useState<string | null>(null)

  const carregar = () => {
    setLoading(true)
    fetch('/api/fichas').then(r => r.json()).then(data => {
      if (Array.isArray(data)) setMembros(data)
      setLoading(false)
    })
  }

  useEffect(() => { carregar() }, [])

  const completos = membros.filter(m => m.situacao === 'completo')
  const noPrazo = membros.filter(m => m.situacao === 'no_prazo')
  const vencidos = membros.filter(m => m.situacao === 'vencido')

  const filtrados = filtroCat === 'todos' ? membros
    : membros.filter(m => m.situacao === filtroCat)

  const acao = async (membro_id: string, tipo: 'bloquear' | 'desbloquear' | 'notificar') => {
    setProcessando(membro_id + tipo)
    const res = await fetch('/api/fichas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ acao: tipo, membro_id }),
    })
    if (tipo === 'notificar') {
      if (res.ok) {
        setNotificado(membro_id)
        setTimeout(() => setNotificado(null), 3000)
      } else {
        alert('Erro ao enviar notificação.')
      }
    } else {
      carregar()
    }
    setProcessando(null)
  }

  return (
    <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', marginBottom: 12, overflow: 'hidden' }}>

      {/* Header clicável */}
      <button onClick={() => setAberto(!aberto)} style={{
        width: '100%', padding: '16px 20px', background: 'none', border: 'none',
        cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: '#1e293b', margin: 0, fontFamily: "'Inter', sans-serif" }}>
            📋 Status das Fichas de Cadastro
          </h3>
          <div style={{ display: 'flex', gap: 6 }}>
            <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 999, background: '#dcfce7', color: '#16a34a' }}>
              {completos.length} completos
            </span>
            <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 999, background: '#fef9c3', color: '#854d0e' }}>
              {noPrazo.length} no prazo
            </span>
            <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 999, background: '#fee2e2', color: '#dc2626' }}>
              {vencidos.length} vencidos
            </span>
          </div>
        </div>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
          style={{ transition: 'transform 0.2s', transform: aberto ? 'rotate(180deg)' : 'rotate(0deg)', flexShrink: 0 }}>
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </button>

      {aberto && (
        <div style={{ borderTop: '1px solid #f1f5f9', padding: '16px 20px' }}>

          {/* Filtros */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
            {[
              { value: 'vencido', label: 'Vencidos', bg: '#fee2e2', cor: '#dc2626' },
              { value: 'no_prazo', label: 'No prazo', bg: '#fef9c3', cor: '#854d0e' },
              { value: 'completo', label: 'Completos', bg: '#dcfce7', cor: '#16a34a' },
              { value: 'todos', label: 'Todos', bg: '#f1f5f9', cor: '#475569' },
            ].map(f => (
              <button key={f.value} onClick={() => setFiltroCat(f.value as any)} style={{
                padding: '5px 12px', borderRadius: 8, border: 'none', cursor: 'pointer',
                fontSize: 12, fontWeight: 600,
                background: filtroCat === f.value ? f.bg : '#f8fafc',
                color: filtroCat === f.value ? f.cor : '#94a3b8',
                outline: filtroCat === f.value ? `1.5px solid ${f.cor}` : 'none',
              }}>
                {f.label}
              </button>
            ))}
          </div>

          {loading ? (
            <p style={{ fontSize: 13, color: '#94a3b8' }}>Carregando...</p>
          ) : filtrados.length === 0 ? (
            <p style={{ fontSize: 13, color: '#94a3b8' }}>Nenhum membro nesta categoria.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {filtrados.map(m => (
                <div key={m.id} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '10px 14px', borderRadius: 10, gap: 12, flexWrap: 'wrap',
                  background: m.situacao === 'vencido' ? '#fff5f5' : m.situacao === 'no_prazo' ? '#fffbeb' : '#f0fdf4',
                  border: `1px solid ${m.situacao === 'vencido' ? '#fecaca' : m.situacao === 'no_prazo' ? '#fde68a' : '#bbf7d0'}`,
                }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 13, fontWeight: 700, color: '#1e293b', margin: '0 0 2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.nome}</p>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 11, color: '#64748b' }}>{m.grupo || '—'}</span>
                      {m.situacao === 'no_prazo' && (
                        <span style={{ fontSize: 11, fontWeight: 600, color: '#854d0e' }}>
                          ⏳ {m.diasRestantes} dia{m.diasRestantes !== 1 ? 's' : ''} restante{m.diasRestantes !== 1 ? 's' : ''}
                        </span>
                      )}
                      {m.situacao === 'vencido' && (
                        <span style={{ fontSize: 11, fontWeight: 600, color: '#dc2626' }}>❌ Prazo vencido</span>
                      )}
                      {m.situacao === 'completo' && (
                        <span style={{ fontSize: 11, fontWeight: 600, color: '#16a34a' }}>✅ Cadastro completo</span>
                      )}
                      {m.acesso_bloqueado && (
                        <span style={{ fontSize: 11, fontWeight: 600, color: '#7c3aed', background: '#f5f3ff', padding: '1px 6px', borderRadius: 999 }}>🔒 Bloqueado</span>
                      )}
                      {!m.temNotificacao && m.situacao !== 'completo' && (
                        <span style={{ fontSize: 11, color: '#94a3b8' }}>🔕 Sem notificação</span>
                      )}
                    </div>
                  </div>

                  {/* Ações só para vencidos */}
                  {m.situacao === 'vencido' && (
                    <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                      {m.temNotificacao ? (
                        <button
                          onClick={() => acao(m.id, 'notificar')}
                          disabled={processando === m.id + 'notificar' || notificado === m.id}
                          title="Enviar notificação"
                          style={{
                            padding: '5px 10px', borderRadius: 7, border: '1px solid #e2e8f0',
                            background: notificado === m.id ? '#dcfce7' : '#fff',
                            cursor: processando === m.id + 'notificar' ? 'not-allowed' : 'pointer',
                            fontSize: 11, fontWeight: 600,
                            color: notificado === m.id ? '#16a34a' : '#2563eb',
                          }}
                        >
                          {processando === m.id + 'notificar' ? '...' : notificado === m.id ? '✅ Enviado!' : '🔔 Notificar'}
                        </button>
                      ) : (
                        <span style={{ fontSize: 11, color: '#94a3b8', padding: '5px 10px', borderRadius: 7, background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                          🔕 Sem notificação
                        </span>
                      )}
                      {m.acesso_bloqueado ? (
                        <button
                          onClick={() => acao(m.id, 'desbloquear')}
                          disabled={processando === m.id + 'desbloquear'}
                          style={{ padding: '5px 10px', borderRadius: 7, border: '1px solid #bbf7d0', background: '#f0fdf4', cursor: 'pointer', fontSize: 11, fontWeight: 600, color: '#16a34a' }}
                        >
                          {processando === m.id + 'desbloquear' ? '...' : '🔓 Desbloquear'}
                        </button>
                      ) : (
                        <button
                          onClick={() => acao(m.id, 'bloquear')}
                          disabled={processando === m.id + 'bloquear'}
                          style={{ padding: '5px 10px', borderRadius: 7, border: '1px solid #fecaca', background: '#fff5f5', cursor: 'pointer', fontSize: 11, fontWeight: 600, color: '#dc2626' }}
                        >
                          {processando === m.id + 'bloquear' ? '...' : '🔒 Bloquear'}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}