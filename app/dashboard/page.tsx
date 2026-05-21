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
  const toggle = (key: string) => setAberto(prev => ({ ...prev, [key]: !prev[key] }))

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
  const hoje = new Date()
  const ultimos12 = Array.from({ length: 12 }, (_, i) => {
    const d = new Date(hoje.getFullYear(), hoje.getMonth() - (11 - i), 1)
    const total = registrosGrafico.filter(r => {
      const rd = new Date(r.data + 'T12:00:00')
      return rd.getMonth() === d.getMonth() && rd.getFullYear() === d.getFullYear()
    }).length
    return { label: `${mesesNomes[d.getMonth()]}/${String(d.getFullYear()).slice(2)}`, total }
  })
  const maxGrafico = Math.max(...ultimos12.map(m => m.total), 1)

  const totalEscalasMes = escalasTotal.length
  const escalasRegistradas = escalasTotal.filter((e: any) => e.registrada).length
  const porGrupoReg: Record<string, { total: number; registradas: number }> = {}
  escalasTotal.forEach((e: any) => {
    const g = e.grupo || 'Sem grupo'
    if (!porGrupoReg[g]) porGrupoReg[g] = { total: 0, registradas: 0 }
    porGrupoReg[g].total++
    if (e.registrada) porGrupoReg[g].registradas++
  })

  const porHospital: Record<string, number> = {}
  registrosHospitais.forEach(r => {
    const nome = r.hospitais?.nome || 'Desconhecido'
    porHospital[nome] = (porHospital[nome] || 0) + 1
  })
  const dadosHospital = Object.entries(porHospital).sort((a, b) => b[1] - a[1])
  const maxHospital = Math.max(...dadosHospital.map(([, v]) => v), 1)

  const cardStyle = {
    background: 'rgba(219,234,254,0.07)',
    border: '1px solid rgba(147,197,253,0.2)',
    borderRadius: 16,
    padding: 20,
  }

  const cards = [
    {
      key: 'membros',
      valor: stats?.totalMembros || '—',
      label: 'Membros',
      cor: '#60a5fa',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
        </svg>
      ),
      detalhes: Object.entries(stats?.porTipo || {}).map(([tipo, total]: any) => `${total} ${tipo}`),
    },
    {
      key: 'escalas',
      valor: stats?.totalEscalas || '—',
      label: 'Escalas abertas',
      cor: '#34d399',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/>
          <line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
        </svg>
      ),
      detalhes: Object.entries(stats?.porGrupo || {}).sort((a: any, b: any) => (parseInt(a[0].replace(/\D/g, '')) || 0) - (parseInt(b[0].replace(/\D/g, '')) || 0)).map(([grupo, total]: any) => `${grupo}: ${total}`),
    },
    {
      key: 'registros',
      valor: `${escalasRegistradas}/${totalEscalasMes}`,
      label: 'Registros',
      cor: '#fbbf24',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/>
          <line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/>
          <line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>
        </svg>
      ),
      detalhes: Object.entries(porGrupoReg).sort((a: any, b: any) => (parseInt(a[0].replace(/\D/g, '')) || 0) - (parseInt(b[0].replace(/\D/g, '')) || 0)).map(([grupo, val]: any) => `${grupo}: ${(val as any).registradas}/${(val as any).total}`),
    },
    {
      key: 'hospitais',
      valor: hospitais.length || '—',
      label: 'Hospitais',
      cor: '#c084fc',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#c084fc" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
          <polyline points="9 22 9 12 15 12 15 22"/>
        </svg>
      ),
      detalhes: hospitais.map((h: any) => h.nome),
    },
  ]

  return (
    <div style={{ padding: '24px', minHeight: '100vh', background: '#0f172a' }}>

      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <p style={{ color: '#64748b', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>Bem-vindo de volta</p>
        <h2 style={{ color: '#f1f5f9', fontSize: 24, fontWeight: 700, margin: 0 }}>{membro?.nome || '...'}</h2>
      </div>

      {/* Vagas */}
      {vagas.length > 0 && (
        <a href="/dashboard/vagas" style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '16px 20px', borderRadius: 16, marginBottom: 24,
          background: 'linear-gradient(135deg, #d97706, #f59e0b)',
          textDecoration: 'none',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
              <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
            <div>
              <p style={{ color: 'white', fontWeight: 700, fontSize: 14, margin: 0 }}>{vagas.length} vaga{vagas.length > 1 ? 's' : ''} aberta{vagas.length > 1 ? 's' : ''}</p>
              <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12, margin: 0 }}>Clique para ver e preencher</p>
            </div>
          </div>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
        </a>
      )}

      {/* Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16, marginBottom: 24 }}
        className="xl:grid-cols-4">
        {cards.map(card => (
          <div key={card.key} style={cardStyle}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {card.icon}
              </div>
              <button onClick={() => toggle(card.key)} style={{ color: '#475569', background: 'none', border: 'none', cursor: 'pointer' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  {aberto[card.key] ? <polyline points="18 15 12 9 6 15"/> : <polyline points="6 9 12 15 18 9"/>}
                </svg>
              </button>
            </div>
            <p style={{ color: card.cor, fontSize: 30, fontWeight: 700, margin: '0 0 4px' }}>{card.valor}</p>
            <p style={{ color: '#64748b', fontSize: 12, fontWeight: 500, margin: 0 }}>{card.label}</p>
            {aberto[card.key] && card.detalhes.length > 0 && (
              <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid rgba(147,197,253,0.1)' }}>
                {card.detalhes.map((d, i) => (
                  <p key={i} style={{ color: '#94a3b8', fontSize: 12, margin: '0 0 4px' }}>{d}</p>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Gráfico 12 meses */}
      <div style={{ ...cardStyle, marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
          <div style={{ width: 4, height: 20, borderRadius: 2, background: 'linear-gradient(180deg, #60a5fa, #1e40af)' }}></div>
          <h3 style={{ color: '#cbd5e1', fontSize: 13, fontWeight: 700, margin: 0 }}>Atendimentos mensais — últimos 12 meses</h3>
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: 140 }}>
          {ultimos12.map((m, i) => (
            <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
              <span style={{ fontSize: 10, fontWeight: 700, color: m.total > 0 ? '#60a5fa' : 'transparent' }}>{m.total > 0 ? m.total : '.'}</span>
              <div style={{
                width: '100%', borderRadius: '4px 4px 0 0',
                height: `${Math.max((m.total / maxGrafico) * 110, m.total > 0 ? 8 : 2)}px`,
                background: m.total > 0 ? 'linear-gradient(180deg, #60a5fa, #1e40af)' : 'rgba(147,197,253,0.05)'
              }} />
              <span style={{ fontSize: 8, color: '#475569', whiteSpace: 'nowrap' }}>{m.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Gráfico hospitais */}
      <div style={{ ...cardStyle, marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
          <div style={{ width: 4, height: 20, borderRadius: 2, background: 'linear-gradient(180deg, #c084fc, #7c3aed)' }}></div>
          <h3 style={{ color: '#cbd5e1', fontSize: 13, fontWeight: 700, margin: 0 }}>Atendimentos por hospital — mês atual</h3>
        </div>
        {dadosHospital.length === 0 ? (
          <p style={{ color: '#475569', fontSize: 14 }}>Nenhum registro este mês.</p>
        ) : (
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 140 }}>
            {dadosHospital.map(([nome, total], i) => (
              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                <span style={{ fontSize: 10, fontWeight: 700, color: '#c084fc' }}>{total}</span>
                <div style={{
                  width: '100%', borderRadius: '4px 4px 0 0',
                  height: `${Math.max((total / maxHospital) * 110, 8)}px`,
                  background: 'linear-gradient(180deg, #c084fc, #7c3aed)'
                }} />
                <span style={{ fontSize: 8, color: '#475569', textAlign: 'center' }}>{nome}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Notificações */}
      {notificacaoAtiva !== null && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '12px 16px', borderRadius: 12, fontSize: 13, fontWeight: 500,
          background: notificacaoAtiva ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.08)',
          border: `1px solid ${notificacaoAtiva ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'}`,
          color: notificacaoAtiva ? '#34d399' : '#f87171',
        }}>
          <span>{notificacaoAtiva ? '🔔' : '🔕'}</span>
          <span>{notificacaoAtiva ? 'Notificações ativadas' : 'Notificações desativadas — ative nas configurações do celular'}</span>
        </div>
      )}

    </div>
  )
}