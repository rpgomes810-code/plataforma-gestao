export const dynamic = 'force-dynamic'

import { createClient } from '@supabase/supabase-js'
import FiltroRelatorio from './FiltroRelatorio'
import CardsPresenca from './CardsPresenca'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

function getPeriodo(periodo: string) {
  const hoje = new Date()
  const fim = new Date(hoje)
  fim.setHours(23, 59, 59, 999)
  let inicio = new Date(hoje)

  switch (periodo) {
    case 'mes_atual': inicio = new Date(hoje.getFullYear(), hoje.getMonth(), 1); break
    case 'mes_anterior':
      inicio = new Date(hoje.getFullYear(), hoje.getMonth() - 1, 1)
      fim.setTime(new Date(hoje.getFullYear(), hoje.getMonth(), 0).getTime())
      break
    case 'bimestre': inicio.setMonth(hoje.getMonth() - 2); break
    case 'trimestre': inicio.setMonth(hoje.getMonth() - 3); break
    case 'semestre': inicio.setMonth(hoje.getMonth() - 6); break
    case 'ano': inicio.setFullYear(hoje.getFullYear() - 1); break
    default: inicio = new Date(0)
  }

  return {
    inicio: inicio.toISOString().split('T')[0],
    fim: fim.toISOString().split('T')[0],
  }
}

function avaliarGrupo(membros: any[]) {
  const violinos = membros.filter(m => m.instrumento === 'Violino').length
  const violas = membros.filter(m => m.instrumento === 'Viola').length
  const violoncelos = membros.filter(m => m.instrumento === 'Violoncelo').length
  const vocais = membros.filter(m => m.instrumento === 'Vocal' || m.instrumento === 'Voz').length
  const temOrganizador = membros.some(m => m.perfil === 'Organizador')

  const ideal = violinos >= 3 && violas >= 1 && violoncelos >= 1 && vocais >= 2 && temOrganizador
  const aceitavel1 = violinos >= 2 && violas >= 1 && violoncelos >= 1 && vocais >= 2 && temOrganizador
  const aceitavel2 = violinos >= 3 && violoncelos >= 1 && vocais >= 2 && temOrganizador
  const totalIdealNum = 7
  const totalAtual = violinos + violas + violoncelos + vocais

  let label: string
  let cor: string
  let bg: string

  if (ideal) {
    label = 'Excelente'; cor = '#16a34a'; bg = '#dcfce7'
  } else if (aceitavel1 || aceitavel2) {
    label = 'Aceitável'; cor = '#d97706'; bg = '#fff7ed'
  } else if (totalAtual > totalIdealNum) {
    label = 'Excedente'; cor = '#7c3aed'; bg = '#f5f3ff'
  } else {
    label = 'Necessita Reforço'; cor = '#dc2626'; bg = '#fee2e2'
  }

  return { violinos, violas, violoncelos, vocais, temOrganizador, label, cor, bg, totalAtual }
}

export default async function Relatorios({ searchParams }: { searchParams: Promise<{ periodo?: string, inicio?: string, fim?: string }> }) {
  const params = await searchParams
  const periodo = params.periodo || 'mes_atual'

  let dataInicio: string
  let dataFim: string

  if (periodo === 'personalizado' && params.inicio && params.fim) {
    dataInicio = params.inicio
    dataFim = params.fim
  } else {
    const datas = getPeriodo(periodo)
    dataInicio = datas.inicio
    dataFim = datas.fim
  }

  const { data: registros } = await supabase
    .from('registros').select('*, hospitais(nome)')
    .gte('data', dataInicio).lte('data', dataFim)
    .order('data', { ascending: false })

  const { data: membros } = await supabase
    .from('membros').select('*').eq('status', 'Ativo').order('nome', { ascending: true })

  const { data: escalas } = await supabase
    .from('escalas').select('id, data, grupo, local_texto, registrada')
    .gte('data', dataInicio).lte('data', dataFim)

  const escalasIds = (escalas || []).map(e => e.id)

  const { data: confirmacoes } = escalasIds.length > 0 ? await supabase
    .from('confirmacoes').select('*, membros!confirmacoes_membro_id_fkey(nome, grupo)')
    .in('escala_id', escalasIds) : { data: [] }

  type SituacaoMembro = { nome: string; grupo: string; escala: string; data: string }
  const confirmouMasNaoFoi: SituacaoMembro[] = []
  const naoConfirmouMasFoi: SituacaoMembro[] = []
  const faltou: SituacaoMembro[] = []

  ;(escalas || []).filter(e => e.registrada).forEach(escala => {
    const registro = (registros || []).find(r => r.escala_id === escala.id)
    if (!registro) return
    const membrosDoGrupo = (membros || []).filter(m => m.grupo === escala.grupo)
    const membrosPresentes = (registro.membros_presentes || '').split(',').map((n: string) => n.trim()).filter(Boolean)
    membrosDoGrupo.forEach(membro => {
      const confirmacao = (confirmacoes || []).find((c: any) => c.membro_id === membro.id && c.escala_id === escala.id)
      const confirmou = confirmacao?.status === 'confirmado'
      const dispensado = confirmacao?.status === 'dispensado'
      const foi = membrosPresentes.includes(membro.nome)
      if (dispensado) return
      const item = { nome: membro.nome, grupo: membro.grupo || '—', escala: `${escala.grupo} — ${escala.local_texto}`, data: escala.data }
      if (confirmou && !foi) confirmouMasNaoFoi.push(item)
      else if (!confirmou && foi) naoConfirmouMasFoi.push(item)
      else if (!confirmou && !foi) faltou.push(item)
    })
  })

  const totalRegistros = (registros || []).length
  const totalMembros = (membros || []).length
  const totalHinos = (registros || []).reduce((acc, r) => acc + (r.hinos_executados || 0), 0)
  const totalOracoes = (registros || []).filter(r => r.teve_oracao).length

  const porHospital: Record<string, number> = {}
  ;(registros || []).forEach(r => {
    const nome = r.hospitais?.nome || 'Desconhecido'
    porHospital[nome] = (porHospital[nome] || 0) + 1
  })
  const hospitalOrdenado = Object.entries(porHospital).sort((a, b) => b[1] - a[1])

  const presenca: Record<string, number> = {}
  ;(registros || []).forEach(r => {
    if (!r.membros_presentes) return
    r.membros_presentes.split(',').forEach((nome: string) => {
      const n = nome.trim()
      if (n) presenca[n] = (presenca[n] || 0) + 1
    })
  })
  const presencaOrdenada = Object.entries(presenca).sort((a, b) => b[1] - a[1])
  const maisPresentes = presencaOrdenada.slice(0, 5)
  const menosPresentes = [...presencaOrdenada].reverse().slice(0, 5)
  const maxPresenca = maisPresentes[0]?.[1] || 1

  const porGrupo: Record<string, number> = {}
  ;(membros || []).forEach(m => { const g = m.grupo || 'Sem grupo'; porGrupo[g] = (porGrupo[g] || 0) + 1 })

  const porPerfil: Record<string, number> = {}
  ;(membros || []).forEach(m => { const p = m.perfil || 'Sem perfil'; porPerfil[p] = (porPerfil[p] || 0) + 1 })

  const porInstrumento: Record<string, number> = {}
  ;(membros || []).forEach(m => {
    const inst = m.instrumento
    if (!inst || inst === 'Nenhum') return
    porInstrumento[inst] = (porInstrumento[inst] || 0) + 1
  })
  const totalInstrumentos = Object.values(porInstrumento).reduce((a, b) => a + b, 0)
  const instrumentosOrdenados = Object.entries(porInstrumento).sort((a, b) => b[1] - a[1])

  const novosNoPeriodo = (membros || []).filter(m => {
    if (!m.criado_em) return false
    const d = m.criado_em.split('T')[0]
    return d >= dataInicio && d <= dataFim
  })

  const GRUPOS_ADMIN = ['Administradores', 'Atendentes']
  const gruposUnicos = [...new Set((membros || []).map(m => m.grupo).filter(Boolean))].filter(g => !GRUPOS_ADMIN.includes(g)).sort()
  const statusGrupos = gruposUnicos.map(grupo => {
    const membrosDoGrupo = (membros || []).filter(m => m.grupo === grupo)
    return { grupo, ...avaliarGrupo(membrosDoGrupo) }
  })

  const totalExcelente = statusGrupos.filter(g => g.label === 'Excelente').length
  const totalAceitavel = statusGrupos.filter(g => g.label === 'Aceitável').length
  const totalReforco = statusGrupos.filter(g => g.label === 'Necessita Reforço').length
  const totalExcedente = statusGrupos.filter(g => g.label === 'Excedente').length

  const nomePeriodo: Record<string, string> = {
    mes_atual: 'Mês atual', mes_anterior: 'Mês anterior', bimestre: 'Último bimestre',
    trimestre: 'Último trimestre', semestre: 'Último semestre', ano: 'Último ano', personalizado: 'Período personalizado',
  }

  const card: React.CSSProperties = {
    background: '#fff', borderRadius: 14, border: '1px solid #e2e8f0',
    boxShadow: '0 1px 3px rgba(0,0,0,0.06)', padding: '20px 24px',
  }

  const resumoCards = [
    { valor: totalRegistros, label: 'ATENDIMENTOS', cor: '#2563eb', bg: '#eff6ff', icon: '🏥' },
    { valor: totalMembros, label: 'MEMBROS ATIVOS', cor: '#16a34a', bg: '#dcfce7', icon: '👥' },
    { valor: totalHinos, label: 'HINOS EXECUTADOS', cor: '#7c3aed', bg: '#f5f3ff', icon: '🎵' },
    { valor: totalOracoes, label: 'ATEND. C/ ORAÇÃO', cor: '#d97706', bg: '#fff7ed', icon: '🙏' },
  ]

  return (
    <div style={{ background: '#f1f5f9', minHeight: '100vh', padding: '28px 40px' }} className="rel-wrap">
      <style>{`
        @media (max-width: 768px) {
          .rel-wrap { padding: 16px !important; }
          .rel-header { flex-direction: column !important; align-items: flex-start !important; }
          .rel-cards { grid-template-columns: 1fr 1fr !important; }
          .rel-grid { grid-template-columns: 1fr !important; }
          .grupos-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      <div style={{ maxWidth: 1280, margin: '0 auto' }}>

        {/* Header */}
        <div className="rel-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, gap: 16 }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: '#1e293b', margin: 0 }}>Relatórios</h1>
            <p style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>
              {nomePeriodo[periodo]} · {dataInicio} até {dataFim}
            </p>
          </div>
          <FiltroRelatorio periodoAtual={periodo} inicioAtual={params.inicio} fimAtual={params.fim} />
        </div>

        {/* Cards resumo */}
        <div className="rel-cards" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}>
          {resumoCards.map((c, i) => (
            <div key={i} style={{ ...card, display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ width: 48, height: 48, borderRadius: 12, background: c.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span style={{ fontSize: 22 }}>{c.icon}</span>
              </div>
              <div>
                <p style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', letterSpacing: 1, textTransform: 'uppercase', margin: '0 0 4px' }}>{c.label}</p>
                <p style={{ fontSize: 28, fontWeight: 800, color: c.cor, margin: 0, lineHeight: 1 }}>{c.valor}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Cards presença unificado */}
        <CardsPresenca
          confirmouMasNaoFoi={confirmouMasNaoFoi}
          naoConfirmouMasFoi={naoConfirmouMasFoi}
          faltou={faltou}
        />

        {/* Status dos Grupos — Accordion */}
        <div style={{ ...card, marginBottom: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
            <div>
              <h3 style={{ fontSize: 15, fontWeight: 800, color: '#1e293b', margin: '0 0 4px' }}>🎻 Status dos Grupos</h3>
              <p style={{ fontSize: 12, color: '#94a3b8', margin: 0 }}>{statusGrupos.length} grupos monitorados</p>
            </div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {[
                { label: `${totalExcelente} Excelente`, cor: '#16a34a', bg: '#dcfce7' },
                { label: `${totalAceitavel} Aceitável`, cor: '#d97706', bg: '#fff7ed' },
                { label: `${totalReforco} Necessita Reforço`, cor: '#dc2626', bg: '#fee2e2' },
                { label: `${totalExcedente} Excedente`, cor: '#7c3aed', bg: '#f5f3ff' },
              ].map(s => (
                <span key={s.label} style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 999, background: s.bg, color: s.cor }}>
                  {s.label}
                </span>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {statusGrupos.map(g => (
              <details key={g.grupo} style={{ borderRadius: 10, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                <summary style={{
                  padding: '12px 16px', cursor: 'pointer', listStyle: 'none',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  background: '#f8fafc',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: '#1e293b' }}>{g.grupo}</span>
                    <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 999, background: g.bg, color: g.cor }}>
                      {g.label}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ fontSize: 12, color: '#94a3b8' }}>
                      {g.violinos}V · {g.violas}Va · {g.violoncelos}Vc · {g.vocais}Vo
                    </span>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="6 9 12 15 18 9"/>
                    </svg>
                  </div>
                </summary>
                <div style={{ padding: '14px 16px', background: '#fff', borderTop: '1px solid #f1f5f9' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 10 }}>
                    {[
                      { label: 'Violino', valor: g.violinos, ideal: 3 },
                      { label: 'Viola', valor: g.violas, ideal: 1 },
                      { label: 'Violoncelo', valor: g.violoncelos, ideal: 1 },
                      { label: 'Vocal', valor: g.vocais, ideal: 2 },
                    ].map(item => (
                      <div key={item.label} style={{ textAlign: 'center', padding: '12px 8px', borderRadius: 10, background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                        <p style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.5, margin: '0 0 6px' }}>{item.label}</p>
                        <p style={{
                          fontSize: 22, fontWeight: 800, margin: '0 0 2px',
                          color: item.valor >= item.ideal ? '#16a34a' : item.valor > 0 ? '#d97706' : '#dc2626',
                        }}>{item.valor}</p>
                        <p style={{ fontSize: 11, color: '#94a3b8', margin: 0 }}>de {item.ideal}</p>
                      </div>
                    ))}
                    <div style={{ textAlign: 'center', padding: '12px 8px', borderRadius: 10, background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                      <p style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.5, margin: '0 0 6px' }}>Organizador</p>
                      <p style={{ fontSize: 22, margin: '0 0 2px' }}>{g.temOrganizador ? '✅' : '❌'}</p>
                      <p style={{ fontSize: 11, color: g.temOrganizador ? '#16a34a' : '#dc2626', margin: 0, fontWeight: 600 }}>
                        {g.temOrganizador ? 'Sim' : 'Não'}
                      </p>
                    </div>
                  </div>
                </div>
              </details>
            ))}
          </div>
        </div>

        {/* Gráficos */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 12 }}>

          {/* Linha 1: Atendimentos por hospital + Novos membros */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }} className="rel-grid">
            <div style={card}>
              <h3 style={{ fontSize: 13, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1, margin: '0 0 16px' }}>🏥 Atendimentos por hospital</h3>
              {hospitalOrdenado.length === 0 ? (
                <p style={{ fontSize: 13, color: '#94a3b8' }}>Nenhum atendimento no período</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {hospitalOrdenado.map(([nome, total]) => (
                    <div key={nome}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                        <span style={{ fontSize: 13, fontWeight: 600, color: '#334155' }}>{nome}</span>
                        <span style={{ fontSize: 12, fontWeight: 700, color: '#2563eb' }}>{total}</span>
                      </div>
                      <div style={{ background: '#f1f5f9', borderRadius: 999, height: 6 }}>
                        <div style={{ background: '#2563eb', height: 6, borderRadius: 999, width: `${(total / (hospitalOrdenado[0][1] || 1)) * 100}%`, transition: 'width 0.3s' }} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div style={card}>
              <h3 style={{ fontSize: 13, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1, margin: '0 0 16px' }}>🆕 Novos membros no período</h3>
              {novosNoPeriodo.length === 0 ? (
                <p style={{ fontSize: 13, color: '#94a3b8' }}>Nenhum membro adicionado no período</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {novosNoPeriodo.map((m: any) => (
                    <div key={m.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #f1f5f9' }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: '#334155' }}>{m.nome}</span>
                      <span style={{ fontSize: 11, color: '#94a3b8' }}>{m.criado_em ? new Date(m.criado_em).toLocaleDateString('pt-BR') : '—'}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Linha 2: Mais presentes + Menos frequentes */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }} className="rel-grid">
            <div style={card}>
              <h3 style={{ fontSize: 13, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1, margin: '0 0 16px' }}>⭐ Mais presentes</h3>
              {maisPresentes.length === 0 ? (
                <p style={{ fontSize: 13, color: '#94a3b8' }}>Nenhum atendimento no período</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {maisPresentes.map(([nome, total]) => (
                    <div key={nome}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                        <span style={{ fontSize: 13, fontWeight: 600, color: '#334155' }}>{nome}</span>
                        <span style={{ fontSize: 12, fontWeight: 700, color: '#16a34a' }}>{total}x</span>
                      </div>
                      <div style={{ background: '#f1f5f9', borderRadius: 999, height: 6 }}>
                        <div style={{ background: '#16a34a', height: 6, borderRadius: 999, width: `${(total / maxPresenca) * 100}%`, transition: 'width 0.3s' }} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div style={card}>
              <h3 style={{ fontSize: 13, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1, margin: '0 0 16px' }}>⚠️ Menos frequentes</h3>
              {menosPresentes.length === 0 ? (
                <p style={{ fontSize: 13, color: '#94a3b8' }}>Nenhum atendimento no período</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {menosPresentes.map(([nome, total]) => (
                    <div key={nome}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                        <span style={{ fontSize: 13, fontWeight: 600, color: '#334155' }}>{nome}</span>
                        <span style={{ fontSize: 12, fontWeight: 700, color: '#d97706' }}>{total}x</span>
                      </div>
                      <div style={{ background: '#f1f5f9', borderRadius: 999, height: 6 }}>
                        <div style={{ background: '#d97706', height: 6, borderRadius: 999, width: `${(total / maxPresenca) * 100}%`, transition: 'width 0.3s' }} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Linha 3: Grupos / Perfil / Instrumento */}
          <div style={{ ...card, gridColumn: '1 / -1' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)' }} className="tres-cols">
              <style>{`@media (max-width: 768px) { .tres-cols { grid-template-columns: 1fr !important; } .rel-grid { grid-template-columns: 1fr !important; } }`}</style>
              {[
                {
                  titulo: '🎻 Membros por grupo',
                  itens: Object.entries(porGrupo),
                  cor: '#2563eb', bg: '#eff6ff',
                  renderValor: (total: number) => `${total} membro${total > 1 ? 's' : ''}`,
                },
                {
                  titulo: '👥 Membros por perfil',
                  itens: Object.entries(porPerfil),
                  cor: '#7c3aed', bg: '#f5f3ff',
                  renderValor: (total: number) => `${total}`,
                },
                {
                  titulo: '🎼 Por instrumento',
                  itens: instrumentosOrdenados,
                  cor: '#d97706', bg: '#fff7ed',
                  renderValor: (total: number) => `${total} (${Math.round((total / totalInstrumentos) * 100)}%)`,
                },
              ].map((secao, idx) => (
                <div key={secao.titulo} style={{
                  borderLeft: idx > 0 ? '1px solid #f1f5f9' : 'none',
                  padding: idx > 0 ? '0 0 0 24px' : '0 24px 0 0',
                }}>
                  <h3 style={{ fontSize: 13, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1, margin: '0 0 12px' }}>{secao.titulo}</h3>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    {secao.itens.map(([label, total]) => (
                      <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #f1f5f9' }}>
                        <span style={{ fontSize: 13, fontWeight: 600, color: '#334155' }}>{label}</span>
                        <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 999, background: secao.bg, color: secao.cor }}>
                          {secao.renderValor(total as number)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
         </div>     
       </div>
      </div>
    </div>
    </div>
  )
}