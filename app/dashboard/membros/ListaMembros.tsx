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
  }).sort((a, b) => a.nome?.localeCompare(b.nome, 'pt-BR'))

  const limparFiltros = () => {
    setBusca('')
    setFiltroGrupo('')
    setFiltroPerfil('')
    setFiltroInstrumento('')
  }

  const temFiltro = busca || filtroGrupo || filtroPerfil || filtroInstrumento

  const FiltroSelect = ({ label, value, onChange, options, placeholder }: {
    label: string
    value: string
    onChange: (v: string) => void
    options: string[]
    placeholder: string
  }) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
      <label style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', letterSpacing: 1 }}>{label}</label>
      <div style={{ position: 'relative' }}>
        <select
          value={value}
          onChange={e => onChange(e.target.value)}
          style={{
            appearance: 'none',
            WebkitAppearance: 'none',
            padding: '9px 36px 9px 14px',
            borderRadius: 8,
            border: '1px solid #e2e8f0',
            background: '#f8fafc',
            fontSize: 13,
            fontWeight: 500,
            color: value ? '#1e293b' : '#64748b',
            cursor: 'pointer',
            outline: 'none',
            minWidth: 180,
            width: '100%',
          }}
        >
          <option value="">{placeholder}</option>
          {options.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
        <svg
          style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
          width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </div>
    </div>
  )

  return (
    <div style={{ background: '#f1f5f9', minHeight: '100vh', padding: '28px 40px' }}
      className="membros-wrap">
      <style>{`
        @media (max-width: 768px) {
          .membros-wrap { padding: 16px !important; }
          .filtros-row { flex-direction: column !important; }
          .col-instrumento, .col-grupo, .col-perfil { display: none !important; }
          .tabela-header { display: none !important; }
        }
      `}</style>

      <div style={{ maxWidth: 1100, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ marginBottom: 20 }}>
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
          marginBottom: 12,
          boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
        }}>
          <div className="filtros-row" style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'flex-end' }}>
            <FiltroSelect label="GRUPO" value={filtroGrupo} onChange={setFiltroGrupo} options={grupos} placeholder="Todos os Grupos" />
            <FiltroSelect label="PERFIL" value={filtroPerfil} onChange={setFiltroPerfil} options={perfis} placeholder="Todos os Perfis" />
            <FiltroSelect label="INSTRUMENTO" value={filtroInstrumento} onChange={setFiltroInstrumento} options={instrumentos} placeholder="Todos os Instrumentos" />

            {temFiltro && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                <label style={{ fontSize: 11, color: 'transparent' }}>X</label>
                <button onClick={limparFiltros} style={{
                  padding: '9px 14px',
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
                }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                  Limpar filtros
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Busca */}
        <div style={{
          background: '#fff',
          border: '1px solid #e2e8f0',
          borderRadius: 12,
          padding: '11px 16px',
          marginBottom: 12,
          boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
        }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            type="text"
            placeholder="Buscar por nome..."
            value={busca}
            onChange={e => setBusca(e.target.value)}
            style={{
              border: 'none', outline: 'none',
              fontSize: 14, color: '#334155',
              width: '100%', background: 'transparent',
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
          <div className="tabela-header" style={{
            display: 'grid',
            gridTemplateColumns: '1fr 180px 180px 160px 110px',
            padding: '10px 20px',
            borderBottom: '1px solid #f1f5f9',
            background: '#f8fafc',
          }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', letterSpacing: 1 }}>MEMBRO</span>
            <span className="col-instrumento" style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', letterSpacing: 1 }}>INSTRUMENTO</span>
            <span className="col-grupo" style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', letterSpacing: 1 }}>GRUPO</span>
            <span className="col-perfil" style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', letterSpacing: 1 }}>PERFIL</span>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', letterSpacing: 1, textAlign: 'right' }}>AÇÕES</span>
          </div>

          {filtrados.length === 0 ? (
            <div style={{ padding: '40px 20px', textAlign: 'center', color: '#94a3b8', fontSize: 14 }}>
              Nenhum membro encontrado
            </div>
          ) : (
            filtrados.map((membro, index) => (
              <div key={membro.id}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 180px 180px 160px 110px',
                  padding: '14px 20px',
                  borderBottom: index < filtrados.length - 1 ? '1px solid #f1f5f9' : 'none',
                  alignItems: 'center',
                  transition: 'background 0.15s',
                  cursor: 'default',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = '#f8fafc')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
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
                    <p style={{ fontWeight: 700, color: '#0f172a', fontSize: 14, margin: 0 }}>
                      {membro.nome}
                    </p>
                    <span style={{
                      fontSize: 11, fontWeight: 600,
                      padding: '2px 8px', borderRadius: 999,
                      background: membro.status === 'Ativo' ? '#dcfce7' : '#f1f5f9',
                      color: membro.status === 'Ativo' ? '#16a34a' : '#64748b',
                    }}>
                      {membro.status || 'Pendente'}
                    </span>
                  </div>
                </div>

                <span className="col-instrumento" style={{ fontSize: 13, color: '#475569', display: 'flex', alignItems: 'center', gap: 5 }}>
                  {membro.instrumento && membro.instrumento !== 'Nenhum' ? (
                    <>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>
                      </svg>
                      {membro.instrumento}
                    </>
                  ) : <span style={{ color: '#cbd5e1' }}>—</span>}
                </span>

                <span className="col-grupo" style={{ fontSize: 13, color: '#475569' }}>
                  {membro.grupo ? (
                    <span style={{
                      background: '#f1f5f9', color: '#475569',
                      padding: '3px 10px', borderRadius: 6,
                      fontSize: 12, fontWeight: 600,
                    }}>
                      {membro.grupo}
                    </span>
                  ) : <span style={{ color: '#cbd5e1' }}>—</span>}
                </span>

                <span className="col-perfil" style={{ fontSize: 13, color: '#475569' }}>
                  {membro.perfil || <span style={{ color: '#cbd5e1' }}>—</span>}
                </span>

                <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                  <a href={`/dashboard/membros/${membro.id}/estatisticas`} title="Estatísticas"
                    style={{
                      width: 30, height: 30, borderRadius: 7, background: '#f5f3ff',
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
                    <a href={`/dashboard/membros/${membro.id}/editar`} title="Editar"
                      style={{
                        width: 30, height: 30, borderRadius: 7, background: '#eff6ff',
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