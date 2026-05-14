export const dynamic = 'force-dynamic'

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default async function Relatorios() {
  // Busca todos os registros
  const { data: registros } = await supabase
    .from('registros')
    .select('*, hospitais(nome)')
    .order('data', { ascending: false })

  // Busca todos os membros
  const { data: membros } = await supabase
    .from('membros')
    .select('*')
    .order('criado_em', { ascending: false })

  const totalRegistros = registros?.length || 0
  const totalMembros = membros?.length || 0
  const totalHinos = registros?.reduce((acc, r) => acc + (r.hinos_executados || 0), 0) || 0
  const totalOracoes = registros?.filter(r => r.teve_oracao).length || 0

  // Atendimentos por hospital
  const porHospital: Record<string, number> = {}
  registros?.forEach(r => {
    const nome = r.hospitais?.nome || 'Desconhecido'
    porHospital[nome] = (porHospital[nome] || 0) + 1
  })
  const hospitalOrdenado = Object.entries(porHospital).sort((a, b) => b[1] - a[1])

  // Presença dos membros
  const presenca: Record<string, number> = {}
  registros?.forEach(r => {
    if (!r.membros_presentes) return
    r.membros_presentes.split(',').forEach((nome: string) => {
      const n = nome.trim()
      if (n) presenca[n] = (presenca[n] || 0) + 1
    })
  })
  const presencaOrdenada = Object.entries(presenca).sort((a, b) => b[1] - a[1])
  const maisPresenteS = presencaOrdenada.slice(0, 5)
  const menosPresentes = [...presencaOrdenada].reverse().slice(0, 5)

  // Membros por grupo
  const porGrupo: Record<string, number> = {}
  membros?.forEach(m => {
    const g = m.grupo || 'Sem grupo'
    porGrupo[g] = (porGrupo[g] || 0) + 1
  })

  // Membros por tipo
  const porTipo: Record<string, number> = {}
  membros?.forEach(m => {
    const t = m.tipo || 'Sem tipo'
    porTipo[t] = (porTipo[t] || 0) + 1
  })

  // Membros adicionados nos últimos 30 dias
  const trintaDiasAtras = new Date()
  trintaDiasAtras.setDate(trintaDiasAtras.getDate() - 30)
  const novosNoPeriodo = membros?.filter(m => {
    if (!m.criado_em) return false
    return new Date(m.criado_em) >= trintaDiasAtras
  }) || []

  const maxPresenca = maisPresenteS[0]?.[1] || 1

  return (
    <div className="p-4 md:p-6">

      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-800">Relatórios</h2>
        <p className="text-sm text-gray-500">Dados reais do sistema</p>
      </div>

      {/* Cards de resumo */}
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">

        {/* Atendimentos por hospital */}
        <div className="bg-white rounded-2xl shadow p-6">
          <h3 className="text-base font-bold text-gray-800 mb-4">🏥 Atendimentos por hospital</h3>
          {hospitalOrdenado.length === 0 ? (
            <p className="text-sm text-gray-400">Nenhum atendimento registrado ainda</p>
          ) : (
            <div className="space-y-3">
              {hospitalOrdenado.map(([nome, total]) => (
                <div key={nome}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-gray-700">{nome}</span>
                    <span className="text-gray-500">{total} atendimento{total > 1 ? 's' : ''}</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${(total / (hospitalOrdenado[0][1] || 1)) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Membros por grupo */}
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

        {/* Mais presentes */}
        <div className="bg-white rounded-2xl shadow p-6">
          <h3 className="text-base font-bold text-gray-800 mb-4">⭐ Membros mais presentes</h3>
          {maisPresenteS.length === 0 ? (
            <p className="text-sm text-gray-400">Nenhum atendimento registrado ainda</p>
          ) : (
            <div className="space-y-3">
              {maisPresenteS.map(([nome, total]) => (
                <div key={nome}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-gray-700">{nome}</span>
                    <span className="text-gray-500">{total}x</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full"
                      style={{ width: `${(total / maxPresenca) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Menos presentes */}
        <div className="bg-white rounded-2xl shadow p-6">
          <h3 className="text-base font-bold text-gray-800 mb-4">⚠️ Membros menos frequentes</h3>
          {menosPresentes.length === 0 ? (
            <p className="text-sm text-gray-400">Nenhum atendimento registrado ainda</p>
          ) : (
            <div className="space-y-3">
              {menosPresentes.map(([nome, total]) => (
                <div key={nome}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-gray-700">{nome}</span>
                    <span className="text-gray-500">{total}x</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div className="bg-yellow-400 h-2 rounded-full"
                      style={{ width: `${(total / maxPresenca) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Membros por tipo */}
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

        {/* Novos membros nos últimos 30 dias */}
        <div className="bg-white rounded-2xl shadow p-6">
          <h3 className="text-base font-bold text-gray-800 mb-4">🆕 Novos membros (últimos 30 dias)</h3>
          {novosNoPeriodo.length === 0 ? (
            <p className="text-sm text-gray-400">Nenhum membro adicionado nos últimos 30 dias</p>
          ) : (
            <div className="space-y-2">
              {novosNoPeriodo.map(m => (
                <div key={m.id} className="flex justify-between items-center text-sm">
                  <span className="font-medium text-gray-700">{m.nome}</span>
                  <span className="text-gray-400 text-xs">
                    {m.criado_em ? new Date(m.criado_em).toLocaleDateString('pt-BR') : '—'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

    </div>
  )
}