'use client'

import { useState } from 'react'
import BotaoExcluir from './BotaoExcluir'

export default function ListaMembros({ membros, membroLogado, podeEditar, podeExcluir }: {
  membros: any[]
  membroLogado: any
  podeEditar: boolean
  podeExcluir: boolean
}) {
  const [busca, setBusca] = useState('')
  const [filtroGrupo, setFiltroGrupo] = useState('')
  const [filtroPerfil, setFiltroPerfil] = useState('')
  const [filtroInstrumento, setFiltroInstrumento] = useState('')

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
  })

  const limparFiltros = () => {
    setBusca('')
    setFiltroGrupo('')
    setFiltroPerfil('')
    setFiltroInstrumento('')
  }

  const temFiltro = busca || filtroGrupo || filtroPerfil || filtroInstrumento

  const selectStyle = {
    padding: '8px 12px',
    borderRadius: 8,
    border: '1px solid #e2e8f0',
    background: '#fff',
    fontSize: 13,
    color: '#334155',
    cursor: 'pointer',
    outline: 'none',
    minWidth: 160,
  }

  return (
    <div style={{ background: '#f1f5f9', minHeight: '100vh', padding: '32px 40px' }}
      className="membros-wrap">
      <style>{`
        @media (max-width: 768px) {
          .membros-wrap { padding: 16px !important; }
          .filtros-grid { flex-direction: column !important; }
          .tabela-header { display: none !important; }
          .col-instrumento, .col-grupo { display: none !important; }
        }
      `}</style>

      <div style={{ maxWidth: 960, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: '#1e293b', margin: 0 }}>Membros</h1>
          <p style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>
            {filtrados.length} de {membros.length} membros
          </p>
        </div>

        {/* Filtros */}
        <div style={{
          background: '#fff',
          border: '1px solid #e2e8f0',
          borderRadius: 12,
          padding: '16px 20px',
          marginBottom: 16,
          boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
        }}>
          <div className="filtros-grid" style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-end' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <label style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8', letterSpacing: 1 }}>GRUPO</label>
              <select value={filtroGrupo} onChange={e => setFiltroGrupo(e.target.value)} style={selectStyle}>
                <option value="">Todos os Grupos</option>
                {grupos.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <label style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8', letterSpacing: 1 }}>PERFIL</label>
              <select value={filtroPerfil} onChange={e => setFiltroPerfil(e.target.value)} style={selectStyle}>
                <option value="">Todos os Perfis</option>
                {perfis.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <label style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8', letterSpacing: 1 }}>INSTRUMENTO</label>
              <select value={filtroInstrumento} onChange={e => setFiltroInstrumento(e.target.value)} style={selectStyle}>
                <option value="">Todos os Instrumentos</option>
                {instrumentos.map(i => <option key={i} value={i}>{i}</option>)}
              </select>
            </div>

            {temFiltro && (
              <button onClick={limparFiltros} style={{
                padding: '8px 14px',
                borderRadius: 8,
                border: '1px solid #e2e8f0',
                background: 'transparent',
                fontSize: 12,
                fontWeight: 600,
                color: '#64748b',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                marginTop: 20,
              }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
                Limpar filtros
              </button>
            )}
          </div>
        </div>

        {/* Busca */}
        <div style={{
          background: '#fff',
          border: '1px solid #e2e8f0',
          borderRadius: 12,
          padding: '12px 16px',
          marginBottom: 16,
          boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            type="text"
            placeholder="Buscar por nome..."
            value={busca}
            onChange={e => setBusca(e.target.value)}
            style={{
              border: 'none',
              outline: 'none',
              fontSize: 14,
              color: '#334155',
              width: '100%',
              background: 'transparent',
            }}
          />
          {busca && (
            <button onClick={() => setBusca('')} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#94a3b8', padding: 0 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          )}
        </div>

        {/* Tabela */}
        <div style={{
          background: '#fff',
          border: '1px solid #e2e8f0',
          borderRadius: 12,
          boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
          overflow: 'hidden',
        }}>
          {/* Cabeçalho da tabela */}
          <div className="tabela-header" style={{
            display: 'grid',
            gridTemplateColumns: '1fr 160px 160px 120px 100px',
            padding: '10px 20px',
            borderBottom: '1px solid #f1f5f9',
            background: '#f8fafc',
          }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', letterSpacing: 1 }}>MEMBRO</span>
            <span className="col-instrumento" style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', letterSpacing: 1 }}>INSTRUMENTO</span>
            <span className="col-grupo" style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', letterSpacing: 1 }}>GRUPO</span>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', letterSpacing: 1 }}>PERFIL</span>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', letterSpacing: 1, textAlign: 'right' }}>AÇÕES</span>
          </div>

          {/* Linhas */}
          {filtrados.length === 0 ? (
            <div style={{ padding: '40px 20px', textAlign: 'center', color: '#94a3b8', fontSize: 14 }}>
              Nenhum membro encontrado
            </div>
          ) : (
            filtrados.map((membro, index) => (
              <div key={membro.id} style={{
                display: 'grid',
                gridTemplateColumns: '1fr 160px 160px 120px 100px',
                padding: '14px 20px',
                borderBottom: index < filtrados.length - 1 ? '1px solid #f1f5f9' : 'none',
                alignItems: 'center',
                transition: 'background 0.15s',
              }}
                onMouseEnter={e => (e.currentTarget.style.background = '#f8fafc')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                {/* Nome + status */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{
                    width: 36,
                    height: 36,
                    borderRadius: '50%',
                    background: membro.grupo ? '#1e3a5f' : '#94a3b8',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    fontWeight: 700,
                    fontSize: 14,
                    flexShrink: 0,
                  }}>
                    {membro.nome?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p style={{ fontWeight: 600, color: '#1e293b', fontSize: 14, margin: 0 }}>{membro.nome}</p>
                    <span style={{
                      fontSize: 11,
                      fontWeight: 600,
                      padding: '2px 8px',
                      borderRadius: 999,
                      background: membro.status === 'Ativo' ? '#dcfce7' : '#f1f5f9',
                      color: membro.status === 'Ativo' ? '#16a34a' : '#64748b',
                    }}>
                      {membro.status || 'Pendente'}
                    </span>
                  </div>
                </div>

                {/* Instrumento */}
                <span className="col-instrumento" style={{ fontSize: 13, color: '#475569', display: 'flex', alignItems: 'center', gap: 5 }}>
                  {membro.instrumento && membro.instrumento !== 'Nenhum' ? (
                    <>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>
                      </svg>
                      {membro.instrumento}
                    </>
                  ) : '—'}
                </span>

                {/* Grupo */}
                <span className="col-grupo" style={{ fontSize: 13, color: '#475569' }}>
                  {membro.grupo || <span style={{ color: '#cbd5e1' }}>—</span>}
                </span>

                {/* Perfil */}
                <span style={{ fontSize: 13, color: '#475569' }}>
                  {membro.perfil || '—'}
                </span>

                {/* Ações */}
                <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                  <a href={`/dashboard/membros/${membro.id}/estatisticas`}
                    title="Estatísticas"
                    style={{
                      width: 30, height: 30, borderRadius: 7,
                      background: '#f5f3ff',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      textDecoration: 'none',
                    }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="20" x2="18" y2="10"/>
                      <line x1="12" y1="20" x2="12" y2="4"/>
                      <line x1="6" y1="20" x2="6" y2="14"/>
                    </svg>
                  </a>

                  {podeEditar && (
                    <a href={`/dashboard/membros/${membro.id}/editar`}
                      title="Editar"
                      style={{
                        width: 30, height: 30, borderRadius: 7,
                        background: '#eff6ff',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        textDecoration: 'none',
                      }}>
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
            ))
          )}
        </div>

      </div>
    </div>
  )
}