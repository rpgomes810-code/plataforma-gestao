'use client'

import { useState, useEffect } from 'react'

const meses = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro']

export default function Registros() {
  const hoje = new Date()
  const [pendentes, setPendentes] = useState<any[]>([])
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

  const pendentesFiltrados = podeVerRegistros
    ? pendentes
    : pendentes.filter((e: any) => e.atendentes === meuNome)

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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: '#1e293b', margin: 0 }}>Registros</h1>
            <p style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>
              {pendentesFiltrados.length} escala{pendentesFiltrados.length !== 1 ? 's' : ''} pendente{pendentesFiltrados.length !== 1 ? 's' : ''} de registro
            </p>
          </div>
          <a href="/dashboard/historico" style={{
            padding: '9px 16px', borderRadius: 8, border: '1px solid #e2e8f0',
            background: '#fff', color: '#475569', fontSize: 13, fontWeight: 600, textDecoration: 'none',
            display: 'flex', alignItems: 'center', gap: 6,
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/><polyline points="12 8 12 12 14 14"/>
            </svg>
            Histórico
          </a>
        </div>

        {pendentesFiltrados.length === 0 ? (
          <div style={{
            background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.06)', padding: '48px 24px', textAlign: 'center',
          }}>
            <p style={{ fontSize: 36, marginBottom: 12 }}>✅</p>
            <p style={{ color: '#64748b', fontSize: 14 }}>Nenhuma escala pendente de registro</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {pendentesFiltrados.map((escala: any) => (
              <div key={escala.id} style={{
                background: '#fff', borderRadius: 12,
                border: '1px solid #fecaca',
                boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                padding: '16px 20px',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{
                    width: 38, height: 38, borderRadius: '50%',
                    background: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
                      <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
                    </svg>
                  </div>
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 700, color: '#1e293b', margin: 0 }}>
                      {escala.grupo} — {escala.hospitais?.nome || escala.local_texto}
                    </p>
                    <p style={{ fontSize: 12, color: '#94a3b8', margin: 0 }}>
                      {formatarData(escala.data)} · {escala.hora_inicio}
                    </p>
                  </div>
                </div>
                {podeCriar && (
                  <button onClick={() => irParaRegistro(escala)} style={{
                    padding: '8px 20px', borderRadius: 8, border: 'none',
                    background: '#dc2626', color: '#fff',
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