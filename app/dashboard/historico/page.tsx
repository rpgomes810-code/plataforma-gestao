'use client'

import { useState, useEffect } from 'react'

const meses = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro']

export default function Historico() {
  const hoje = new Date()
  const [mes, setMes] = useState(hoje.getMonth())
  const [ano, setAno] = useState(hoje.getFullYear())
  const [aba, setAba] = useState<'escalas' | 'registros' | 'confirmacoes'>('escalas')
  const [escalas, setEscalas] = useState<any[]>([])
  const [registros, setRegistros] = useState<any[]>([])
  const [confirmacoes, setConfirmacoes] = useState<any[]>([])
  const [membros, setMembros] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [permissoes, setPermissoes] = useState<any>(null)

  useEffect(() => {
    fetch('/api/membros/eu').then(r => r.json()).then(data => setPermissoes(data.permissoes || {}))
    fetch('/api/membros').then(r => r.json()).then(data => { if (Array.isArray(data)) setMembros(data) })
  }, [])

  useEffect(() => {
    setLoading(true)
    const ontem = new Date()
    ontem.setDate(ontem.getDate() - 1)

    if (aba === 'escalas') {
      fetch(`/api/escalas?mes=${mes + 1}&ano=${ano}`)
        .then(r => r.json())
        .then(data => {
          const todas = Array.isArray(data) ? data : []
          const passadas = todas.filter((e: any) => new Date(e.data + 'T12:00:00') < ontem)
          setEscalas(passadas)
          setLoading(false)
        })
    } else if (aba === 'registros') {
      fetch(`/api/registros?mes=${mes + 1}&ano=${ano}`)
        .then(r => r.json())
        .then(data => {
          setRegistros(Array.isArray(data) ? data : [])
          setLoading(false)
        })
    } else {
      fetch('/api/confirmacoes/pagina')
        .then(r => r.json())
        .then(data => {
          const escalasPassadas = (data.escalas || []).filter((e: any) => new Date(e.data + 'T12:00:00') < ontem)
          setConfirmacoes(escalasPassadas)
          setLoading(false)
        })
    }
  }, [mes, ano, aba])

  const formatarData = (data: string) => new Date(data + 'T12:00:00').toLocaleDateString('pt-BR', {
    weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric'
  })

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

  const abaStyle = (a: string): React.CSSProperties => ({
    padding: '8px 18px', borderRadius: 8, border: 'none', cursor: 'pointer',
    fontSize: 13, fontWeight: 600,
    background: aba === a ? '#1e3a5f' : '#fff',
    color: aba === a ? '#fff' : '#475569',
    border: aba === a ? 'none' : '1px solid #e2e8f0',
  } as React.CSSProperties)

  return (
    <div style={{ background: '#f1f5f9', minHeight: '100vh', padding: '28px 40px' }} className="historico-wrap">
      <style>{`
        @media (max-width: 768px) {
          .historico-wrap { padding: 16px !important; }
          .historico-header { flex-direction: column !important; align-items: flex-start !important; }
          .col-extra { display: none !important; }
        }
        .hist-row:hover { background: #f8fafc; }
      `}</style>

      <div style={{ maxWidth: 1280, margin: '0 auto' }}>

        {/* Header */}
        <div className="historico-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, gap: 16 }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: '#1e293b', margin: 0 }}>Histórico</h1>
            <p style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>Escalas, registros e confirmações anteriores</p>
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            <button onClick={() => { if (mes === 0) { setMes(11); setAno(ano - 1) } else setMes(mes - 1) }}
              style={{ width: 34, height: 34, borderRadius: 8, border: '1px solid #e2e8f0', background: '#fff', cursor: 'pointer', color: '#475569', fontSize: 14 }}>←</button>
            <span style={{ padding: '7px 16px', background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 13, fontWeight: 600, color: '#334155' }}>
              {meses[mes]} {ano}
            </span>
            <button onClick={() => { if (mes === 11) { setMes(0); setAno(ano + 1) } else setMes(mes + 1) }}
              style={{ width: 34, height: 34, borderRadius: 8, border: '1px solid #e2e8f0', background: '#fff', cursor: 'pointer', color: '#475569', fontSize: 14 }}>→</button>
          </div>
        </div>

        {/* Abas */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
          <button style={abaStyle('escalas')} onClick={() => setAba('escalas')}>Escalas</button>
          <button style={abaStyle('registros')} onClick={() => setAba('registros')}>Registros</button>
          <button style={abaStyle('confirmacoes')} onClick={() => setAba('confirmacoes')}>Confirmações</button>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 48, color: '#64748b' }}>Carregando...</div>
        ) : (

          <>
            {/* Escalas */}
            {aba === 'escalas' && (
              escalas.length === 0 ? (
                <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', padding: 48, textAlign: 'center' }}>
                  <p style={{ fontSize: 36, marginBottom: 12 }}>📅</p>
                  <p style={{ color: '#64748b', fontSize: 14 }}>Nenhuma escala anterior em {meses[mes]} {ano}</p>
                </div>
              ) : (
                <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
                  <div style={{ padding: '10px 20px', background: '#f8fafc', borderBottom: '1px solid #f1f5f9', display: 'grid', gridTemplateColumns: '1fr 200px 120px 120px' }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', letterSpacing: 1 }}>ESCALA</span>
                    <span className="col-extra" style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', letterSpacing: 1 }}>LOCAL</span>
                    <span className="col-extra" style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', letterSpacing: 1 }}>HORA</span>
                    <span style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', letterSpacing: 1 }}>STATUS</span>
                  </div>
                  {escalas.map((escala, idx) => (
                    <div key={escala.id} className="hist-row" style={{
                      display: 'grid', gridTemplateColumns: '1fr 200px 120px 120px',
                      padding: '14px 20px', borderBottom: idx < escalas.length - 1 ? '1px solid #f1f5f9' : 'none',
                      alignItems: 'center', transition: 'background 0.15s',
                    }}>
                      <div>
                        <p style={{ fontSize: 14, fontWeight: 600, color: '#1e293b', margin: 0 }}>{escala.grupo}</p>
                        <p style={{ fontSize: 12, color: '#94a3b8', margin: 0 }}>{formatarData(escala.data)}</p>
                      </div>
                      <span className="col-extra" style={{ fontSize: 13, color: '#475569' }}>{escala.local_texto}</span>
                      <span className="col-extra" style={{ fontSize: 13, color: '#475569' }}>{escala.hora_inicio}</span>
                      <span style={{
                        fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 999, display: 'inline-block',
                        background: escala.registrada ? '#dcfce7' : '#fef9c3',
                        color: escala.registrada ? '#16a34a' : '#854d0e',
                      }}>
                        {escala.registrada ? 'Registrada' : 'Sem registro'}
                      </span>
                    </div>
                  ))}
                </div>
              )
            )}

            {/* Registros */}
            {aba === 'registros' && (
              registros.length === 0 ? (
                <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', padding: 48, textAlign: 'center' }}>
                  <p style={{ fontSize: 36, marginBottom: 12 }}>📋</p>
                  <p style={{ color: '#64748b', fontSize: 14 }}>Nenhum registro em {meses[mes]} {ano}</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {registros.map(registro => {
                    const resumo = resumoMembros(registro.membros_presentes)
                    return (
                      <div key={registro.id} style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', padding: 20 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
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
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
                          <div>
                            <p style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', letterSpacing: 1, margin: '0 0 4px' }}>AUTORIZOU</p>
                            <p style={{ fontSize: 13, color: '#475569', margin: 0 }}>{registro.quem_autorizou || '—'}</p>
                          </div>
                          <div>
                            <p style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', letterSpacing: 1, margin: '0 0 4px' }}>MEMBROS</p>
                            {resumo.length > 0 ? resumo.map(([grupo, total]) => (
                              <p key={grupo} style={{ fontSize: 13, color: '#475569', margin: 0 }}>{total} — {grupo}</p>
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
                      </div>
                    )
                  })}
                </div>
              )
            )}

            {/* Confirmações */}
            {aba === 'confirmacoes' && (
              confirmacoes.length === 0 ? (
                <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', padding: 48, textAlign: 'center' }}>
                  <p style={{ fontSize: 36, marginBottom: 12 }}>✅</p>
                  <p style={{ color: '#64748b', fontSize: 14 }}>Nenhuma confirmação anterior em {meses[mes]} {ano}</p>
                </div>
              ) : (
                <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
                  <div style={{ padding: '10px 20px', background: '#f8fafc', borderBottom: '1px solid #f1f5f9', display: 'grid', gridTemplateColumns: '1fr 180px 120px' }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', letterSpacing: 1 }}>ESCALA</span>
                    <span className="col-extra" style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', letterSpacing: 1 }}>DATA</span>
                    <span style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', letterSpacing: 1 }}>STATUS</span>
                  </div>
                  {confirmacoes.map((escala, idx) => (
                    <div key={escala.id} className="hist-row" style={{
                      display: 'grid', gridTemplateColumns: '1fr 180px 120px',
                      padding: '14px 20px', borderBottom: idx < confirmacoes.length - 1 ? '1px solid #f1f5f9' : 'none',
                      alignItems: 'center', transition: 'background 0.15s',
                    }}>
                      <div>
                        <p style={{ fontSize: 14, fontWeight: 600, color: '#1e293b', margin: 0 }}>{escala.grupo}</p>
                        <p style={{ fontSize: 12, color: '#94a3b8', margin: 0 }}>{escala.local_texto}</p>
                      </div>
                      <span className="col-extra" style={{ fontSize: 13, color: '#475569' }}>{formatarData(escala.data)}</span>
                      <span style={{
                        fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 999, display: 'inline-block',
                        background: escala.confirmacao_aberta ? '#dcfce7' : '#f1f5f9',
                        color: escala.confirmacao_aberta ? '#16a34a' : '#64748b',
                      }}>
                        {escala.confirmacao_aberta ? 'Aberta' : 'Encerrada'}
                      </span>
                    </div>
                  ))}
                </div>
              )
            )}
          </>
        )}
      </div>
    </div>
  )
}