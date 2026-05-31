'use client'

import { useEffect, useState } from 'react'

export default function Vagas() {
  const [vagas, setVagas] = useState<any[]>([])
  const [membro, setMembro] = useState<any>(null)
  const [loadingVaga, setLoadingVaga] = useState<string | null>(null)

  const carregarDados = () => {
    fetch('/api/confirmacoes/pagina').then(r => r.json()).then(d => setMembro(d.membroLogado))
    fetch('/api/vagas').then(r => r.json()).then(data => { if (Array.isArray(data)) setVagas(data) })
  }

  useEffect(() => { carregarDados() }, [])

  const preencherVaga = async (escala_id: string, confirmacao_id: string) => {
    if (!membro?.id) return
    setLoadingVaga(escala_id)
    const res = await fetch('/api/vagas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ escala_id, membro_id: membro.id, confirmacao_id }),
    })
    if (res.ok) carregarDados()
    setLoadingVaga(null)
  }

  const formatarData = (data: string) => new Date(data + 'T12:00:00').toLocaleDateString('pt-BR', {
    weekday: 'long', day: '2-digit', month: '2-digit'
  })

const tipoVaga = (vaga: any) => {
  const instrumento = (vaga.membros?.instrumento ?? '').toString().trim()
  const perfil = (vaga.membros?.perfil ?? '').toString().trim()
  if (instrumento && instrumento !== 'Nenhum') return instrumento
  if (perfil) return perfil
  return '—'
}

  return (
    <div style={{ background: '#f1f5f9', minHeight: '100vh', padding: '28px 40px' }} className="vagas-wrap">
      <style>{`@media (max-width: 768px) { .vagas-wrap { padding: 16px !important; } }`}</style>

      <div style={{ maxWidth: 1280, margin: '0 auto' }}>

        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: '#1e293b', margin: 0 }}>Vagas Abertas</h1>
          <p style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>{vagas.length} vaga{vagas.length !== 1 ? 's' : ''} aguardando voluntários</p>
        </div>

        {vagas.length === 0 ? (
          <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', padding: '48px 24px', textAlign: 'center' }}>
            <p style={{ fontSize: 36, marginBottom: 12 }}>✅</p>
            <p style={{ color: '#64748b', fontSize: 14 }}>Nenhuma vaga aberta no momento</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {vagas.map((vaga: any) => {
              const eDoGrupo = membro?.grupo === vaga.escalas?.grupo
              return (
                <div key={vaga.id} style={{
                  background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.06)', padding: '16px 20px',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{
                      width: 40, height: 40, borderRadius: '50%', background: '#fff7ed',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
                        <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
                      </svg>
                    </div>
                    <div>
                      <p style={{ fontSize: 14, fontWeight: 700, color: '#1e293b', margin: 0 }}>
                        {vaga.escalas?.grupo} — {vaga.escalas?.local_texto}
                      </p>
                      <p style={{ fontSize: 12, color: '#94a3b8', margin: '2px 0' }}>
                        {formatarData(vaga.escalas?.data)} · {vaga.escalas?.hora_inicio}
                      </p>
                      <span style={{
                        fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 999,
                        background: '#fff7ed', color: '#d97706',
                      }}>
                        Vaga de: {tipoVaga(vaga)}
                      </span>
                    </div>
                  </div>

                  {!eDoGrupo ? (
                    <button onClick={() => preencherVaga(vaga.escala_id, vaga.id)} disabled={loadingVaga === vaga.escala_id} style={{
                      padding: '8px 20px', borderRadius: 8, border: '1px solid #2563eb',
                      background: '#fff', color: '#2563eb',
                      fontSize: 13, fontWeight: 600, cursor: 'pointer', flexShrink: 0,
                      opacity: loadingVaga === vaga.escala_id ? 0.5 : 1,
                    }}>
                      {loadingVaga === vaga.escala_id ? 'Salvando...' : 'Preencher vaga'}
                    </button>
                  ) : (
                    <span style={{
                      fontSize: 11, fontWeight: 600, padding: '4px 12px', borderRadius: 999,
                      background: '#f1f5f9', color: '#64748b', flexShrink: 0,
                    }}>
                      Seu grupo
                    </span>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}