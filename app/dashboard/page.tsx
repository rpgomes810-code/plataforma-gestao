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
    <div className="p-4 md:p-6 min-h-screen" style={{ background: '#0f172a' }}>

      {/* Header */}
      <div className="mb-6">
        <p className="text-xs uppercase tracking-widest mb-0.5" style={{ color: '#64748b' }}>Bem-vindo de volta</p>
        <h2 className="text-2xl font-bold" style={{ color: '#f1f5f9' }}>{membro?.nome || '...'}</h2>
      </div>

      {/* Vagas em destaque */}
      {vagas.length > 0 && (
        <a href="/dashboard/vagas" className="flex items-center justify-between px-5 py-4 rounded-2xl mb-6 transition hover:opacity-90"
          style={{ background: 'linear-gradient(135deg, #d97706, #f59e0b)' }}>
          <div className="flex items-center gap-3">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
              <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
            <div>
              <p className="font-bold text-sm text-white">{vagas.length} vaga{vagas.length > 1 ? 's' : ''} aberta{vagas.length > 1 ? 's' : ''}</p>
              <p className="text-xs text-white/70">Clique para ver e preencher</p>
            </div>
          </div>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
        </a>
      )}

      {/* Cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        {cards.map(card => (
          <div key={card.key} className="rounded-2xl p-5" style={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="flex items-center justify-between mb-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.05)' }}>
                {card.icon}
              </div>
              <button onClick={() => toggle(card.key)} style={{ color: '#475569' }} className="hover:text-blue-400 transition">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  {aberto[card.key] ? <polyline points="18 15 12 9 6 15"/> : <polyline points="6 9 12 15 18 9"/>}
                </svg>
              </button>
            </div>
            <p className="text-3xl font-bold mb-0.5" style={{ color: card.cor }}>{card.valor}</p>
            <p className="text-xs font-medium" style={{ color: '#64748b' }}>{card.label}</p>
            {aberto[card.key] && card.detalhes.length > 0 && (
              <div className="mt-3 pt-3 space-y-1" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                {card.detalhes.map((d, i) => (
                  <p key={i} className="text-xs" style={{ color: '#94a3b8' }}>{d}</p>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Gráfico 12 meses */}
      <div className="rounded-2xl p-6 mb-4" style={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="flex items-center gap-2 mb-5">
          <div className="w-1 h-5 rounded-full" style={{ background: 'linear-gradient(180deg, #60a5fa, #1e40af)' }}></div>
          <h3 className="text-sm font-bold" style={{ color: '#cbd5e1' }}>Atendimentos mensais — últimos 12 meses</h3>
        </div>
        <div className="flex items-end gap-1 md:gap-2 h-36">
          {ultimos12.map((m, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <span className="text-xs font-bold" style={{ color: m.total > 0 ? '#60a5fa' : 'transparent' }}>{m.total > 0 ? m.total : '.'}</span>
              <div className="w-full rounded-t-md transition-all"
                style={{
                  height: `${Math.max((m.total / maxGrafico) * 110, m.total > 0 ? 8 : 2)}px`,
                  background: m.total > 0 ? 'linear-gradient(180deg, #60a5fa, #1e40af)' : 'rgba(255,255,255,0.05)'
                }} />
              <span className="whitespace-nowrap" style={{ fontSize: '8px', color: '#475569' }}>{m.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Gráfico hospitais */}
      <div className="rounded-2xl p-6 mb-6" style={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="flex items-center gap-2 mb-5">
          <div className="w-1 h-5 rounded-full" style={{ background: 'linear-gradient(180deg, #c084fc, #7c3aed)' }}></div>
          <h3 className="text-sm font-bold" style={{ color: '#cbd5e1' }}>Atendimentos por hospital — mês atual</h3>
        </div>
        {dadosHospital.length === 0 ? (
          <p className="text-sm" style={{ color: '#475569' }}>Nenhum registro este mês.</p>
        ) : (
          <div className="flex items-end gap-2 h-36">
            {dadosHospital.map(([nome, total], i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-xs font-bold" style={{ color: '#c084fc' }}>{total}</span>
                <div className="w-full rounded-t-md transition-all"
                  style={{
                    height: `${Math.max((total / maxHospital) * 110, 8)}px`,
                    background: 'linear-gradient(180deg, #c084fc, #7c3aed)'
                  }} />
                <span className="text-center leading-tight" style={{ fontSize: '8px', color: '#475569' }}>{nome}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Notificações no final */}
      {notificacaoAtiva !== null && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium" style={{
          background: notificacaoAtiva ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.08)',
          border: `1px solid ${notificacaoAtiva ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'}`,
          color: notificacaoAtiva ? '#34d399' : '#f87171'
        }}>
          <span>{notificacaoAtiva ? '🔔' : '🔕'}</span>
          <span>{notificacaoAtiva ? 'Notificações ativadas' : 'Notificações desativadas — ative nas configurações do celular'}</span>
        </div>
      )}

    </div>
  )
}