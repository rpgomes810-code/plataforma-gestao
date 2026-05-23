'use client'

import { useEffect, useState } from 'react'

export default function Dashboard() {
  const [membro, setMembro] = useState<any>(null)
  const [vagas, setVagas] = useState<any[]>([])
  const [stats, setStats] = useState<any>(null)
  const [hospitais, setHospitais] = useState<any[]>([])
  const [escalasTotal, setEscalasTotal] = useState<any[]>([])
  const [registrosGrafico, setRegistrosGrafico] = useState<any[]>([])
  const [registrosHospitais, setRegistrosHospitais] = useState<any[]>([])
  const [aberto, setAberto] = useState<Record<string, boolean>>({})
  const [notificacaoAtiva, setNotificacaoAtiva] = useState<boolean | null>(null)
  const [calMes, setCalMes] = useState(new Date().getMonth())
  const [calAno, setCalAno] = useState(new Date().getFullYear())
  const [diaPopup, setDiaPopup] = useState<number | null>(null)
  const [isMobile, setIsMobile] = useState(false)
  const toggle = (key: string) => setAberto(prev => ({ ...prev, [key]: !prev[key] }))

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  useEffect(() => {
    fetch('/api/confirmacoes/pagina').then(r => r.json()).then(d => {
      setMembro(d.membroLogado)
      const todosMembros = d.todosMembros || []
      const escalas = d.escalas || []
      const porTipo: Record<string, number> = {}
      todosMembros.forEach((m: any) => { porTipo[m.tipo || 'Outro'] = (porTipo[m.tipo || 'Outro'] || 0) + 1 })
      const porGrupo: Record<string, number> = {}
      escalas.forEach((e: any) => { porGrupo[e.grupo || 'Sem grupo'] = (porGrupo[e.grupo || 'Sem grupo'] || 0) + 1 })
      setStats({ totalMembros: todosMembros.length, porTipo, totalEscalas: escalas.length, porGrupo })
      setEscalasTotal(escalas)
    })
    fetch('/api/vagas').then(r => r.json()).then(setVagas)
    fetch('/api/hospitais').then(r => r.json()).then(data => { if (Array.isArray(data)) setHospitais(data) })
    fetch('/api/grafico').then(r => r.json()).then(data => { if (Array.isArray(data)) setRegistrosGrafico(data) })
    fetch('/api/grafico-hospitais').then(r => r.json()).then(data => { if (Array.isArray(data)) setRegistrosHospitais(data) })
    if ('Notification' in window) setNotificacaoAtiva(Notification.permission === 'granted')
  }, [])

  const mesesNomes = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez']
  const mesesCompletos = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro']
  const diasSemana = ['DOM','SEG','TER','QUA','QUI','SEX','SÁB']
  const hoje = new Date()

  const ultimos12 = Array.from({ length: 12 }, (_, i) => {
    const d = new Date(hoje.getFullYear(), hoje.getMonth() - (11 - i), 1)
    const total = registrosGrafico.filter(r => {
      const rd = new Date(r.data + 'T12:00:00')
      return rd.getMonth() === d.getMonth() && rd.getFullYear() === d.getFullYear()
    }).length
    return { label: mesesNomes[d.getMonth()], total }
  })
  const maxGrafico = Math.max(...ultimos12.map(m => m.total), 1)

  const totalEscalasMes = escalasTotal.length
  const escalasRegistradas = escalasTotal.filter((e: any) => e.registrada).length
  const escalasPendentes = escalasTotal.filter((e: any) => !e.registrada)

  const porHospital: Record<string, number> = {}
  registrosHospitais.forEach(r => {
    const nome = r.hospitais?.nome || 'Desconhecido'
    porHospital[nome] = (porHospital[nome] || 0) + 1
  })
  const dadosHospital = Object.entries(porHospital).sort((a, b) => b[1] - a[1])
  const maxHospital = Math.max(...dadosHospital.map(([, v]) => v), 1)

  const primeiroDia = new Date(calAno, calMes, 1).getDay()
  const diasNoMes = new Date(calAno, calMes + 1, 0).getDate()
  const escalasPorDia: Record<number, any[]> = {}
  escalasTotal.forEach((e: any) => {
    const d = new Date(e.data + 'T12:00:00')
    if (d.getMonth() === calMes && d.getFullYear() === calAno) {
      const dia = d.getDate()
      if (!escalasPorDia[dia]) escalasPorDia[dia] = []
      escalasPorDia[dia].push(e)
    }
  })

  const formatarData = (data: string) => {
    const d = new Date(data + 'T12:00:00')
    return `${d.getDate().toString().padStart(2,'0')}/${(d.getMonth()+1).toString().padStart(2,'0')}`
  }

  const cardStyle = {
    background: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: 12,
    padding: 20,
    boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
  }

  const cards = [
    {
      key: 'membros',
      valor: stats?.totalMembros || '—',
      label: 'Membros',
      cor: '#1e40af',
      bgIcon: '#eff6ff',
      icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1e40af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
      detalhes: Object.entries(stats?.porTipo || {}).map(([tipo, total]: any) => `${total} ${tipo}`),
    },
    {
      key: 'escalas',
      valor: stats?.totalEscalas || '—',
      label: 'Escalas abertas',
      cor: '#059669',
      bgIcon: '#ecfdf5',
      icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
      detalhes: Object.entries(stats?.porGrupo || {}).sort((a: any, b: any) => (parseInt(a[0].replace(/\D/g, '')) || 0) - (parseInt(b[0].replace(/\D/g, '')) || 0)).map(([grupo, total]: any) => `${grupo}: ${total}`),
    },
    {
      key: 'registros',
      valor: `${escalasRegistradas}/${totalEscalasMes}`,
      label: 'Registros efetuados',
      cor: '#d97706',
      bgIcon: '#fffbeb',
      icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>,
      detalhes: escalasPendentes.map((e: any) => `${e.local_texto || e.hospitais?.nome || '—'} · ${formatarData(e.data)}`),
    },
    {
      key: 'hospitais',
      valor: hospitais.length || '—',
      label: 'Hospitais',
      cor: '#7c3aed',
      bgIcon: '#f5f3ff',
      icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
      detalhes: hospitais.map((h: any) => h.nome),
    },
  ]

  return (
    <div style={{ padding: '24px', minHeight: '100vh', background: '#f1f5f9', boxSizing: 'border-box', overflowX: 'hidden', fontFamily: "'Inter', sans-serif" }}>

      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <p style={{ color: '#64748b', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0, fontWeight: 600 }}>Bem-vindo de volta</p>
        <h2 style={{ color: '#0f172a', fontSize: 28, fontWeight: 800, margin: '4px 0 0' }}>{membro?.nome || '...'}</h2>
      </div>

      {/* Vagas */}
      {vagas.length > 0 && (
        <a href="/dashboard/vagas" style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '14px 20px', borderRadius: 12, marginBottom: 24,
          background: 'linear-gradient(135deg, #d97706, #f59e0b)',
          textDecoration: 'none', boxShadow: '0 4px 12px rgba(217,119,6,0.25)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
              <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
            <div>
              <p style={{ color: 'white', fontWeight: 800, fontSize: 14, margin: 0 }}>{vagas.length} vaga{vagas.length > 1 ? 's' : ''} aberta{vagas.length > 1 ? 's' : ''}</p>
              <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: 12, margin: 0, fontWeight: 500 }}>Clique para ver e preencher</p>
            </div>
          </div>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
        </a>
      )}

      {/* Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {cards.map(card => (
          <div key={card.key} style={cardStyle}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: card.bgIcon, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {card.icon}
              </div>
              <button onClick={() => toggle(card.key)} style={{ color: '#94a3b8', background: 'none', border: 'none', cursor: 'pointer' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  {aberto[card.key] ? <polyline points="18 15 12 9 6 15"/> : <polyline points="6 9 12 15 18 9"/>}
                </svg>
              </button>
            </div>
            <p style={{ color: card.cor, fontSize: 32, fontWeight: 800, margin: '0 0 2px' }}>{card.valor}</p>
            <p style={{ color: '#64748b', fontSize: 12, fontWeight: 600, margin: 0 }}>{card.label}</p>
            {aberto[card.key] && (
              <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid #f1f5f9' }}>
                {card.detalhes.length > 0
                  ? card.detalhes.map((d, i) => <p key={i} style={{ color: '#475569', fontSize: 12, margin: '0 0 4px', fontWeight: 500 }}>• {d}</p>)
                  : <p style={{ color: '#94a3b8', fontSize: 12, margin: 0 }}>Nenhum pendente ✅</p>
                }
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Calendário */}
      <div style={{ ...cardStyle, marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div>
            <p style={{ color: '#64748b', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0, fontWeight: 700 }}>Agenda de Escalas</p>
            <h3 style={{ color: '#0f172a', fontSize: 18, fontWeight: 800, margin: '2px 0 0' }}>{mesesCompletos[calMes]} {calAno}</h3>
          </div>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <button onClick={() => { if (calMes === 0) { setCalMes(11); setCalAno(calAno - 1) } else setCalMes(calMes - 1) }}
              style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid #e2e8f0', background: '#fff', cursor: 'pointer', color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
            </button>
            <button onClick={() => { setCalMes(hoje.getMonth()); setCalAno(hoje.getFullYear()) }}
              style={{ padding: '0 12px', height: 32, borderRadius: 8, border: '1px solid #e2e8f0', background: '#fff', cursor: 'pointer', color: '#1e40af', fontSize: 12, fontWeight: 700 }}>HOJE</button>
            <button onClick={() => { if (calMes === 11) { setCalMes(0); setCalAno(calAno + 1) } else setCalMes(calMes + 1) }}
              style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid #e2e8f0', background: '#fff', cursor: 'pointer', color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>
            </button>
          </div>
        </div>

        {/* Dias da semana */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', marginBottom: 8 }}>
          {diasSemana.map(d => (
            <div key={d} style={{ textAlign: 'center', fontSize: 11, fontWeight: 700, color: '#94a3b8', padding: '6px 0', letterSpacing: '0.05em' }}>{d}</div>
          ))}
        </div>

        {/* Dias */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
          {Array.from({ length: primeiroDia }).map((_, i) => <div key={`e-${i}`} />)}
          {Array.from({ length: diasNoMes }, (_, i) => i + 1).map(dia => {
            const escalasNoDia = escalasPorDia[dia] || []
            const temEscala = escalasNoDia.length > 0
            const ehHoje = dia === hoje.getDate() && calMes === hoje.getMonth() && calAno === hoje.getFullYear()
            const popupAberto = diaPopup === dia

            return (
              <div key={dia} style={{ position: 'relative', textAlign: 'center', padding: '8px 4px' }}
                onMouseEnter={() => !isMobile && temEscala && setDiaPopup(dia)}
                onMouseLeave={() => !isMobile && setDiaPopup(null)}
                onClick={() => isMobile && temEscala && setDiaPopup(popupAberto ? null : dia)}>

                <div style={{
                  width: 36, height: 36, borderRadius: '50%', margin: '0 auto',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  background: ehHoje ? '#1e3a5f' : temEscala ? '#1e3a5f' : 'transparent',
                  cursor: temEscala ? 'pointer' : 'default',
                  border: ehHoje && !temEscala ? '2px solid #1e3a5f' : 'none',
                }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: ehHoje || temEscala ? '#fff' : '#334155', lineHeight: 1 }}>{dia}</span>
                  {temEscala && (
                    <span style={{ fontSize: 9, fontWeight: 800, color: ehHoje ? '#93c5fd' : '#bfdbfe', lineHeight: 1 }}>{escalasNoDia.length}</span>
                  )}
                </div>

                {/* Popup */}
                {popupAberto && (
                  <div style={{
                    position: 'absolute', top: '100%', left: '50%', transform: 'translateX(-50%)',
                    zIndex: 50, background: '#fff', borderRadius: 10, padding: 12,
                    boxShadow: '0 8px 24px rgba(0,0,0,0.12)', border: '1px solid #e2e8f0',
                    minWidth: 180, textAlign: 'left',
                  }}>
                    <p style={{ color: '#1e3a5f', fontSize: 12, fontWeight: 800, margin: '0 0 8px' }}>
                      {dia} de {mesesCompletos[calMes]}
                    </p>
                    {escalasNoDia.map((e: any, idx: number) => (
                      <div key={idx} style={{ padding: '6px 0', borderTop: idx > 0 ? '1px solid #f1f5f9' : 'none' }}>
                        <p style={{ color: '#0f172a', fontSize: 12, fontWeight: 700, margin: '0 0 2px' }}>{e.grupo}</p>
                        <p style={{ color: '#64748b', fontSize: 11, margin: 0, fontWeight: 500 }}>{e.local_texto || '—'} · {e.hora_inicio}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Gráfico 12 meses */}
      <div style={{ ...cardStyle, marginBottom: 16, overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
          <div style={{ width: 4, height: 20, borderRadius: 2, background: 'linear-gradient(180deg, #3b82f6, #1e40af)' }}></div>
          <h3 style={{ color: '#0f172a', fontSize: 14, fontWeight: 800, margin: 0 }}>Atendimentos mensais — últimos 12 meses</h3>
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: 120 }}>
          {ultimos12.map((m, i) => (
            <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, minWidth: 0 }}>
              <span style={{ fontSize: 9, fontWeight: 700, color: m.total > 0 ? '#1e40af' : 'transparent' }}>{m.total > 0 ? m.total : '.'}</span>
              <div style={{
                width: '100%', borderRadius: '3px 3px 0 0',
                height: `${Math.max((m.total / maxGrafico) * 80, m.total > 0 ? 6 : 2)}px`,
                background: m.total > 0 ? 'linear-gradient(180deg, #60a5fa, #1e40af)' : '#f1f5f9'
              }} />
              <span style={{ fontSize: 8, color: '#94a3b8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', width: '100%', textAlign: 'center', fontWeight: 600 }}>{m.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Gráfico hospitais */}
      <div style={{ ...cardStyle, marginBottom: 24, overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
          <div style={{ width: 4, height: 20, borderRadius: 2, background: 'linear-gradient(180deg, #7c3aed, #a855f7)' }}></div>
          <h3 style={{ color: '#0f172a', fontSize: 14, fontWeight: 800, margin: 0 }}>Atendimentos por hospital — mês atual</h3>
        </div>
        {dadosHospital.length === 0 ? (
          <p style={{ color: '#94a3b8', fontSize: 14, fontWeight: 500 }}>Nenhum registro este mês.</p>
        ) : (
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 120 }}>
            {dadosHospital.map(([nome, total], i) => (
              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, minWidth: 0 }}>
                <span style={{ fontSize: 10, fontWeight: 700, color: '#7c3aed' }}>{total}</span>
                <div style={{ width: '100%', borderRadius: '3px 3px 0 0', height: `${Math.max((total / maxHospital) * 80, 8)}px`, background: 'linear-gradient(180deg, #a855f7, #7c3aed)' }} />
                <span style={{ fontSize: 9, color: '#94a3b8', textAlign: 'center', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', width: '100%', fontWeight: 600 }}>{nome}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Notificações */}
      {notificacaoAtiva !== null && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '12px 16px', borderRadius: 10, fontSize: 13, fontWeight: 600,
          background: notificacaoAtiva ? '#f0fdf4' : '#fef2f2',
          border: `1px solid ${notificacaoAtiva ? '#bbf7d0' : '#fecaca'}`,
          color: notificacaoAtiva ? '#15803d' : '#dc2626',
        }}>
          <span>{notificacaoAtiva ? '🔔' : '🔕'}</span>
          <span>{notificacaoAtiva ? 'Notificações ativadas' : 'Notificações desativadas — ative nas configurações do celular'}</span>
        </div>
      )}
    </div>
  )
}