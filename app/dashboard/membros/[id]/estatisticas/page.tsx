export const dynamic = 'force-dynamic'

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
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

export default async function EstatisticasMembro({ params, searchParams }: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ periodo?: string }>
}) {
  const { id } = await params
  const sp = await searchParams
  const periodo = sp.periodo || 'todos'

  let dataInicio: string
  let dataFim: string

  if (periodo === 'todos') {
    dataInicio = '2000-01-01'
    dataFim = '2099-12-31'
  } else {
    const datas = getPeriodo(periodo)
    dataInicio = datas.inicio
    dataFim = datas.fim
  }

  const { data: membro } = await supabase.from('membros').select('*').eq('id', id).single()

  const { data: escalas } = await supabase
    .from('escalas')
    .select('id, data, grupo, local_texto, registrada')
    .eq('grupo', membro?.grupo || '')
    .gte('data', dataInicio)
    .lte('data', dataFim)
    .order('data', { ascending: false })

  const escalasIds = (escalas || []).map(e => e.id)

  const { data: confirmacoes } = escalasIds.length > 0 ? await supabase
    .from('confirmacoes').select('*').in('escala_id', escalasIds).eq('membro_id', id) : { data: [] }

  const { data: todosRegistros } = escalasIds.length > 0 ? await supabase
    .from('registros').select('*').in('escala_id', escalasIds) : { data: [] }

  const { data: confirmacoesAvulso } = await supabase
    .from('confirmacoes')
    .select('*, escalas!confirmacoes_escala_id_fkey(grupo, local_texto, data)')
    .eq('membro_id', id)
    .eq('tipo', 'avulso')
    .gte('criado_em', dataInicio)
    .lte('criado_em', dataFim + 'T23:59:59')

  const totalConvocado = (escalas || []).length
  const totalConfirmou = (confirmacoes || []).filter(c => c.status === 'confirmado').length
  const totalAusente = (confirmacoes || []).filter(c => c.status === 'ausente').length
  const totalDispensado = (confirmacoes || []).filter(c => c.status === 'dispensado').length
  const totalAvulso = (confirmacoesAvulso || []).length

  let totalFoi = 0
  ;(todosRegistros || []).forEach(r => {
    const presentes = (r.membros_presentes || '').split(',').map((n: string) => n.trim())
    if (presentes.includes(membro?.nome)) totalFoi++
  })

  const pct = (valor: number) => totalConvocado > 0 ? Math.round((valor / totalConvocado) * 100) : 0
  const formatarData = (data: string) => new Date(data + 'T12:00:00').toLocaleDateString('pt-BR')

  const nomePeriodo: Record<string, string> = {
    todos: 'Todo período',
    mes_atual: 'Mês atual',
    mes_anterior: 'Mês anterior',
    bimestre: 'Bimestre',
    trimestre: 'Trimestre',
    semestre: 'Semestre',
    ano: 'Último ano',
  }

  const periodos = ['todos', 'mes_atual', 'mes_anterior', 'bimestre', 'trimestre', 'semestre', 'ano']

  const cards = [
    { valor: totalConvocado, label: 'Convocado', sub: 'escalas', cor: '#2563eb', bg: '#eff6ff' },
    { valor: `${pct(totalConfirmou)}%`, label: 'Confirmou', sub: `${totalConfirmou} vez${totalConfirmou !== 1 ? 'es' : ''}`, cor: '#16a34a', bg: '#dcfce7' },
    { valor: `${pct(totalFoi)}%`, label: 'Foi efetivamente', sub: `${totalFoi} vez${totalFoi !== 1 ? 'es' : ''}`, cor: '#059669', bg: '#d1fae5' },
    { valor: `${pct(totalAusente)}%`, label: 'Ausente', sub: `${totalAusente} vez${totalAusente !== 1 ? 'es' : ''}`, cor: '#dc2626', bg: '#fee2e2' },
    { valor: `${pct(totalDispensado)}%`, label: 'Dispensado', sub: `${totalDispensado} vez${totalDispensado !== 1 ? 'es' : ''}`, cor: '#64748b', bg: '#f1f5f9' },
    { valor: totalAvulso, label: 'Avulso', sub: 'participações', cor: '#7c3aed', bg: '#f5f3ff' },
  ]

  return (
    <div style={{ background: '#f4f6f9', minHeight: '100vh', padding: '28px 40px' }}
      className="estat-wrap">
      <style>{`
        @media (max-width: 768px) {
          .estat-wrap { padding: 16px !important; }
          .cards-grid { grid-template-columns: 1fr 1fr !important; }
          .header-membro { flex-direction: column !important; align-items: flex-start !important; gap: 12px !important; }
        }
      `}</style>

      <div style={{ maxWidth: 1280, margin: '0 auto' }}>

        {/* Header com destaque no nome */}
        <div className="header-membro" style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          background: '#fff',
          border: '1px solid #e2e8f0',
          borderRadius: 16,
          padding: '20px 24px',
          marginBottom: 20,
          boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{
              width: 56, height: 56, borderRadius: '50%',
              background: '#1e3a5f',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontWeight: 800, fontSize: 22, flexShrink: 0,
            }}>
              {membro?.nome?.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 style={{ fontSize: 22, fontWeight: 800, color: '#1e293b', margin: 0, letterSpacing: 0.2 }}>
                {membro?.nome}
              </h1>
              <div style={{ display: 'flex', gap: 8, marginTop: 6, flexWrap: 'wrap' }}>
                {membro?.instrumento && membro.instrumento !== 'Nenhum' && (
                  <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 999, background: '#eff6ff', color: '#2563eb' }}>
                    {membro.instrumento}
                  </span>
                )}
                {membro?.grupo && (
                  <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 999, background: '#f1f5f9', color: '#475569' }}>
                    {membro.grupo}
                  </span>
                )}
                <span style={{
                  fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 999,
                  background: membro?.status === 'Ativo' ? '#dcfce7' : '#f1f5f9',
                  color: membro?.status === 'Ativo' ? '#16a34a' : '#64748b',
                }}>
                  {membro?.status || 'Pendente'}
                </span>
              </div>
            </div>
          </div>

          <a href="/dashboard/membros" style={{
            display: 'flex', alignItems: 'center', gap: 6,
            fontSize: 13, fontWeight: 600, color: '#64748b', textDecoration: 'none',
            flexShrink: 0,
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
            </svg>
            Voltar
          </a>
        </div>

        {/* Filtros de período */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
          {periodos.map(p => (
            <a key={p} href={`/dashboard/membros/${id}/estatisticas?periodo=${p}`} style={{
              fontSize: 12, fontWeight: 600,
              padding: '7px 16px', borderRadius: 999,
              textDecoration: 'none', border: '1px solid',
              borderColor: periodo === p ? '#2563eb' : '#e2e8f0',
              background: periodo === p ? '#2563eb' : '#fff',
              color: periodo === p ? '#fff' : '#64748b',
            }}>
              {nomePeriodo[p]}
            </a>
          ))}
        </div>

        {/* Cards */}
        <div className="cards-grid" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 12,
          marginBottom: 20,
        }}>
          {cards.map((card, i) => (
            <div key={i} style={{
              background: '#fff',
              border: '1px solid #e2e8f0',
              borderRadius: 16,
              boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
              padding: '24px 20px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              gap: 6,
            }}>
              <div style={{
                width: 52, height: 52, borderRadius: '50%',
                background: card.bg,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: 4,
              }}>
                <span style={{ fontSize: 20, fontWeight: 800, color: card.cor }}>{card.valor}</span>
              </div>
              <p style={{ fontSize: 14, fontWeight: 700, color: '#1e293b', margin: 0 }}>{card.label}</p>
              <p style={{ fontSize: 11, color: '#94a3b8', margin: 0 }}>{card.sub}</p>
            </div>
          ))}
        </div>

        {/* Avulsos */}
        {totalAvulso > 0 && (
          <div style={{
            background: '#fff', border: '1px solid #e2e8f0',
            borderRadius: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
            padding: '20px 24px', marginBottom: 16,
          }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: '#1e293b', margin: '0 0 16px' }}>
              Participações como avulso
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {(confirmacoesAvulso || []).map((c: any) => (
                <div key={c.id} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  background: '#f5f3ff', borderRadius: 10, padding: '10px 14px',
                }}>
                  <p style={{ fontSize: 13, fontWeight: 600, color: '#334155', margin: 0 }}>
                    {c.escalas?.grupo} — {c.escalas?.local_texto}
                  </p>
                  <span style={{ fontSize: 12, fontWeight: 600, color: '#7c3aed' }}>
                    {formatarData(c.escalas?.data)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Histórico */}
        <div style={{
          background: '#fff', border: '1px solid #e2e8f0',
          borderRadius: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
          overflow: 'hidden',
        }}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid #f1f5f9' }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: '#1e293b', margin: 0 }}>Histórico de escalas</h3>
          </div>

          {(escalas || []).length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8', fontSize: 14 }}>
              Nenhuma escala no período
            </div>
          ) : (
            (escalas || []).map((escala, index) => {
              const confirmacao = (confirmacoes || []).find(c => c.escala_id === escala.id)
              const registro = (todosRegistros || []).find(r => r.escala_id === escala.id)
              const foi = registro
                ? (registro.membros_presentes || '').split(',').map((n: string) => n.trim()).includes(membro?.nome)
                : null
              const status = confirmacao?.status || 'pendente'

              const statusConfig: Record<string, { bg: string, color: string, label: string }> = {
                confirmado: { bg: '#dcfce7', color: '#16a34a', label: 'Confirmou' },
                ausente: { bg: '#fee2e2', color: '#dc2626', label: 'Ausente' },
                dispensado: { bg: '#f1f5f9', color: '#64748b', label: 'Dispensado' },
                pendente: { bg: '#fef9c3', color: '#854d0e', label: 'Pendente' },
              }

              const s = statusConfig[status] || statusConfig.pendente

              return (
                <div key={escala.id} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '14px 24px',
                  borderBottom: index < (escalas || []).length - 1 ? '1px solid #f1f5f9' : 'none',
                }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#f8fafc')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 600, color: '#1e293b', margin: 0 }}>{escala.local_texto}</p>
                    <p style={{ fontSize: 12, color: '#94a3b8', margin: 0 }}>{formatarData(escala.data)}</p>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <span style={{
                      fontSize: 11, fontWeight: 600,
                      padding: '4px 10px', borderRadius: 999,
                      background: s.bg, color: s.color,
                    }}>
                      {s.label}
                    </span>
                    {escala.registrada && foi !== null && (
                      <span style={{
                        fontSize: 11, fontWeight: 600,
                        padding: '4px 10px', borderRadius: 999,
                        background: foi ? '#d1fae5' : '#fee2e2',
                        color: foi ? '#059669' : '#dc2626',
                      }}>
                        {foi ? 'Foi' : 'Não foi'}
                      </span>
                    )}
                  </div>
                </div>
              )
            })
          )}
        </div>

      </div>
    </div>
  )
}