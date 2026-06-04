'use client'

import { useState, useEffect } from 'react'
import BotaoExcluir from './BotaoExcluir'

export default function ListaMembros({ membros, membroLogado, podeEditar, podeExcluir, podeVerFicha }: {
  membros: any[]
  membroLogado: any
  podeEditar: boolean
  podeExcluir: boolean
  podeVerFicha: boolean
}) {
  const [busca, setBusca] = useState('')
  const [filtroGrupo, setFiltroGrupo] = useState('')
  const [filtroPerfil, setFiltroPerfil] = useState('')
  const [filtroInstrumento, setFiltroInstrumento] = useState('')
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' && window.innerWidth < 768)
  const [idsComNotificacao, setIdsComNotificacao] = useState<Set<string>>(new Set())

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  useEffect(() => {
    fetch('/api/push/status-todos')
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) setIdsComNotificacao(new Set(data))
      })
  }, [])

  const grupos = [...new Set(membros.map(m => m.grupo).filter(Boolean))].sort((a, b) => {
    const numA = parseInt(a.replace(/\D/g, '')) || 0
    const numB = parseInt(b.replace(/\D/g, '')) || 0
    return numA - numB
  })

  const perfis = [...new Set(membros.map(m => m.perfil).filter(Boolean))].sort()

  const instrumentos = [...new Set(membros
    .map(m => m.instrumento)
    .filter(i => i && i !== 'Nenhum')
  )].sort()

  const filtrados = membros.filter(m => {
    const nomeOk = m.nome?.toLowerCase().includes(busca.toLowerCase())
    const grupoOk = filtroGrupo === '' || m.grupo === filtroGrupo
    const perfilOk = filtroPerfil === '' || m.perfil === filtroPerfil
    const instrOk = filtroInstrumento === '' || m.instrumento === filtroInstrumento
    return nomeOk && grupoOk && perfilOk && instrOk
  }).sort((a, b) => a.nome?.localeCompare(b.nome, 'pt-BR'))

  const limparFiltros = () => {
    setBusca('')
    setFiltroGrupo('')
    setFiltroPerfil('')
    setFiltroInstrumento('')
  }

  const temFiltro = busca || filtroGrupo || filtroPerfil || filtroInstrumento

  const selectStyle: React.CSSProperties = {
    appearance: 'none', WebkitAppearance: 'none',
    padding: '9px 36px 9px 14px', borderRadius: 8,
    border: '1px solid #e2e8f0', background: '#f8fafc',
    fontSize: 13, fontWeight: 500,
    color: '#64748b',
    cursor: 'pointer', outline: 'none', width: '100%',
  }

  const BadgeNotificacao = ({ membroId }: { membroId: string }) => {
    const tem = idsComNotificacao.has(membroId)
    return (
      <span style={{
        fontSize: 10, fontWeight: 600, padding: '1px 6px', borderRadius: 999,
        background: tem ? '#eff6ff' : '#f1f5f9',
        color: tem ? '#2563eb' : '#94a3b8',
      }}>
        {tem ? '🔔' : '🔕'}
      </span>
    )
  }

  return (
    <div style={{ background: '#f1f5f9', minHeight: '100vh', padding: isMobile ? '16px' : '28px 40px' }}>
      <style>{`.membro-row:hover { background: #f8fafc; }`}</style>

      <div style={{ maxWidth: 1280, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ marginBottom: 20 }}>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: '#1e293b', margin: 0 }}>Membros</h1>
          <p style={{ fontSize: 13, color: '#64748b', marginTop: 4, marginBottom: 0 }}>
            {filtrados.length} de {membros.length} membros
          </p>
        </div>

        {/* Filtros */}
        <div style={{
          background: '#fff', border: '1px solid #e2e8f0',
          borderRadius: 12, padding: '16px', marginBottom: 12,
          boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: 12 }}>
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#94a3b8', letterSpacing: 1, marginBottom: 5 }}>GRUPO</label>
              <div style={{ position: 'relative' }}>
                <select value={filtroGrupo} onChange={e => setFiltroGrupo(e.target.value)} style={selectStyle}>
                  <option value="">Todos os Grupos</option>
                  {grupos.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
                <svg style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
                  width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="6 9 12 15 18 9"/>
                </svg>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#94a3b8', letterSpacing: 1, marginBottom: 5 }}>PERFIL</label>
              <div style={{ position: 'relative' }}>
                <select value={filtroPerfil} onChange={e => setFiltroPerfil(e.target.value)} style={selectStyle}>
                  <option value="">Todos os Perfis</option>
                  {perfis.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
                <svg style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
                  width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="6 9 12 15 18 9"/>
                </svg>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#94a3b8', letterSpacing: 1, marginBottom: 5 }}>INSTRUMENTO</label>
              <div style={{ position: 'relative' }}>
                <select value={filtroInstrumento} onChange={e => setFiltroInstrumento(e.target.value)} style={selectStyle}>
                  <option value="">Todos os Instrumentos</option>
                  {instrumentos.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
                <svg style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
                  width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="6 9 12 15 18 9"/>
                </svg>
              </div>
            </div>
          </div>

          {temFiltro && (
            <button onClick={limparFiltros} style={{
              marginTop: 12, padding: '7px 14px', borderRadius: 8,
              border: '1px solid #e2e8f0', background: 'transparent',
              fontSize: 12, fontWeight: 600, color: '#64748b',
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
            }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
              Limpar filtros
            </button>
          )}
        </div>

        {/* Busca */}
        <div style={{
          background: '#fff', border: '1px solid #e2e8f0',
          borderRadius: 12, padding: '11px 16px', marginBottom: 12,
          boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            type="text" placeholder="Buscar por nome..."
            value={busca} onChange={e => setBusca(e.target.value)}
            style={{ border: 'none', outline: 'none', fontSize: 14, color: '#334155', width: '100%', background: 'transparent' }}
          />
          {busca && (
            <button onClick={() => setBusca('')} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#94a3b8', padding: 0 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          )}
        </div>

        {/* Lista */}
        <div style={{
          background: '#fff', border: '1px solid #e2e8f0',
          borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
          overflow: 'hidden',
        }}>
          {!isMobile && (
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 180px 180px 160px 130px',
              padding: '10px 20px',
              borderBottom: '1px solid #f1f5f9',
              background: '#f8fafc',
            }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', letterSpacing: 1 }}>MEMBRO</span>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', letterSpacing: 1 }}>INSTRUMENTO</span>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', letterSpacing: 1 }}>GRUPO</span>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', letterSpacing: 1 }}>PERFIL</span>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', letterSpacing: 1, textAlign: 'right' }}>AÇÕES</span>
            </div>
          )}

          {filtrados.length === 0 ? (
            <div style={{ padding: '40px 20px', textAlign: 'center', color: '#94a3b8', fontSize: 14 }}>
              Nenhum membro encontrado
            </div>
          ) : filtrados.map((membro, index) => (
            <div key={membro.id} className="membro-row" style={{
              padding: isMobile ? '12px 16px' : '14px 20px',
              borderBottom: index < filtrados.length - 1 ? '1px solid #f1f5f9' : 'none',
              transition: 'background 0.15s',
              ...(isMobile ? {} : {
                display: 'grid',
                gridTemplateColumns: '1fr 180px 180px 160px 130px',
                alignItems: 'center',
              }),
            }}>
              {isMobile ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: '50%', flexShrink: 0,
                    background: membro.grupo ? '#1e3a5f' : '#94a3b8',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#fff', fontWeight: 700, fontSize: 16,
                  }}>
                    {membro.nome?.charAt(0).toUpperCase()}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontWeight: 700, color: '#0f172a', fontSize: 13, margin: '0 0 2px', textTransform: 'uppercase', letterSpacing: 0.4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {membro.nome}
                    </p>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
                      <span style={{
                        fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 999,
                        background: membro.status === 'Ativo' ? '#dcfce7' : '#f1f5f9',
                        color: membro.status === 'Ativo' ? '#16a34a' : '#64748b',
                      }}>
                        {membro.status || 'Pendente'}
                      </span>
                      <BadgeNotificacao membroId={membro.id} />
                      {membro.grupo && <span style={{ fontSize: 11, color: '#64748b', fontWeight: 500 }}>{membro.grupo}</span>}
                      {membro.perfil && <span style={{ fontSize: 11, color: '#94a3b8' }}>{membro.perfil}</span>}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                    <a href={`/dashboard/membros/${membro.id}/estatisticas`} title="Estatísticas"
                      style={{ width: 30, height: 30, borderRadius: 7, background: '#f5f3ff', display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none' }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>
                      </svg>
                    </a>
                    {podeVerFicha && membro.cadastro_completo && (
                      <a href={`/ficha/${membro.id}`} title="Ficha SIGA" target="_blank"
                        style={{ width: 30, height: 30, borderRadius: 7, background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none' }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
                          <polyline points="14 2 14 8 20 8"/>
                        </svg>
                      </a>
                    )}
                    {podeEditar && (
                      <a href={`/dashboard/membros/${membro.id}/editar`} title="Editar"
                        style={{ width: 30, height: 30, borderRadius: 7, background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none' }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                          <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                        </svg>
                      </a>
                    )}
                    {podeExcluir && (
                      <BotaoExcluir id={membro.id} nome={membro.nome} usuarioNome={membroLogado?.nome} />
                    )}
                  </div>
                </div>
              ) : (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{
                      width: 38, height: 38, borderRadius: '50%',
                      background: membro.grupo ? '#1e3a5f' : '#94a3b8',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: '#fff', fontWeight: 700, fontSize: 15, flexShrink: 0,
                    }}>
                      {membro.nome?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p style={{ fontWeight: 700, color: '#0f172a', fontSize: 14, margin: '0 0 3px', textTransform: 'uppercase', letterSpacing: 0.4 }}>
                        {membro.nome}
                      </p>
                      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                        <span style={{
                          fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 999,
                          background: membro.status === 'Ativo' ? '#dcfce7' : '#f1f5f9',
                          color: membro.status === 'Ativo' ? '#16a34a' : '#64748b',
                        }}>
                          {membro.status || 'Pendente'}
                        </span>
                        <BadgeNotificacao membroId={membro.id} />
                      </div>
                    </div>
                  </div>

                  <span style={{ fontSize: 13, color: '#475569' }}>
                    {membro.instrumento && membro.instrumento !== 'Nenhum' ? membro.instrumento : <span style={{ color: '#cbd5e1' }}>—</span>}
                  </span>

                  <span style={{ fontSize: 13, color: '#475569' }}>
                    {membro.grupo ? (
                      <span style={{ background: '#f1f5f9', color: '#475569', padding: '3px 10px', borderRadius: 6, fontSize: 12, fontWeight: 600 }}>
                        {membro.grupo}
                      </span>
                    ) : <span style={{ color: '#cbd5e1' }}>—</span>}
                  </span>

                  <span style={{ fontSize: 13, color: '#475569' }}>
                    {membro.perfil || <span style={{ color: '#cbd5e1' }}>—</span>}
                  </span>

                  <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                    <a href={`/dashboard/membros/${membro.id}/estatisticas`} title="Estatísticas"
                      style={{ width: 30, height: 30, borderRadius: 7, background: '#f5f3ff', display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none' }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>
                      </svg>
                    </a>
                    {podeVerFicha && membro.cadastro_completo && (
                      <a href={`/ficha/${membro.id}`} title="Ficha SIGA" target="_blank"
                        style={{ width: 30, height: 30, borderRadius: 7, background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none' }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
                          <polyline points="14 2 14 8 20 8"/>
                          <line x1="16" y1="13" x2="8" y2="13"/>
                          <line x1="16" y1="17" x2="8" y2="17"/>
                          <polyline points="10 9 9 9 8 9"/>
                        </svg>
                      </a>
                    )}
                    {podeEditar && (
                      <a href={`/dashboard/membros/${membro.id}/editar`} title="Editar"
                        style={{ width: 30, height: 30, borderRadius: 7, background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none' }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                          <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                        </svg>
                      </a>
                    )}
                    {podeExcluir && (
                      <BotaoExcluir id={membro.id} nome={membro.nome} usuarioNome={membroLogado?.nome} />
                    )}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}