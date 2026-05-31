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

  const totalIdeal = 3 + 1 + 1 + 2 // 7
  const totalAtual = violinos + violas + violoncelos + vocais

  let status: 'ideal' | 'aceitavel' | 'deficitario' | 'excesso'
  let label: string
  let cor: string
  let bg: string

  if (ideal) {
    status = 'ideal'; label = 'Ideal'; cor = '#16a34a'; bg = '#dcfce7'
  } else if (aceitavel1 || aceitavel2) {
    status = 'aceitavel'; label = 'Aceitável'; cor = '#d97706'; bg = '#fff7ed'
  } else if (totalAtual > totalIdeal) {
    status = 'excesso'; label = 'Em excesso'; cor = '#7c3aed'; bg = '#f5f3ff'
  } else {
    status = 'deficitario'; label = 'Deficitário'; cor = '#dc2626'; bg = '#fee2e2'
  }

  return { violinos, violas, violoncelos, vocais, temOrganizador, status, label, cor, bg, totalAtual }
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

  const porTipo: Record<string, number> = {}
  ;(membros || []).forEach(m => { const t = m.tipo || 'Sem tipo'; porTipo[t] = (porTipo[t] || 0) + 1 })

  const novosNoPeriodo = (membros || []).filter(m => {
    if (!m.criado_em) return false
    const d = m.criado_em.split('T')[0]
    return d >= dataInicio && d <= dataFim
  })

  // Status dos grupos
 const GRUPOS_ADMIN = ['Administradores', 'Atendentes']
 const gruposUnicos = [...new Set((membros || []).map(m => m.grupo).filter(Boolean))].filter(g => !GRUPOS_ADMIN.includes(g)).sort()
  const statusGrupos = gruposUnicos.map(grupo => {
    const membrosDoGrupo = (membros || []).filter(m => m.grupo === grupo)
    return { grupo, ...avaliarGrupo(membrosDoGrupo) }
  })

  const nomePeriodo: Record<string, string> = {
    mes_atual: 'Mês atual', mes_anterior: 'Mês anterior', bimestre: 'Último bimestre',
    trimestre: 'Último trimestre', semestre: 'Último semestre', ano: 'Último ano', personalizado: 'Período personalizado',
  }

  const cardStyle = {
    background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0',
    boxShadow: '0 1px 3px rgba(0,0,0,0.06)', padding: '20px 24px',
  }

  const totalIdeal = statusGrupos.filter(g => g.status === 'ideal').length
  const totalAceitavel = statusGrupos.filter(g => g.status === 'aceitavel').length
  const totalDeficitario = statusGrupos.filter(g => g.status === 'deficitario').length
  const totalExcesso = statusGrupos.filter(g => g.status === 'excesso').length

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
          {[
            { valor: totalRegistros, label: 'Atendimentos', cor: '#1e40af', bg: '#eff6ff' },
            { valor: totalMembros, label: 'Membros', cor: '#16a34a', bg: '#dcfce7' },
            { valor: totalHinos, label: 'Hinos executados', cor: '#7c3aed', bg: '#f5f3ff' },
            { valor: totalOracoes, label: 'Atend. c/ oração', cor: '#d97706', bg: '#fff7ed' },
          ].map((c, i) => (
            <div key={i} style={{ ...cardStyle, textAlign: 'center' }}>
              <div style={{ width: 48, height: 48, borderRadius: '50%', background: c.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px' }}>
                <span style={{ fontSize: 22, fontWeight: 800, color: c.cor }}>{c.valor}</span>
              </div>
              <p style={{ fontSize: 12, color: '#64748b', margin: 0, fontWeight: 600 }}>{c.label}</p>
            </div>
          ))}
        </div>

        {/* Cards presença */}
        <CardsPresenca
          confirmouMasNaoFoi={confirmouMasNaoFoi}
          naoConfirmouMasFoi={naoConfirmouMasFoi}
          faltou={faltou}
        />

        {/* STATUS DOS GRUPOS */}
        <div style={{ ...cardStyle, marginBottom: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: '#1e293b', margin: 0 }}>🎻 Status dos Grupos</h3>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {[
                { label: `${totalIdeal} Ideal`, cor: '#16a34a', bg: '#dcfce7' },
                { label: `${totalAceitavel} Aceitável`, cor: '#d97706', bg: '#fff7ed' },
                { label: `${totalDeficitario} Deficitário`, cor: '#dc2626', bg: '#fee2e2' },
                { label: `${totalExcesso} Em excesso`, cor: '#7c3aed', bg: '#f5f3ff' },
              ].map(s => (
                <span key={s.label} style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 999, background: s.bg, color: s.cor }}>
                  {s.label}
                </span>
              ))}
            </div>
          </div>

          <div className="grupos-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
            {statusGrupos.map(g => (
              <div key={g.grupo} style={{
                borderRadius: 10, border: `1px solid ${g.cor}33`,
                background: g.bg + '55', padding: '14px 16px',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#1e293b' }}>{g.grupo}</span>
                  <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 999, background: g.bg, color: g.cor }}>
                    {g.label}
                  </span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {[
                    { label: 'Violino', valor: g.violinos, ideal: 3 },
                    { label: 'Viola', valor: g.violas, ideal: 1 },
                    { label: 'Violoncelo', valor: g.violoncelos, ideal: 1 },
                    { label: 'Vocal', valor: g.vocais, ideal: 2 },
                  ].map(item => (
                    <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 12, color: '#64748b' }}>{item.label}</span>
                      <span style={{
                        fontSize: 12, fontWeight: 700,
                        color: item.valor >= item.ideal ? '#16a34a' : item.valor > 0 ? '#d97706' : '#dc2626',
                      }}>
                        {item.valor}/{item.ideal}
                      </span>
                    </div>
                  ))}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4, paddingTop: 6, borderTop: '1px solid #e2e8f0' }}>
                    <span style={{ fontSize: 12, color: '#64748b' }}>Organizador</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: g.temOrganizador ? '#16a34a' : '#dc2626' }}>
                      {g.temOrganizador ? '✅' : '❌'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Gráficos */}
        <div className="rel-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>

          {/* Atendimentos por hospital */}
          <div style={cardStyle}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: '#1e293b', margin: '0 0 16px' }}>🏥 Atendimentos por hospital</h3>
            {hospitalOrdenado.length === 0 ? (
              <p style={{ fontSize: 13, color: '#94a3b8' }}>Nenhum atendimento no período</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {hospitalOrdenado.map(([nome, total]) => (
                  <div key={nome}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: '#334155' }}>{nome}</span>
                      <span style={{ fontSize: 12, color: '#64748b' }}>{total} atend.</span>
                    </div>
                    <div style={{ background: '#f1f5f9', borderRadius: 999, height: 6 }}>
                      <div style={{ background: '#2563eb', height: 6, borderRadius: 999, width: `${(total / (hospitalOrdenado[0][1] || 1)) * 100}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Membros por grupo */}
          <div style={cardStyle}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: '#1e293b', margin: '0 0 16px' }}>🎻 Membros por grupo</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {Object.entries(porGrupo).map(([grupo, total]) => (
                <div key={grupo} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#334155' }}>{grupo}</span>
                  <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 999, background: '#eff6ff', color: '#1e40af' }}>
                    {total} membro{total > 1 ? 's' : ''}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Mais presentes */}
          <div style={cardStyle}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: '#1e293b', margin: '0 0 16px' }}>⭐ Membros mais presentes</h3>
            {maisPresentes.length === 0 ? (
              <p style={{ fontSize: 13, color: '#94a3b8' }}>Nenhum atendimento no período</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {maisPresentes.map(([nome, total]) => (
                  <div key={nome}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: '#334155' }}>{nome}</span>
                      <span style={{ fontSize: 12, color: '#64748b' }}>{total}x</span>
                    </div>
                    <div style={{ background: '#f1f5f9', borderRadius: 999, height: 6 }}>
                      <div style={{ background: '#16a34a', height: 6, borderRadius: 999, width: `${(total / maxPresenca) * 100}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Menos presentes */}
          <div style={cardStyle}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: '#1e293b', margin: '0 0 16px' }}>⚠️ Membros menos frequentes</h3>
            {menosPresentes.length === 0 ? (
              <p style={{ fontSize: 13, color: '#94a3b8' }}>Nenhum atendimento no período</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {menosPresentes.map(([nome, total]) => (
                  <div key={nome}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: '#334155' }}>{nome}</span>
                      <span style={{ fontSize: 12, color: '#64748b' }}>{total}x</span>
                    </div>
                    <div style={{ background: '#f1f5f9', borderRadius: 999, height: 6 }}>
                      <div style={{ background: '#d97706', height: 6, borderRadius: 999, width: `${(total / maxPresenca) * 100}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Membros por tipo */}
          <div style={cardStyle}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: '#1e293b', margin: '0 0 16px' }}>👥 Membros por tipo</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {Object.entries(porTipo).map(([tipo, total]) => (
                <div key={tipo} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#334155' }}>{tipo}</span>
                  <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 999, background: '#f5f3ff', color: '#7c3aed' }}>{total}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Novos membros */}
          <div style={cardStyle}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: '#1e293b', margin: '0 0 16px' }}>🆕 Novos membros no período</h3>
            {novosNoPeriodo.length === 0 ? (
              <p style={{ fontSize: 13, color: '#94a3b8' }}>Nenhum membro adicionado no período</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {novosNoPeriodo.map((m: any) => (
                  <div key={m.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#334155' }}>{m.nome}</span>
                    <span style={{ fontSize: 11, color: '#94a3b8' }}>{m.criado_em ? new Date(m.criado_em).toLocaleDateString('pt-BR') : '—'}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  )
}