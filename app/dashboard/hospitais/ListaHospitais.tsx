'use client'

import { useState } from 'react'
import BotaoExcluirHospital from './BotaoExcluirHospital'

export default function ListaHospitais({ hospitais, membroLogado, podeCriar, podeEditar, podeExcluir }: {
  hospitais: any[]
  membroLogado: any
  podeCriar: boolean
  podeEditar: boolean
  podeExcluir: boolean
}) {
  const [busca, setBusca] = useState('')
  const [filtroCidade, setFiltroCidade] = useState('')

  const cidades = [...new Set(hospitais.map(h => h.cidade).filter(Boolean))].sort()

  const filtrados = hospitais.filter(h => {
    const nomeOk = h.nome?.toLowerCase().includes(busca.toLowerCase())
    const cidadeOk = filtroCidade === '' || h.cidade === filtroCidade
    return nomeOk && cidadeOk
  })

  const temFiltro = busca || filtroCidade

  return (
    <div style={{ background: '#f1f5f9', minHeight: '100vh', padding: '28px 40px' }}
      className="hospitais-wrap">
      <style>{`
        @media (max-width: 768px) {
          .hospitais-wrap { padding: 16px !important; }
          .tabela-header { display: none !important; }
          .col-cidade { display: none !important; }
          .filtros-row { flex-direction: column !important; }
        }
        .hospital-row:hover { background: #f8fafc; }
      `}</style>

      <div style={{ maxWidth: 1280, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: '#1e293b', margin: 0 }}>Hospitais</h1>
            <p style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>
              {filtrados.length} de {hospitais.length} hospitais
            </p>
          </div>
          {podeCriar && (
            <a href="/dashboard/hospitais/novo" style={{
              padding: '9px 16px', borderRadius: 8,
              background: '#fff', color: '#2563eb',
              fontSize: 13, fontWeight: 600, textDecoration: 'none',
              display: 'flex', alignItems: 'center', gap: 6,
              border: '1px solid #2563eb',
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              Novo Hospital
            </a>
          )}
        </div>

        {/* Filtros */}
        <div style={{
          background: '#fff', border: '1px solid #e2e8f0',
          borderRadius: 12, padding: '16px 20px', marginBottom: 12,
          boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
        }}>
          <div className="filtros-row" style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'flex-end' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', letterSpacing: 1 }}>CIDADE</label>
              <div style={{ position: 'relative' }}>
                <select
                  value={filtroCidade}
                  onChange={e => setFiltroCidade(e.target.value)}
                  style={{
                    appearance: 'none', WebkitAppearance: 'none',
                    padding: '9px 36px 9px 14px', borderRadius: 8,
                    border: '1px solid #e2e8f0', background: '#f8fafc',
                    fontSize: 13, fontWeight: 500,
                    color: filtroCidade ? '#1e293b' : '#64748b',
                    cursor: 'pointer', outline: 'none', minWidth: 180,
                  }}
                >
                  <option value="">Todas as Cidades</option>
                  {cidades.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <svg style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
                  width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="6 9 12 15 18 9"/>
                </svg>
              </div>
            </div>

            {temFiltro && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                <label style={{ fontSize: 11, color: 'transparent' }}>X</label>
                <button onClick={() => { setBusca(''); setFiltroCidade('') }} style={{
                  padding: '9px 14px', borderRadius: 8,
                  border: '1px solid #e2e8f0', background: 'transparent',
                  fontSize: 12, fontWeight: 600, color: '#64748b',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
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
          background: '#fff', border: '1px solid #e2e8f0',
          borderRadius: 12, padding: '11px 16px', marginBottom: 12,
          boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
          display: 'flex', alignItems: 'center', gap: 10,
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
          background: '#fff', border: '1px solid #e2e8f0',
          borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
          overflow: 'hidden',
        }}>
          <div className="tabela-header" style={{
            display: 'grid',
            gridTemplateColumns: '2fr 160px 120px 110px',
            padding: '10px 20px',
            borderBottom: '1px solid #f1f5f9',
            background: '#f8fafc',
          }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', letterSpacing: 1 }}>HOSPITAL</span>
            <span className="col-cidade" style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', letterSpacing: 1 }}>CIDADE</span>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', letterSpacing: 1 }}>STATUS</span>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', letterSpacing: 1, textAlign: 'right' }}>AÇÕES</span>
          </div>

          {filtrados.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8', fontSize: 14 }}>
              Nenhum hospital encontrado
            </div>
          ) : (
            filtrados.map((hospital, index) => (
              <div key={hospital.id} className="hospital-row"
                style={{
                  display: 'grid',
                  gridTemplateColumns: '2fr 160px 120px 110px',
                  padding: '14px 20px',
                  borderBottom: index < filtrados.length - 1 ? '1px solid #f1f5f9' : 'none',
                  alignItems: 'center',
                  transition: 'background 0.15s',
                }}
              >
                {/* Nome */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{
                    width: 38, height: 38, borderRadius: '50%',
                    background: hospital.ativo ? '#1e3a5f' : '#94a3b8',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#fff', fontWeight: 700, fontSize: 15, flexShrink: 0,
                  }}>
                    {hospital.nome?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p style={{ fontWeight: 700, color: '#0f172a', fontSize: 14, margin: 0, textTransform: 'uppercase', letterSpacing: 0.4 }}>
                      {hospital.nome}
                    </p>
                    {hospital.contato && (
                      <p style={{ fontSize: 12, color: '#94a3b8', margin: 0 }}>{hospital.contato}</p>
                    )}
                  </div>
                </div>

                {/* Cidade */}
                <span className="col-cidade" style={{ fontSize: 13, color: '#475569' }}>
                  {hospital.cidade || <span style={{ color: '#cbd5e1' }}>—</span>}
                </span>

                {/* Status */}
                <span style={{
                  fontSize: 11, fontWeight: 600,
                  padding: '3px 10px', borderRadius: 999,
                  background: hospital.ativo ? '#dcfce7' : '#f1f5f9',
                  color: hospital.ativo ? '#16a34a' : '#64748b',
                  display: 'inline-block',
                }}>
                  {hospital.ativo ? 'Ativo' : 'Inativo'}
                </span>

                {/* Ações */}
                <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                  {hospital.localizacao && (
                    <a href={hospital.localizacao} target="_blank" rel="noopener noreferrer" title="Abrir no Maps"
                      style={{
                        width: 30, height: 30, borderRadius: 7, background: '#f0fdf4',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        textDecoration: 'none',
                      }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/>
                        <circle cx="12" cy="10" r="3"/>
                      </svg>
                    </a>
                  )}
                  {podeEditar && (
                    <a href={`/dashboard/hospitais/${hospital.id}/editar`} title="Editar"
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
                    <BotaoExcluirHospital id={hospital.id} nome={hospital.nome} usuarioNome={membroLogado?.nome} />
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