'use client'

import { useEffect, useState } from 'react'

const PAGINAS = [
  { key: 'confirmacoes', label: 'Confirmações', acoes: ['ver'] },
  { key: 'escalas', label: 'Escalas', acoes: ['ver', 'criar', 'editar', 'excluir'] },
  { key: 'registros', label: 'Registros', acoes: ['ver', 'criar', 'editar', 'excluir'] },
  { key: 'relatorios', label: 'Relatórios', acoes: ['ver'] },
  { key: 'membros', label: 'Membros', acoes: ['ver', 'criar', 'editar', 'excluir'] },
  { key: 'ficha_siga', label: 'Ficha de Cadastro SIGA', acoes: ['ver'] },
  { key: 'hospitais', label: 'Hospitais', acoes: ['ver', 'criar', 'editar', 'excluir'] },
  { key: 'vagas', label: 'Vagas', acoes: ['ver'] },
  { key: 'comunicados', label: 'Comunicados', acoes: ['ver', 'criar', 'editar', 'excluir'] },
  { key: 'grupos', label: 'Grupos', acoes: ['ver', 'criar', 'editar', 'excluir'] },
  { key: 'logs', label: 'Logs', acoes: ['ver'] },
  { key: 'solicitacoes', label: 'Solicitações', acoes: ['ver'] },
]

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '10px 14px', borderRadius: 8,
  border: '1px solid #e2e8f0', background: '#f8fafc',
  fontSize: 14, color: '#1e293b', outline: 'none', boxSizing: 'border-box',
}

export default function Permissoes() {
  const [permissoes, setPermissoes] = useState<any[]>([])
  const [salvando, setSalvando] = useState<string | null>(null)
  const [temAcesso, setTemAcesso] = useState<boolean | null>(null)

  useEffect(() => {
    fetch('/api/membros/eu').then(r => r.json()).then(async membro => {
      const res = await fetch('/api/permissoes/acesso?membro_id=' + membro.id)
      const data = await res.json()
      setTemAcesso(data.acesso)
    })
    fetch('/api/permissoes').then(r => r.json()).then(data => {
      if (Array.isArray(data)) setPermissoes(data)
    })
  }, [])

  const toggleAcao = async (perfil: string, pagina: string, acao: string, ativo: boolean) => {
    const item = permissoes.find(p => p.perfil === perfil)
    if (!item) return

    const paginaAtual = item.paginas?.[pagina] || {}
    const novaPagina = { ...paginaAtual, [acao]: ativo }

    if (acao === 'ver' && !ativo) {
      Object.keys(novaPagina).forEach(k => novaPagina[k] = false)
    }
    if (acao !== 'ver' && ativo) {
      novaPagina['ver'] = true
    }

    const novasPaginas = { ...item.paginas, [pagina]: novaPagina }
    setPermissoes(prev => prev.map(p => p.perfil === perfil ? { ...p, paginas: novasPaginas } : p))

    setSalvando(perfil)
    await fetch('/api/permissoes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ perfil, paginas: novasPaginas })
    })
    setSalvando(null)
  }

  if (temAcesso === null) return (
    <div style={{ background: '#f1f5f9', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: '#64748b', fontSize: 14 }}>Carregando...</p>
    </div>
  )

  if (!temAcesso) return (
    <div style={{ background: '#f1f5f9', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center', background: '#fff', borderRadius: 16, padding: 48, border: '1px solid #e2e8f0' }}>
        <p style={{ fontSize: 40, marginBottom: 12 }}>🔒</p>
        <p style={{ color: '#64748b', fontSize: 14 }}>Você não tem acesso a esta página</p>
      </div>
    </div>
  )

  return (
    <div style={{ background: '#f1f5f9', minHeight: '100vh', padding: '28px 40px' }} className="perm-wrap">
      <style>{`
        @media (max-width: 768px) { .perm-wrap { padding: 16px !important; } }
      `}</style>

      <div style={{ maxWidth: 1280, margin: '0 auto' }}>

        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: '#1e293b', margin: 0 }}>Permissões por Perfil</h1>
          <p style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>Configure o que cada perfil pode fazer em cada página</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {permissoes.map(item => (
            <div key={item.perfil} style={{
              background: '#fff', border: '1px solid #e2e8f0',
              borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
              padding: '20px 24px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: '#1e293b', margin: 0 }}>{item.perfil}</h3>
                {salvando === item.perfil && (
                  <span style={{ fontSize: 12, color: '#2563eb', fontWeight: 600 }}>Salvando...</span>
                )}
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                  <thead>
                    <tr>
                      <th style={{ textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#94a3b8', letterSpacing: 1, paddingBottom: 10, paddingRight: 16 }}>PÁGINA</th>
                      <th style={{ textAlign: 'center', fontSize: 11, fontWeight: 700, color: '#2563eb', letterSpacing: 1, paddingBottom: 10, paddingLeft: 8, paddingRight: 8 }}>VER</th>
                      <th style={{ textAlign: 'center', fontSize: 11, fontWeight: 700, color: '#16a34a', letterSpacing: 1, paddingBottom: 10, paddingLeft: 8, paddingRight: 8 }}>CRIAR</th>
                      <th style={{ textAlign: 'center', fontSize: 11, fontWeight: 700, color: '#d97706', letterSpacing: 1, paddingBottom: 10, paddingLeft: 8, paddingRight: 8 }}>EDITAR</th>
                      <th style={{ textAlign: 'center', fontSize: 11, fontWeight: 700, color: '#dc2626', letterSpacing: 1, paddingBottom: 10, paddingLeft: 8, paddingRight: 8 }}>EXCLUIR</th>
                    </tr>
                  </thead>
                  <tbody>
                    {PAGINAS.map((pagina, idx) => {
                      const paginaPerms = item.paginas?.[pagina.key] || {}
                      return (
                        <tr key={pagina.key} style={{ borderTop: idx > 0 ? '1px solid #f1f5f9' : 'none' }}>
                          <td style={{ padding: '10px 16px 10px 0', fontWeight: 600, color: '#334155' }}>{pagina.label}</td>
                          {['ver', 'criar', 'editar', 'excluir'].map(acao => {
                            const temAcao = pagina.acoes.includes(acao)
                            const ativo = paginaPerms[acao] === true
                            const cores: Record<string, { on: string, text: string }> = {
                              ver: { on: '#2563eb', text: '#fff' },
                              criar: { on: '#16a34a', text: '#fff' },
                              editar: { on: '#d97706', text: '#fff' },
                              excluir: { on: '#dc2626', text: '#fff' },
                            }
                            return (
                              <td key={acao} style={{ padding: '10px 8px', textAlign: 'center' }}>
                                {temAcao ? (
                                  <button
                                    onClick={() => toggleAcao(item.perfil, pagina.key, acao, !ativo)}
                                    style={{
                                      width: 32, height: 32, borderRadius: 8, border: 'none',
                                      background: ativo ? cores[acao].on : '#f1f5f9',
                                      color: ativo ? cores[acao].text : '#94a3b8',
                                      fontSize: 13, fontWeight: 700, cursor: 'pointer',
                                      transition: 'all 0.15s',
                                    }}
                                  >
                                    {ativo ? '✓' : '×'}
                                  </button>
                                ) : (
                                  <span style={{ color: '#e2e8f0' }}>—</span>
                                )}
                              </td>
                            )
                          })}
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}