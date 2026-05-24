'use client'

import { useState, useEffect } from 'react'

export default function Registros() {
  const [pendentes, setPendentes] = useState<any[]>([])
  const [busca, setBusca] = useState('')
  const [loading, setLoading] = useState(true)
  const [permissoes, setPermissoes] = useState<any>(null)
  const [meuNome, setMeuNome] = useState('')
  const [carregouUsuario, setCarregouUsuario] = useState(false)

  useEffect(() => {
    fetch('/api/membros/eu').then(res => res.json()).then(data => {
      setPermissoes(data.permissoes || {})
      if (data?.nome) setMeuNome(data.nome)
      setCarregouUsuario(true)
    }).catch(() => setCarregouUsuario(true))

    fetch('/api/escalas/pendentes').then(res => res.json()).then(data => {
      setPendentes(Array.isArray(data) ? data : [])
      setLoading(false)
    })
  }, [])

  const podeVerRegistros = permissoes?.registros?.ver === true
  const podeCriar = permissoes?.registros?.criar === true

  const formatarData = (data: string) => new Date(data + 'T12:00:00').toLocaleDateString('pt-BR')

  const irParaRegistro = (escala: any) => {
    const params = new URLSearchParams({ escala_id: escala.id, hospital_id: escala.hospital_id, data: escala.data })
    window.location.href = `/dashboard/registros/novo?${params.toString()}`
  }

  const pendentesFiltrados = (podeVerRegistros
    ? pendentes
    : pendentes.filter((e: any) => e.atendentes === meuNome)
  ).filter((e: any) => {
    if (!busca) return true
    const b = busca.toLowerCase()
    return (
      e.grupo?.toLowerCase().includes(b) ||
      e.hospitais?.nome?.toLowerCase().includes(b) ||
      e.local_texto?.toLowerCase().includes(b) ||
      e.atendentes?.toLowerCase().includes(b)
    )
  })

  if (!carregouUsuario || loading) return (
    <div style={{ background: '#f1f5f9', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: '#64748b', fontSize: 14 }}>Carregando...</p>
    </div>
  )

  return (
    <div style={{ background: '#f1f5f9', minHeight: '100vh', padding: '28px 40px' }} className="registros-wrap">
      <style>{`
        @media (max-width: 768px) {
          .registros-wrap { padding: 16px !important; }
        }
      `}</style>

      <div style={{ maxWidth: 1280, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: '#1e293b', margin: 0 }}>Registros</h1>
          <p style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>
            {pendentesFiltrados.length} escala{pendentesFiltrados.length !== 1 ? 's' : ''} pendente{pendentesFiltrados.length !== 1 ? 's' : ''} de registro
          </p>
        </div>

        {/* Busca */}
        <div style={{
          background: '#fff', border: '1px solid #e2e8f0',
          borderRadius: 12, padding: '11px 16px', marginBottom: 16,
          boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            type="text"
            placeholder="Buscar por grupo, hospital ou atendente..."
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

        {pendentesFiltrados.length === 0 ? (
          <div style={{
            background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.06)', padding: '48px 24px', textAlign: 'center',
          }}>
            <p style={{ fontSize: 36, marginBottom: 12 }}>✅</p>
            <p style={{ color: '#64748b', fontSize: 14 }}>
              {busca ? 'Nenhuma escala encontrada' : 'Nenhuma escala pendente de registro'}
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {pendentesFiltrados.map((escala: any) => (
              <div key={escala.id} style={{
                background: '#fff', borderRadius: 12,
                border: '1px solid #e2e8f0',
                boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                padding: '16px 20px',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{
                    width: 38, height: 38, borderRadius: '50%',
                    background: '#1e3a5f', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
                    </svg>
                  </div>
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 700, color: '#1e293b', margin: 0 }}>
                      {escala.grupo} — {escala.hospitais?.nome || escala.local_texto}
                    </p>
                    <div style={{ display: 'flex', gap: 12, marginTop: 3 }}>
                      <p style={{ fontSize: 12, color: '#94a3b8', margin: 0 }}>
                        {formatarData(escala.data)} · {escala.hora_inicio}
                      </p>
                      {escala.atendentes && (
                        <p style={{ fontSize: 12, color: '#64748b', margin: 0, display: 'flex', alignItems: 'center', gap: 4 }}>
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
                          </svg>
                          {escala.atendentes}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                {podeCriar && (
                  <button onClick={() => irParaRegistro(escala)} style={{
                    padding: '8px 20px', borderRadius: 8, border: '1px solid #2563eb',
                    background: '#fff', color: '#2563eb',
                    fontSize: 13, fontWeight: 600, cursor: 'pointer', flexShrink: 0,
                  }}>
                    Registrar
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}