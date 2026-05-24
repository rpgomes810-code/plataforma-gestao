'use client'

import { useState, useEffect } from 'react'
import BotaoExcluirRegistro from './BotaoExcluirRegistro'

const meses = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro']

export default function Registros() {
  const hoje = new Date()
  const [mes, setMes] = useState(hoje.getMonth())
  const [ano, setAno] = useState(hoje.getFullYear())
  const [registros, setRegistros] = useState<any[]>([])
  const [pendentes, setPendentes] = useState<any[]>([])
  const [membros, setMembros] = useState<any[]>([])
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

    fetch('/api/escalas/pendentes').then(res => res.json()).then(data => setPendentes(Array.isArray(data) ? data : []))
    fetch('/api/membros').then(res => res.json()).then(data => { if (Array.isArray(data)) setMembros(data) })
  }, [])

  const podeVerRegistros = permissoes?.registros?.ver === true
  const podeCriar = permissoes?.registros?.criar === true
  const podeEditar = permissoes?.registros?.editar === true
  const podeExcluir = permissoes?.registros?.excluir === true

  useEffect(() => {
    if (!podeVerRegistros) return
    setLoading(true)
    fetch(`/api/registros?mes=${mes + 1}&ano=${ano}`).then(res => res.json()).then(data => {
      setRegistros(Array.isArray(data) ? data : [])
      setLoading(false)
    }).catch(() => { setRegistros([]); setLoading(false) })
  }, [mes, ano, podeVerRegistros])

  const formatarData = (data: string) => new Date(data + 'T12:00:00').toLocaleDateString('pt-BR')

  const irParaRegistro = (escala: any) => {
    const params = new URLSearchParams({ escala_id: escala.id, hospital_id: escala.hospital_id, data: escala.data })
    window.location.href = `/dashboard/registros/novo?${params.toString()}`
  }

  const pendentesFiltrados = podeVerRegistros
    ? pendentes
    : pendentes.filter((e: any) => e.atendentes === meuNome)

  const resumoMembros = (membrosPresentes: string) => {
    if (!membrosPresentes) return []
    const nomes = membrosPresentes.split(',').map((n: string) => n.trim()).filter(Boolean)
    const porGrupo: Record<string, number> = {}
    nomes.forEach(nome => {
      const membro = membros.find((m: any) => m.nome === nome)
      const grupo = membro?.grupo || 'Avulso'
      porGrupo[grupo] = (porGrupo[grupo] || 0) + 1
    })
    return Object.entries(porGrupo).sort((a, b) => {
      const numA = parseInt(a[0].replace(/\D/g, '')) || 999
      const numB = parseInt(b[0].replace(/\D/g, '')) || 999
      return numA - numB
    })
  }

  if (!carregouUsuario) return (
    <div style={{ background: '#f1f5f9', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: '#64748b', fontSize: 14 }}>Carregando...</p>
    </div>
  )

  return (
    <div style={{ background: '#f1f5f9', minHeight: '100vh', padding: '28px 40px' }} className="registros-wrap">
      <style>{`
        @media (max-width: 768px) {
          .registros-wrap { padding: 16px !important; }
          .registros-header { flex-direction: column !important; align-items: flex-start !important; }
        }
      `}</style>

      <div style={{ maxWidth: 1280, margin: '0 auto' }}>

        {/* Pendentes */}
        {pendentesFiltrados.length > 0 && (
          <div style={{ marginBottom: 28 }}>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: '#dc2626', margin: '0 0 12px', display: 'flex', alignItems: 'center', gap: 6 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
                <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
              Escalas pendentes de registro ({pendentesFiltrados.length})
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {pendentesFiltrados.map((escala: any) => (
                <div key={escala.id} style={{
                  background: '#fff', borderRadius: 12, border: '1px solid #fecaca',
                  padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                }}>
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 600, color: '#1e293b', margin: 0 }}>
                      {escala.grupo} — {escala.hospitais?.nome || escala.local_texto}
                    </p>
                    <p style={{ fontSize: 12, color: '#94a3b8', margin: 0 }}>{formatarData(escala.data)} · {escala.hora_inicio}</p>
                  </div>
                  {podeCriar && (
                    <button onClick={() => irParaRegistro(escala)} style={{
                      padding: '8px 16px', borderRadius: 8, border: 'none',
                      background: '#dc2626', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer',
                    }}>
                      Registrar
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {podeVerRegistros && (
          <>
            <div className="registros-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, gap: 16 }}>
              <div>
                <h1 style={{ fontSize: 22, fontWeight: 800, color: '#1e293b', margin: 0 }}>Registros de Atendimento</h1>
                <p style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>{registros.length} registros em {meses[mes]} {ano}</p>
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button onClick={() => { if (mes === 0) { setMes(11); setAno(ano - 1) } else setMes(mes - 1) }}
                    style={{ width: 34, height: 34, borderRadius: 8, border: '1px solid #e2e8f0', background: '#fff', cursor: 'pointer', color: '#475569', fontSize: 14 }}>←</button>
                  <span style={{ padding: '7px 16px', background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 13, fontWeight: 600, color: '#334155' }}>
                    {meses[mes]} {ano}
                  </span>
                  <button onClick={() => { if (mes === 11) { setMes(0); setAno(ano + 1) } else setMes(mes + 1) }}
                    style={{ width: 34, height: 34, borderRadius: 8, border: '1px solid #e2e8f0', background: '#fff', cursor: 'pointer', color: '#475569', fontSize: 14 }}>→</button>
                </div>
                <a href="/dashboard/historico" style={{
                  padding: '8px 16px', borderRadius: 8, border: '1px solid #e2e8f0',
                  background: '#fff', color: '#475569', fontSize: 13, fontWeight: 600, textDecoration: 'none',
                  display: 'flex', alignItems: 'center', gap: 6,
                }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"/><polyline points="12 8 12 12 14 14"/>
                  </svg>
                  Histórico
                </a>
                {podeCriar && (
                  <a href="/dashboard/registros/novo" style={{
                    padding: '8px 16px', borderRadius: 8, background: '#2563eb',
                    color: '#fff', fontSize: 13, fontWeight: 600, textDecoration: 'none',
                    display: 'flex', alignItems: 'center', gap: 6,
                  }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                    </svg>
                    Novo Registro
                  </a>
                )}
              </div>
            </div>

            {loading ? (
              <div style={{ textAlign: 'center', padding: 48, color: '#64748b' }}>Carregando...</div>
            ) : registros.length === 0 ? (
              <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', padding: 48, textAlign: 'center' }}>
                <p style={{ fontSize: 36, marginBottom: 12 }}>📋</p>
                <p style={{ color: '#64748b', fontSize: 14 }}>Nenhum registro em {meses[mes]} {ano}</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {registros.map(registro => {
                  const resumo = resumoMembros(registro.membros_presentes)
                  return (
                    <div key={registro.id} style={{
                      background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.06)', padding: '20px',
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#1e3a5f', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
                            </svg>
                          </div>
                          <div>
                            <p style={{ fontSize: 15, fontWeight: 700, color: '#1e293b', margin: 0 }}>{registro.hospitais?.nome || '—'}</p>
                            <p style={{ fontSize: 12, color: '#94a3b8', margin: 0 }}>{formatarData(registro.data)} · {registro.hora_inicio} às {registro.hora_termino}</p>
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: 6 }}>
                          {podeEditar && (
                            <a href={`/dashboard/registros/${registro.id}/editar`} title="Editar"
                              style={{ width: 30, height: 30, borderRadius: 7, background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none' }}>
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                                <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                              </svg>
                            </a>
                          )}
                          {podeExcluir && <BotaoExcluirRegistro id={registro.id} hospital={registro.hospitais?.nome || '—'} />}
                        </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
                        <div>
                          <p style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', letterSpacing: 1, margin: '0 0 4px' }}>AUTORIZOU</p>
                          <p style={{ fontSize: 13, color: '#475569', margin: 0 }}>{registro.quem_autorizou || '—'}</p>
                        </div>
                        <div>
                          <p style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', letterSpacing: 1, margin: '0 0 4px' }}>MEMBROS</p>
                          {resumo.length > 0 ? resumo.map(([grupo, total]) => (
                            <p key={grupo} style={{ fontSize: 13, color: '#475569', margin: 0 }}>
                              {total} {total === 1 ? 'membro' : 'membros'} — {grupo}
                            </p>
                          )) : <p style={{ fontSize: 13, color: '#94a3b8', margin: 0 }}>—</p>}
                        </div>
                        <div>
                          <p style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', letterSpacing: 1, margin: '0 0 4px' }}>HINOS</p>
                          <p style={{ fontSize: 13, color: '#475569', margin: 0 }}>🎵 {registro.hinos_executados}</p>
                        </div>
                        <div>
                          <p style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', letterSpacing: 1, margin: '0 0 4px' }}>ORAÇÃO</p>
                          <p style={{ fontSize: 13, color: '#475569', margin: 0 }}>{registro.teve_oracao ? '✅ Sim' : '❌ Não'}</p>
                        </div>
                      </div>

                      {registro.observacoes && (
                        <div style={{ marginTop: 12, padding: '10px 14px', background: '#f8fafc', borderRadius: 8, fontSize: 13, color: '#64748b' }}>
                          💬 {registro.observacoes}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </>
        )}

        {!podeVerRegistros && pendentesFiltrados.length === 0 && (
          <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', padding: 48, textAlign: 'center' }}>
            <p style={{ fontSize: 36, marginBottom: 12 }}>✅</p>
            <p style={{ color: '#64748b', fontSize: 14 }}>Nenhuma escala pendente de registro</p>
          </div>
        )}
      </div>
    </div>
  )
}