'use client'

import { useState } from 'react'

const normalizeId = (v: string | number | null | undefined) =>
  v == null ? '' : String(v).trim()

export default function CardConfirmacao({ escala, confirmacoesIniciais, membroLogado, totalGrupo, membrosDoGrupo, todosMembros, isAdmin, onAtualizar }: any) {
  const [confirmacoes, setConfirmacoes] = useState(confirmacoesIniciais)
  const [loading, setLoading] = useState(false)
  const [motivo, setMotivo] = useState('')
  const [mostraMotivo, setMostraMotivo] = useState(false)
  const [erro, setErro] = useState('')
  const [mostraDetalhes, setMostraDetalhes] = useState(false)

  const confirmados = confirmacoes.filter((c: any) => c.status === 'confirmado')
  const ausentes = confirmacoes.filter((c: any) => c.status === 'ausente')
  const dispensados = confirmacoes.filter((c: any) => c.status === 'dispensado')
  const avulsos = confirmacoes.filter((c: any) => c.tipo === 'avulso' && c.status === 'confirmado')
  const minhaConfirmacao = confirmacoes.find((c: any) => c.membro_id === membroLogado?.id)
  const euSouDoGrupo = membroLogado?.grupo === escala.grupo
  const statusAtual = minhaConfirmacao?.status || null
  const souAvulso = !euSouDoGrupo && minhaConfirmacao?.tipo === 'avulso'

  const atendenteMembro = todosMembros?.find((m: any) => m.nome === escala.atendentes)
  const euSouOAtendente = membroLogado?.nome === escala.atendentes
  const confirmacaoAtendente = atendenteMembro ? confirmacoes.find((c: any) => c.membro_id === atendenteMembro.id) : null
  const statusAtendente = confirmacaoAtendente?.status || null

  const formatarData = (data: string) => {
    return new Date(data + 'T12:00:00').toLocaleDateString('pt-BR', {
      weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric'
    })
  }

  const getMembro = (membro_id: string | number) =>
    todosMembros?.find((m: any) => normalizeId(m.id) === normalizeId(membro_id))

  const cancelarConfirmacao = async (membro_id?: string) => {
    setLoading(true)
    const id = membro_id || membroLogado?.id
    const res = await fetch('/api/confirmacoes', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ escala_id: escala.id, membro_id: id }),
    })
    if (res.ok) {
      setConfirmacoes((prev: any[]) => prev.filter((c: any) => c.membro_id !== id))
      onAtualizar()
    }
    setLoading(false)
  }

  const dispensar = async (membro_id: string, statusAnterior: string) => {
    const confirmado = confirm('Deseja dispensar este membro por excesso?')
    if (!confirmado) return
    const res = await fetch('/api/confirmacoes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ escala_id: escala.id, membro_id, status: 'dispensado', status_anterior: statusAnterior, tipo: 'normal' }),
    })
    if (res.ok) {
      setConfirmacoes((prev: any[]) => {
        const semMembro = prev.filter((c: any) => c.membro_id !== membro_id)
        return [...semMembro, { id: Date.now(), escala_id: escala.id, membro_id, status: 'dispensado', status_anterior: statusAnterior, tipo: 'normal' }]
      })
      onAtualizar()
    }
  }

  const desfazerDispensa = async (membro_id: string, statusAnterior: string | null) => {
    const novoStatus = statusAnterior || 'pendente'
    if (novoStatus === 'pendente') {
      const res = await fetch('/api/confirmacoes', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ escala_id: escala.id, membro_id }),
      })
      if (res.ok) {
        setConfirmacoes((prev: any[]) => prev.filter((c: any) => c.membro_id !== membro_id))
        onAtualizar()
      }
    } else {
      const res = await fetch('/api/confirmacoes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ escala_id: escala.id, membro_id, status: novoStatus, tipo: 'normal' }),
      })
      if (res.ok) {
        setConfirmacoes((prev: any[]) => {
          const semMembro = prev.filter((c: any) => c.membro_id !== membro_id)
          return [...semMembro, { id: Date.now(), escala_id: escala.id, membro_id, status: novoStatus, tipo: 'normal' }]
        })
        onAtualizar()
      }
    }
  }

  const confirmar = async (status: string, membro_id?: string) => {
    if (status === 'ausente' && !mostraMotivo && !membro_id) {
      setMostraMotivo(true)
      return
    }
    setLoading(true)
    setErro('')
    const id = membro_id || membroLogado?.id
    const res = await fetch('/api/confirmacoes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ escala_id: escala.id, membro_id: id, status, motivo: status === 'ausente' ? motivo : null }),
    })
    if (res.ok) {
      setConfirmacoes((prev: any[]) => {
        const semMinha = prev.filter((c: any) => c.membro_id !== id)
        return [...semMinha, { id: Date.now(), escala_id: escala.id, membro_id: id, status, tipo: 'normal', membros: { nome: getMembro(id)?.nome || membroLogado?.nome } }]
      })
      setMostraMotivo(false)
      setMotivo('')
      onAtualizar()
    } else {
      const data = await res.json()
      setErro(data.error || 'Erro ao confirmar')
    }
    setLoading(false)
  }

  const badgeStatus = (status: string) => {
    const config: Record<string, { bg: string, color: string, label: string }> = {
      confirmado: { bg: '#dcfce7', color: '#16a34a', label: '✅ Confirmado' },
      ausente: { bg: '#fee2e2', color: '#dc2626', label: '❌ Ausente' },
      dispensado: { bg: '#f1f5f9', color: '#64748b', label: '🔕 Dispensado' },
      pendente: { bg: '#fef9c3', color: '#854d0e', label: '⏳ Pendente' },
    }
    const c = config[status] || config.pendente
    return (
      <span style={{
        fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 999,
        background: c.bg, color: c.color,
      }}>{c.label}</span>
    )
  }

  return (
    <div style={{
      background: '#fff', borderRadius: 12,
      border: '1px solid #e2e8f0',
      boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
      overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{ background: '#1e3a5f', padding: '16px 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h3 style={{ color: '#fff', fontWeight: 800, fontSize: 16, margin: 0 }}>{escala.grupo}</h3>
            <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 13, margin: '4px 0 0' }}>
              {formatarData(escala.data)} · {escala.hora_inicio} · {escala.local_texto}
            </p>
          </div>
          
        </div>
      </div>

      <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* Barra de progresso */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ fontSize: 12, color: '#64748b' }}>{confirmados.length} de {totalGrupo} confirmados</span>
            <span style={{ fontSize: 12, fontWeight: 600, color: '#1e3a5f' }}>
              {totalGrupo > 0 ? Math.round((confirmados.length / totalGrupo) * 100) : 0}%
            </span>
          </div>
          <div style={{ background: '#f1f5f9', borderRadius: 999, height: 8 }}>
            <div style={{
              background: '#16a34a', height: 8, borderRadius: 999,
              width: `${totalGrupo > 0 ? (confirmados.length / totalGrupo) * 100 : 0}%`,
              transition: 'width 0.3s',
            }} />
          </div>
        </div>

        {/* Atendente */}
        {escala.atendentes && (
          <div style={{ background: '#eff6ff', borderRadius: 10, padding: '12px 16px' }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: '#2563eb', letterSpacing: 1, marginBottom: 8 }}>🎙️ ATENDENTE</p>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <p style={{ fontSize: 14, fontWeight: 600, color: '#1e293b', margin: 0 }}>{escala.atendentes}</p>
              {badgeStatus(statusAtendente || 'pendente')}
            </div>

            {euSouOAtendente && (
              <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid #bfdbfe' }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: '#1e293b', marginBottom: 8 }}>Podemos contar com você?</p>
                {statusAtendente === 'confirmado' && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 13, color: '#16a34a', fontWeight: 600 }}>✅ Você confirmou presença</span>
                    <button onClick={() => cancelarConfirmacao(atendenteMembro?.id)} disabled={loading}
                      style={{ fontSize: 11, color: '#94a3b8', background: 'none', border: 'none', cursor: 'pointer' }}>
                      {loading ? 'Aguarde...' : 'Cancelar'}
                    </button>
                  </div>
                )}
                {statusAtendente === 'ausente' && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 13, color: '#dc2626', fontWeight: 600 }}>❌ Você informou ausência</span>
                    <button onClick={() => cancelarConfirmacao(atendenteMembro?.id)} disabled={loading}
                      style={{ fontSize: 11, color: '#94a3b8', background: 'none', border: 'none', cursor: 'pointer' }}>
                      {loading ? 'Aguarde...' : 'Cancelar'}
                    </button>
                  </div>
                )}
                {statusAtendente === 'dispensado' && (
                  <span style={{ fontSize: 13, color: '#64748b', fontWeight: 600 }}>🔕 Você foi dispensado</span>
                )}
                {!statusAtendente && (
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => confirmar('confirmado', atendenteMembro?.id)} disabled={loading} style={{
                      padding: '8px 16px', borderRadius: 8, border: 'none',
                      background: '#16a34a', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer',
                    }}>
                      {loading ? 'Salvando...' : '✅ Confirmar presença'}
                    </button>
                    <button onClick={() => confirmar('ausente', atendenteMembro?.id)} disabled={loading} style={{
                      padding: '8px 16px', borderRadius: 8, border: 'none',
                      background: '#fee2e2', color: '#dc2626', fontSize: 13, fontWeight: 600, cursor: 'pointer',
                    }}>
                      ❌ Não poderei
                    </button>
                  </div>
                )}
              </div>
            )}

            {isAdmin && atendenteMembro && statusAtendente && statusAtendente !== 'dispensado' && (
              <button onClick={() => dispensar(atendenteMembro.id, statusAtendente)}
                style={{ fontSize: 11, color: '#94a3b8', background: 'none', border: 'none', cursor: 'pointer', marginTop: 8 }}>
                Dispensar atendente
              </button>
            )}
            {isAdmin && atendenteMembro && statusAtendente === 'dispensado' && (
              <button onClick={() => desfazerDispensa(atendenteMembro.id, confirmacaoAtendente?.status_anterior)}
                style={{ fontSize: 11, color: '#94a3b8', background: 'none', border: 'none', cursor: 'pointer', marginTop: 8 }}>
                Desfazer dispensa
              </button>
            )}
          </div>
        )}

        {/* Ver detalhes — disponível para todos */}
        <div>
          <button onClick={() => setMostraDetalhes(!mostraDetalhes)} style={{
            fontSize: 12, fontWeight: 600, color: '#2563eb',
            background: 'none', border: 'none', cursor: 'pointer', padding: 0,
            display: 'flex', alignItems: 'center', gap: 4,
          }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              {mostraDetalhes ? <polyline points="18 15 12 9 6 15"/> : <polyline points="6 9 12 15 18 9"/>}
            </svg>
            {mostraDetalhes ? 'Ocultar detalhes' : 'Ver detalhes'}
          </button>

          {mostraDetalhes && (
            <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
              {membrosDoGrupo.map((membro: any) => {
                const confirmacao = confirmacoes.find((c: any) => c.membro_id === membro.id)
                const status = confirmacao?.status || 'pendente'
                const statusAnterior = confirmacao?.status_anterior || 'pendente'
                return (
                  <div key={membro.id} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    background: '#f8fafc', borderRadius: 8, padding: '10px 14px',
                  }}>
                    <div>
                      <p style={{ fontSize: 13, fontWeight: 600, color: '#1e293b', margin: 0 }}>{membro.nome}</p>
                      <p style={{ fontSize: 11, color: '#94a3b8', margin: 0 }}>{membro.instrumento || membro.perfil || membro.tipo}</p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      {badgeStatus(status)}
                      {isAdmin && (status === 'confirmado' || status === 'pendente') && (
                        <button onClick={() => dispensar(membro.id, status)}
                          style={{ fontSize: 11, color: '#94a3b8', background: 'none', border: 'none', cursor: 'pointer' }}>
                          Dispensar
                        </button>
                      )}
                      {isAdmin && status === 'dispensado' && (
                        <button onClick={() => desfazerDispensa(membro.id, statusAnterior)}
                          style={{ fontSize: 11, color: '#94a3b8', background: 'none', border: 'none', cursor: 'pointer' }}>
                          Desfazer
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}

              {avulsos.length > 0 && (
                <div style={{ marginTop: 8 }}>
                  <p style={{ fontSize: 11, fontWeight: 700, color: '#2563eb', letterSpacing: 1, marginBottom: 6 }}>🔄 AVULSOS</p>
                  {avulsos.map((c: any) => {
                    const membroAvulso = getMembro(c.membro_id)
                    return (
                      <div key={c.id} style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        background: '#eff6ff', borderRadius: 8, padding: '10px 14px', marginBottom: 6,
                      }}>
                        <div>
                          <p style={{ fontSize: 13, fontWeight: 600, color: '#1e293b', margin: 0 }}>{membroAvulso?.nome || '—'}</p>
                          <p style={{ fontSize: 11, color: '#94a3b8', margin: 0 }}>{membroAvulso?.grupo || '—'}</p>
                          {membroAvulso?.telefone && <p style={{ fontSize: 11, color: '#2563eb', margin: 0 }}>📱 {membroAvulso.telefone}</p>}
                        </div>
                        <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 999, background: '#dbeafe', color: '#1d4ed8' }}>✅ Avulso</span>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Confirmados */}
        {confirmados.length > 0 && (
          <div>
            <p style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', letterSpacing: 1, marginBottom: 8 }}>✅ CONFIRMADOS ({confirmados.length})</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {confirmados.map((c: any) => {
                const membroAvulso = c.tipo === 'avulso' ? getMembro(c.membro_id) : null
                return (
                  <span key={c.id} style={{ fontSize: 12, background: '#dcfce7', color: '#16a34a', padding: '3px 10px', borderRadius: 999, fontWeight: 600 }}>
                    {c.tipo === 'avulso' ? `${membroAvulso?.nome || '—'} (avulso)` : c.membros?.nome}
                  </span>
                )
              })}
            </div>
          </div>
        )}

        {/* Dispensados */}
        {dispensados.length > 0 && (
          <div>
            <p style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', letterSpacing: 1, marginBottom: 8 }}>🔕 DISPENSADOS ({dispensados.length})</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {dispensados.map((c: any) => {
                const m = getMembro(c.membro_id)
                return (
                  <span key={c.id} style={{ fontSize: 12, background: '#f1f5f9', color: '#64748b', padding: '3px 10px', borderRadius: 999, fontWeight: 600 }}>
                    {m?.nome || c.membros?.nome || '—'}
                  </span>
                )
              })}
            </div>
          </div>
        )}

        {/* Vagas abertas */}
        {ausentes.filter((a: any) => !a.substituto_id).length > 0 && (
          <div>
            <p style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', letterSpacing: 1, marginBottom: 8 }}>
              ⚠️ VAGAS ABERTAS ({ausentes.filter((a: any) => !a.substituto_id).length})
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {ausentes.filter((a: any) => !a.substituto_id).map((a: any, i: number) => {
                const membroAusente = getMembro(a.membro_id)
                const perfil = (membroAusente?.perfil ?? membroAusente?.tipo ?? '').toString().trim()
                const instrumento = (membroAusente?.instrumento ?? '').toString().trim()
                const tipoVaga = perfil === 'Atendente'
                  ? 'Atendente'
                  : instrumento && instrumento !== 'Nenhum'
                    ? instrumento
                    : perfil || '—'
                return (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    background: '#fef9c3', borderRadius: 8, padding: '10px 14px',
                  }}>
                    <div>
                      <p style={{ fontSize: 13, fontWeight: 600, color: '#1e293b', margin: 0 }}>{tipoVaga}</p>
                      <p style={{ fontSize: 11, color: '#64748b', margin: 0 }}>Ausência de: {membroAusente?.nome || '—'}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Confirmação avulso */}
        {souAvulso && (
          <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 13, color: '#2563eb', fontWeight: 600 }}>✅ Você confirmou presença como avulso</span>
              <button onClick={() => cancelarConfirmacao()} disabled={loading}
                style={{ fontSize: 11, color: '#94a3b8', background: 'none', border: 'none', cursor: 'pointer' }}>
                {loading ? 'Aguarde...' : 'Cancelar'}
              </button>
            </div>
          </div>
        )}

        {/* Ação do membro do grupo */}
        {euSouDoGrupo && (
          <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: 16 }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: '#1e293b', marginBottom: 12 }}>Podemos contar com você?</p>
            {erro && <p style={{ fontSize: 12, color: '#dc2626', marginBottom: 8 }}>{erro}</p>}

            {statusAtual === 'confirmado' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 13, color: '#16a34a', fontWeight: 600 }}>✅ Você confirmou presença</span>
                <button onClick={() => cancelarConfirmacao()} disabled={loading}
                  style={{ fontSize: 11, color: '#94a3b8', background: 'none', border: 'none', cursor: 'pointer' }}>
                  {loading ? 'Aguarde...' : 'Cancelar'}
                </button>
              </div>
            )}

            {statusAtual === 'ausente' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 13, color: '#dc2626', fontWeight: 600 }}>❌ Você informou ausência</span>
                <button onClick={() => cancelarConfirmacao()} disabled={loading}
                  style={{ fontSize: 11, color: '#94a3b8', background: 'none', border: 'none', cursor: 'pointer' }}>
                  {loading ? 'Aguarde...' : 'Cancelar'}
                </button>
              </div>
            )}

            {statusAtual === 'dispensado' && (
              <span style={{ fontSize: 13, color: '#64748b', fontWeight: 600 }}>🔕 Você foi dispensado por excesso</span>
            )}

            {!statusAtual && (
              mostraMotivo ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <input
                    type="text" value={motivo} onChange={e => setMotivo(e.target.value)}
                    placeholder="Motivo da ausência (opcional)"
                    style={{
                      border: '1px solid #e2e8f0', borderRadius: 8, padding: '10px 14px',
                      fontSize: 13, outline: 'none', color: '#1e293b', background: '#f8fafc',
                    }}
                  />
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => confirmar('ausente')} disabled={loading} style={{
                      padding: '8px 16px', borderRadius: 8, border: 'none',
                      background: '#dc2626', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer',
                    }}>
                      {loading ? 'Salvando...' : 'Confirmar ausência'}
                    </button>
                    <button onClick={() => setMostraMotivo(false)} style={{
                      padding: '8px 16px', borderRadius: 8, border: 'none',
                      background: '#f1f5f9', color: '#475569', fontSize: 13, fontWeight: 600, cursor: 'pointer',
                    }}>
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <button onClick={() => confirmar('confirmado')} disabled={loading} style={{
                    padding: '8px 16px', borderRadius: 8, border: 'none',
                    background: '#16a34a', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer',
                  }}>
                    {loading ? 'Salvando...' : '✅ Confirmar presença'}
                  </button>
                  <button onClick={() => confirmar('ausente')} disabled={loading} style={{
                    padding: '8px 16px', borderRadius: 8, border: 'none',
                    background: '#fee2e2', color: '#dc2626', fontSize: 13, fontWeight: 600, cursor: 'pointer',
                  }}>
                    ❌ Não poderei estar presente
                  </button>
                </div>
              )
            )}
          </div>
        )}

      </div>
    </div>
  )
}