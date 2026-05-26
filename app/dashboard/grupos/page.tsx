'use client'

import { useState, useEffect } from 'react'

type Grupo = { id: string; nome: string }

export default function Grupos() {
  const [grupos, setGrupos] = useState<Grupo[]>([])
  const [novoGrupo, setNovoGrupo] = useState('')
  const [loading, setLoading] = useState(false)
  const [permissoes, setPermissoes] = useState<any>(null)

  const carregar = () => {
    fetch('/api/grupos').then(res => res.json()).then(data => { if (Array.isArray(data)) setGrupos(data) })
  }

  useEffect(() => {
    carregar()
    fetch('/api/membros/eu').then(r => r.json()).then(data => setPermissoes(data.permissoes || {}))
  }, [])

  const podeCriar = permissoes?.grupos?.criar === true
  const podeExcluir = permissoes?.grupos?.excluir === true

  const adicionar = async () => {
    if (!novoGrupo.trim()) return
    setLoading(true)
    await fetch('/api/grupos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nome: novoGrupo.trim() }),
    })
    setNovoGrupo('')
    carregar()
    setLoading(false)
  }

  const excluir = async (id: string, nome: string) => {
    if (!confirm(`Excluir o grupo "${nome}"?`)) return
    await fetch('/api/grupos', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    carregar()
  }

  return (
    <div style={{ background: '#f1f5f9', minHeight: '100vh', padding: '28px 40px' }} className="grupos-wrap">
      <style>{`@media (max-width: 768px) { .grupos-wrap { padding: 16px !important; } }`}</style>

      <div style={{ maxWidth: 600, margin: '0 auto' }}>

        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: '#1e293b', margin: 0 }}>Grupos</h1>
          <p style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>{grupos.length} grupos cadastrados</p>
        </div>

        <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', overflow: 'hidden' }}>

          {podeCriar && (
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #f1f5f9', display: 'flex', gap: 10 }}>
              <input
                type="text"
                value={novoGrupo}
                onChange={e => setNovoGrupo(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && adicionar()}
                placeholder="Nome do novo grupo..."
                style={{
                  flex: 1, border: '1px solid #e2e8f0', borderRadius: 8,
                  padding: '9px 14px', fontSize: 14, color: '#1e293b',
                  background: '#f8fafc', outline: 'none',
                }}
              />
              <button onClick={adicionar} disabled={loading} style={{
                padding: '9px 18px', borderRadius: 8, border: 'none',
                background: '#2563eb', color: '#fff',
                fontSize: 13, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.5 : 1,
                display: 'flex', alignItems: 'center', gap: 6,
              }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
                Adicionar
              </button>
            </div>
          )}

          {grupos.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8', fontSize: 14 }}>
              Nenhum grupo cadastrado
            </div>
          ) : (
            grupos.map((g, idx) => (
              <div key={g.id} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '14px 20px',
                borderBottom: idx < grupos.length - 1 ? '1px solid #f1f5f9' : 'none',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 16 }}>🎻</span>
                  <span style={{ fontSize: 14, fontWeight: 600, color: '#1e293b' }}>{g.nome}</span>
                </div>
                {podeExcluir && (
                  <button onClick={() => excluir(g.id, g.nome)} style={{
                    width: 30, height: 30, borderRadius: 7, border: 'none',
                    background: '#fff1f2', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6"/>
                      <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
                      <path d="M10 11v6"/><path d="M14 11v6"/>
                      <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/>
                    </svg>
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}