export const dynamic = 'force-dynamic'

import { createClient } from '@supabase/supabase-js'
import FiltroRelatorio from './FiltroRelatorio'

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
    .from('registros')
    .select('*, hospitais(nome)')
    .gte('data', dataInicio)
    .lte('data', dataFim)
    .order('data', { ascending: false })

  const { data: membros } = await supabase
    .from('membros')
    .select('*')
    .order('nome', { ascending: true })

  const { data: escalas } = await supabase
    .from('escalas')
    .select('id, data, grupo, local_texto, hospital_id, registrada')
    .gte('data', dataInicio)
    .lte('data', dataFim)

  const escalasIds = escalas?.map(e => e.id) || []

  const { data: confirmacoes } = escalasIds.length > 0 ? await supabase
    .from('confirmacoes')
    .select('*, membros!confirmacoes_membro_id_fkey(nome, grupo)')
    .in('escala_id', escalasIds) : { data: [] }

  // Cruzamento das 3 situações
  type SituacaoMembro = {
    nome: string
    grupo: string
    escala: string
    data: string
    convocado: boolean
    confirmou: boolean
    foi: boolean
    dispensado: boolean
  }

  const situacoes: SituacaoMembro[] = []

  escalas?.filter(e => e.registrada).forEach(escala => {
    const registro = registros?.find(r => r.escala_id === escala.id)
    if (!registro) return

    const membrosDoGrupo = membros?.filter(m => m.grupo === escala.grupo) || []
    const membrosPresentes = (registro.membros_presentes || '').split(',').map((n: string) => n.trim()).filter(Boolean)

    membrosDoGrupo.forEach(membro => {
      const confirmacao = confirmacoes?.find((c: any) => c.membro_id === membro.id && c.escala_id === escala.id)
      const confirmou = confirmacao?.status === 'confirmado'
      const dispensado = confirmacao?.status === 'dispensado'
      const foi = membrosPresentes.includes(membro.nome)

      situacoes.push({
        nome: membro.nome,
        grupo: membro.grupo || '—',
        escala: `${escala.grupo} — ${escala.local_texto}`,
        data: escala.data,
        convocado: true,
        confirmou,
        foi,
        dispensado,
      })
    })
  })

  const confirmouMasNaoFoi = situacoes.filter(s => s.confirmou && !s.foi && !s.dispensado)
  const naoConfirmouMasFoi = situacoes.filter(s => !s.confirmou && s.foi && !s.dispensado)
  const faltou = situacoes.filter(s => !s.confirmou && !s.foi && !s.dispensado)

  const totalRegistros = registros?.length || 0
  const totalMembros = membros?.length || 0
  const totalHinos = registros?.reduce((acc, r) => acc + (r.hinos_executados || 0), 0) || 0
  const totalOracoes = registros?.filter(r => r.teve_oracao).length || 0

  const porHospital: Record<string, number> = {}
  registros?.forEach(r => {
    const nome = r.hospitais?.nome || 'Desconhecido'
    porHospital[nome] = (porHospital[nome] || 0) + 1
  })
  const hospitalOrdenado = Object.entries(porHospital).sort((a, b) => b[1] - a[1])

  const presenca: Record<string, number> = {}
  registros?.forEach(r => {
    if (!r.membros_presentes) return
    r.membros_presentes.split(',').forEach((nome: string) => {
      const n = nome.trim()
      if (n) presenca[n] = (presenca[n] || 0) + 1
    })
  })
  const presencaOrdenada = Object.entries(presenca).sort((a, b) => b[1] - a[1])
  const maisPresentes = presencaOrdenada.slice(0, 5)
  const menosPresentes = [...presencaOrdenada].reverse().slice(0, 5)

  const porGrupo: Record<string, number> = {}
  membros?.forEach(m => {
    const g = m.grupo || 'Sem grupo'
    porGrupo[g] = (porGrupo[g] || 0) + 1
  })

  const porTipo: Record<string, number> = {}
  membros?.forEach(m => {
    const t = m.tipo || 'Sem tipo'
    porTipo[t] = (porTipo[t] || 0) + 1
  })

  const novosNoPeriodo = membros?.filter(m => {
    if (!m.criado_em) return false
    const d = m.criado_em.split('T')[0]
    return d >= dataInicio && d <= dataFim
  }) || []

  const maxPresenca = maisPresentes[0]?.[1] || 1

  const nomePeriodo: Record<string, string> = {
    mes_atual: 'Mês atual',
    mes_anterior: 'Mês anterior',
    bimestre: 'Último bimestre',
    trimestre: 'Último trimestre',
    semestre: 'Último semestre',
    ano: 'Último ano',
    personalizado: 'Período personalizado',
  }

  const formatarData = (data: string) => new Date(data + 'T12:00:00').toLocaleDateString('pt-BR')

  return (
    <div className="p-4 md:p-6">

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Relatórios</h2>
          <p className="text-sm text-gray-500">{nomePeriodo[periodo]} · {dataInicio} até {dataFim}</p>
        </div>
        <FiltroRelatorio periodoAtual={periodo} inicioAtual={params.inicio} fimAtual={params.fim} />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-2xl shadow p-5 text-center">
          <p className="text-3xl font-bold text-blue-600">{totalRegistros}</p>
          <p className="text-sm text-gray-500 mt-1">Atendimentos</p>
        </div>
        <div className="bg-white rounded-2xl shadow p-5 text-center">
          <p className="text-3xl font-bold text-green-600">{totalMembros}</p>
          <p className="text-sm text-gray-500 mt-1">Membros</p>
        </div>
        <div className="bg-white rounded-2xl shadow p-5 text-center">
          <p className="text-3xl font-bold text-purple-600">{totalHinos}</p>
          <p className="text-sm text-gray-500 mt-1">Hinos executados</p>
        </div>
        <div className="bg-white rounded-2xl shadow p-5 text-center">
          <p className="text-3xl font-bold text-yellow-600">{totalOracoes}</p>
          <p className="text-sm text-gray-500 mt-1">Atendimentos c/ oração</p>
        </div>
      </div>

      {/* Confirmou mas não foi */}
      <div className="bg-white rounded-2xl shadow p-6 mb-6">
        <h3 className="text-base font-bold text-gray-800 mb-4">⚠️ Confirmou presença mas não foi ({confirmouMasNaoFoi.length})</h3>
        {confirmouMasNaoFoi.length === 0 ? (
          <p className="text-sm text-gray-400">Nenhuma ocorrência no período ✅</p>
        ) : (
          <div className="space-y-2">
            {confirmouMasNaoFoi.map((item, i) => (
              <div key={i} className="flex items-center justify-between bg-orange-50 rounded-lg px-4 py-3">
                <div>
                  <p className="text-sm font-semibold text-gray-800">{item.nome}</p>
                  <p className="text-xs text-gray-500">{item.grupo} · {item.escala}</p>
                </div>
                <span className="text-xs text-orange-600 font-semibold">{formatarData(item.data)}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Não confirmou mas foi */}
      <div className="bg-white rounded-2xl shadow p-6 mb-6">
        <h3 className="text-base font-bold text-gray-800 mb-4">🔵 Não confirmou mas foi ({naoConfirmouMasFoi.length})</h3>
        {naoConfirmouMasFoi.length === 0 ? (
          <p className="text-sm text-gray-400">Nenhuma ocorrência no período ✅</p>
        ) : (
          <div className="space-y-2">
            {naoConfirmouMasFoi.map((item, i) => (
              <div key={i} className="flex items-center justify-between bg-blue-50 rounded-lg px-4 py-3">
                <div>
                  <p className="text-sm font-semibold text-gray-800">{item.nome}</p>
                  <p className="text-xs text-gray-500">{item.grupo} · {item.escala}</p>
                </div>
                <span className="text-xs text-blue-600 font-semibold">{formatarData(item.data)}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Faltou sem justificativa */}
      <div className="bg-white rounded-2xl shadow p-6 mb-6">
        <h3 className="text-base font-bold text-gray-800 mb-4">❌ Não confirmou e não foi ({faltou.length})</h3>
        {faltou.length === 0 ? (
          <p className="text-sm text-gray-400">Nenhuma ocorrência no período ✅</p>
        ) : (
          <div className="space-y-2">
            {faltou.map((item, i) => (
              <div key={i} className="flex items-center justify-between bg-red-50 rounded-lg px-4 py-3">
                <div>
                  <p className="text-sm font-semibold text-gray-800">{item.nome}</p>
                  <p className="text-xs text-gray-500">{item.grupo} · {item.escala}</p>
                </div>
                <span className="text-xs text-red-600 font-semibold">{formatarData(item.data)}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-2xl shadow p-6">
          <h3 className="text-base font-bold text-gray-800 mb-4">🏥 Atendimentos por hospital</h3>
          {hospitalOrdenado.length === 0 ? (
            <p className="text-sm text-gray-400">Nenhum atendimento no período</p>
          ) : (
            <div className="space-y-3">
              {hospitalOrdenado.map(([nome, total]) => (
                <div key={nome}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-gray-700">{nome}</span>
                    <span className="text-gray-500">{total} atendimento{total > 1 ? 's' : ''}</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${(total / (hospitalOrdenado[0][1] || 1)) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow p-6">
          <h3 className="text-base font-bold text-gray-800 mb-4">🎻 Membros por grupo</h3>
          <div className="space-y-3">
            {Object.entries(porGrupo).map(([grupo, total]) => (
              <div key={grupo} className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">{grupo}</span>
                <span className="text-xs font-semibold px-2 py-1 rounded-full bg-blue-50 text-blue-700">{total} membro{total > 1 ? 's' : ''}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-2xl shadow p-6">
          <h3 className="text-base font-bold text-gray-800 mb-4">⭐ Membros mais presentes</h3>
          {maisPresentes.length === 0 ? (
            <p className="text-sm text-gray-400">Nenhum atendimento no período</p>
          ) : (
            <div className="space-y-3">
              {maisPresentes.map(([nome, total]) => (
                <div key={nome}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-gray-700">{nome}</span>
                    <span className="text-gray-500">{total}x</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: `${(total / maxPresenca) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow p-6">
          <h3 className="text-base font-bold text-gray-800 mb-4">⚠️ Membros menos frequentes</h3>
          {menosPresentes.length === 0 ? (
            <p className="text-sm text-gray-400">Nenhum atendimento no período</p>
          ) : (
            <div className="space-y-3">
              {menosPresentes.map(([nome, total]) => (
                <div key={nome}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-gray-700">{nome}</span>
                    <span className="text-gray-500">{total}x</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div className="bg-yellow-400 h-2 rounded-full" style={{ width: `${(total / maxPresenca) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow p-6">
          <h3 className="text-base font-bold text-gray-800 mb-4">👥 Membros por tipo</h3>
          <div className="space-y-3">
            {Object.entries(porTipo).map(([tipo, total]) => (
              <div key={tipo} className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">{tipo}</span>
                <span className="text-xs font-semibold px-2 py-1 rounded-full bg-purple-50 text-purple-700">{total}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow p-6">
          <h3 className="text-base font-bold text-gray-800 mb-4">🆕 Novos membros no período</h3>
          {novosNoPeriodo.length === 0 ? (
            <p className="text-sm text-gray-400">Nenhum membro adicionado no período</p>
          ) : (
            <div className="space-y-2">
              {novosNoPeriodo.map(m => (
                <div key={m.id} className="flex justify-between items-center text-sm">
                  <span className="font-medium text-gray-700">{m.nome}</span>
                  <span className="text-gray-400 text-xs">{m.criado_em ? new Date(m.criado_em).toLocaleDateString('pt-BR') : '—'}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

    </div>
  )
}