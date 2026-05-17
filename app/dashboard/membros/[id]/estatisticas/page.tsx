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

export default async function EstatisticasMembro({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ periodo?: string, inicio?: string, fim?: string }>
}) {
  const { id } = await params
  const sp = await searchParams
  const periodo = sp.periodo || 'todos'

  let dataInicio: string
  let dataFim: string

  if (periodo === 'personalizado' && sp.inicio && sp.fim) {
    dataInicio = sp.inicio
    dataFim = sp.fim
  } else if (periodo === 'todos') {
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
    .from('confirmacoes')
    .select('*')
    .in('escala_id', escalasIds)
    .eq('membro_id', id) : { data: [] }

  const { data: todosRegistros } = escalasIds.length > 0 ? await supabase
    .from('registros')
    .select('*')
    .in('escala_id', escalasIds) : { data: [] }

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
    todos: 'Todo o período',
    mes_atual: 'Mês atual',
    mes_anterior: 'Mês anterior',
    bimestre: 'Último bimestre',
    trimestre: 'Último trimestre',
    semestre: 'Último semestre',
    ano: 'Último ano',
    personalizado: 'Período personalizado',
  }

  const periodos = ['todos', 'mes_atual', 'mes_anterior', 'bimestre', 'trimestre', 'semestre', 'ano']

  return (
    <div className="p-4 md:p-6 max-w-4xl">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-800">📊 Estatísticas</h2>
          <p className="text-sm text-gray-500">{membro?.nome} · {membro?.grupo}</p>
        </div>
        <a href="/dashboard/membros" className="text-gray-500 hover:text-gray-700 text-sm">← Voltar</a>
      </div>

      {/* Filtro de período */}
      <div className="flex flex-wrap gap-2 mb-6">
        {periodos.map(p => (
          
            key={p}
            href={`/dashboard/membros/${id}/estatisticas?periodo=${p}`}
            className={`text-xs font-semibold px-3 py-1.5 rounded-full transition ${
              periodo === p
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            {nomePeriodo[p]}
          </a>
        ))}
      </div>

      {/* Cards de resumo */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-2xl shadow p-5 text-center">
          <p className="text-3xl font-bold text-blue-600">{totalConvocado}</p>
          <p className="text-sm text-gray-500 mt-1">📅 Convocado</p>
        </div>
        <div className="bg-white rounded-2xl shadow p-5 text-center">
          <p className="text-3xl font-bold text-green-600">{totalConfirmou}</p>
          <p className="text-xs text-gray-400 mt-0.5">{pct(totalConfirmou)}% das convocações</p>
          <p className="text-sm text-gray-500 mt-1">✅ Confirmou</p>
        </div>
        <div className="bg-white rounded-2xl shadow p-5 text-center">
          <p className="text-3xl font-bold text-emerald-600">{totalFoi}</p>
          <p className="text-xs text-gray-400 mt-0.5">{pct(totalFoi)}% das convocações</p>
          <p className="text-sm text-gray-500 mt-1">🏥 Foi efetivamente</p>
        </div>
        <div className="bg-white rounded-2xl shadow p-5 text-center">
          <p className="text-3xl font-bold text-red-600">{totalAusente}</p>
          <p className="text-xs text-gray-400 mt-0.5">{pct(totalAusente)}% das convocações</p>
          <p className="text-sm text-gray-500 mt-1">❌ Ausente</p>
        </div>
        <div className="bg-white rounded-2xl shadow p-5 text-center">
          <p className="text-3xl font-bold text-gray-500">{totalDispensado}</p>
          <p className="text-xs text-gray-400 mt-0.5">{pct(totalDispensado)}% das convocações</p>
          <p className="text-sm text-gray-500 mt-1">🔕 Dispensado</p>
        </div>
        <div className="bg-white rounded-2xl shadow p-5 text-center">
          <p className="text-3xl font-bold text-purple-600">{totalAvulso}</p>
          <p className="text-sm text-gray-500 mt-1">🔄 Avulso</p>
        </div>
      </div>

      {/* Participações como avulso */}
      {totalAvulso > 0 && (
        <div className="bg-white rounded-2xl shadow p-6 mb-6">
          <h3 className="text-base font-bold text-gray-800 mb-4">🔄 Participações como avulso</h3>
          <div className="space-y-2">
            {(confirmacoesAvulso || []).map((c: any) => (
              <div key={c.id} className="flex items-center justify-between bg-purple-50 rounded-lg px-4 py-2">
                <p className="text-sm font-medium text-gray-700">{c.escalas?.grupo} — {c.escalas?.local_texto}</p>
                <span className="text-xs text-purple-600 font-semibold">{formatarData(c.escalas?.data)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Histórico de escalas */}
      <div className="bg-white rounded-2xl shadow p-6">
        <h3 className="text-base font-bold text-gray-800 mb-4">📋 Histórico de escalas</h3>
        {(escalas || []).length === 0 ? (
          <p className="text-sm text-gray-400">Nenhuma escala no período</p>
        ) : (
          <div className="space-y-2">
            {(escalas || []).map(escala => {
              const confirmacao = (confirmacoes || []).find(c => c.escala_id === escala.id)
              const registro = (todosRegistros || []).find(r => r.escala_id === escala.id)
              const foi = registro
                ? (registro.membros_presentes || '').split(',').map((n: string) => n.trim()).includes(membro?.nome)
                : null
              const status = confirmacao?.status || 'pendente'

              return (
                <div key={escala.id} className="flex items-center justify-between bg-gray-50 rounded-lg px-4 py-2">
                  <div>
                    <p className="text-sm font-medium text-gray-700">{escala.local_texto}</p>
                    <p className="text-xs text-gray-400">{formatarData(escala.data)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                      status === 'confirmado' ? 'bg-green-100 text-green-700' :
                      status === 'ausente' ? 'bg-red-100 text-red-700' :
                      status === 'dispensado' ? 'bg-gray-100 text-gray-500' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      {status === 'confirmado' ? '✅ Confirmou' :
                       status === 'ausente' ? '❌ Ausente' :
                       status === 'dispensado' ? '🔕 Dispensado' :
                       '⏳ Pendente'}
                    </span>
                    {escala.registrada && foi !== null && (
                      <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                        foi ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {foi ? '🏥 Foi' : '🚫 Não foi'}
                      </span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}