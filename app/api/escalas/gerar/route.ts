export const dynamic = 'force-dynamic'

import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// IDs dos hospitais
const HOSPITAIS = {
  CAMPO_LIMPO:    'bf83e35f-050a-4870-be9a-97ac4a67de61',
  ITUPEVA:        'e34f91de-8453-44a7-bcf7-b5d399724672',
  PITANGUEIRAS:   '7db93ddc-5eed-4a5f-9eae-7dce0dda98d1',
  PSIQUIATRICO:   '13c5c46d-3629-4b4a-b8a0-7f3e008b3595',
  SANTO_ANTONIO:  'fc1e12e4-3f60-44d1-a144-bc7ad3c0f657',
  SAO_VICENTE_1:  '93a83bbc-7dde-4a70-9483-077c8874f2f7',
  SAO_VICENTE_2:  'b06bd35f-cf0f-440e-8a5f-777927cee1cf',
  PA_CENTRAL:     'f89af2f6-c9df-4ce0-92a3-377c34a69781',
  PA_HORTOLANDIA: '9245ea14-1e54-4767-a88e-b44cfafc57e7',
  PA_PONTE:       '99136f9d-0581-430c-90b9-79b643f41ec6',
  PA_RETIRO:      '9c4d272c-9d12-4840-a7e0-95748774bbca',
  PSA_CAIEIRAS:   '987e2d4f-5869-4d2a-9973-6304676c7b0c',
  SANTA_CASA:     'c212314c-5334-48e1-bfb0-eb64508e89a0',
}

// Grupos fixos
const GRUPOS_FIXOS = ['Grupo Campo Limpo', 'Grupo Louveira', 'Grupo Cabreuva', 'Grupo Caieiras', 'Grupo Psiquiatrico', 'Grupo Misto']

// Grupos rotativos
const GRUPOS_ROTATIVOS = [
  'Grupo 1','Grupo 2','Grupo 3','Grupo 4','Grupo 5','Grupo 6','Grupo 7',
  'Grupo 8','Grupo 9','Grupo 10','Grupo 11','Grupo 12','Grupo 13','Grupo 14',
  'Grupo 15','Grupo 16','Grupo Morato'
]

// Hospitais rotativos
const HOSPITAIS_ROTATIVOS = [
  { id: HOSPITAIS.PA_PONTE,      nome: 'PA Ponte Sao Joao',            hora: '08:30' },
  { id: HOSPITAIS.SAO_VICENTE_1, nome: 'Hospital Sao Vicente Setor 1', hora: '09:30' },
  { id: HOSPITAIS.SAO_VICENTE_2, nome: 'Hospital Sao Vicente Setor 2', hora: '09:00' },
  { id: HOSPITAIS.PA_CENTRAL,    nome: 'PA Central',                   hora: '09:00' },
]

// Hospitais que entram no rodízio no 2º e 3º sábado
const HORTOLANDIA_RETIRO = [
  { id: HOSPITAIS.PA_HORTOLANDIA, nome: 'PA Hortolandia', hora: '09:00' },
  { id: HOSPITAIS.PA_RETIRO,      nome: 'PA Retiro',      hora: '10:00' },
]

function getSabadosDoMes(ano: number, mes: number): Date[] {
  const sabados: Date[] = []
  const data = new Date(ano, mes - 1, 1)
  while (data.getMonth() === mes - 1) {
    if (data.getDay() === 6) sabados.push(new Date(data))
    data.setDate(data.getDate() + 1)
  }
  return sabados
}

function getSemanaDoMes(data: Date): number {
  const primeiroDia = new Date(data.getFullYear(), data.getMonth(), 1)
  let semana = 1
  const d = new Date(primeiroDia)
  while (d < data) {
    if (d.getDay() === 6) semana++
    d.setDate(d.getDate() + 1)
  }
  return semana
}

export async function POST(req: Request) {
  const { mes, ano } = await req.json()

  if (!mes || !ano) return NextResponse.json({ error: 'Mês e ano são obrigatórios' }, { status: 400 })

  // Buscar histórico de escalas para calcular frequência
  const { data: historicoEscalas } = await supabaseAdmin
    .from('escalas')
    .select('grupo, hospital_id')
    .not('hospital_id', 'is', null)

  // Calcular frequência grupo x hospital
  const frequencia: Record<string, Record<string, number>> = {}
  GRUPOS_ROTATIVOS.forEach(g => { frequencia[g] = {} })

  ;(historicoEscalas || []).forEach((e: any) => {
    if (!GRUPOS_ROTATIVOS.includes(e.grupo)) return
    if (!frequencia[e.grupo]) frequencia[e.grupo] = {}
    frequencia[e.grupo][e.hospital_id] = (frequencia[e.grupo][e.hospital_id] || 0) + 1
  })

  const sabados = getSabadosDoMes(ano, mes)
  const escalasParaCriar: any[] = []

  // Controle de quem já foi escalado neste mês por hospital rotativo
  const gruposUsadosMes: Record<string, Set<string>> = {}
  HOSPITAIS_ROTATIVOS.forEach(h => { gruposUsadosMes[h.id] = new Set() })
  gruposUsadosMes[HOSPITAIS.PA_HORTOLANDIA] = new Set()
  gruposUsadosMes[HOSPITAIS.PA_RETIRO] = new Set()

  // Para cada sábado, controle de quem já foi escalado naquele dia
  const gruposUsadosDia: Record<string, Set<string>> = {}

  const escolherGrupo = (hospitalId: string, gruposDisponiveis: string[], jaUsadosDia: Set<string>): string | null => {
    // Filtra grupos não usados hoje e não usados neste mês neste hospital
    const candidatos = gruposDisponiveis.filter(g =>
      !jaUsadosDia.has(g) &&
      !gruposUsadosMes[hospitalId]?.has(g)
    )

    if (candidatos.length === 0) {
      // Se todos já foram, usa só quem não foi hoje
      const fallback = gruposDisponiveis.filter(g => !jaUsadosDia.has(g))
      if (fallback.length === 0) return null
      return fallback[Math.floor(Math.random() * fallback.length)]
    }

    // Ordena por menor frequência neste hospital
    candidatos.sort((a, b) => {
      const fa = frequencia[a]?.[hospitalId] || 0
      const fb = frequencia[b]?.[hospitalId] || 0
      return fa - fb
    })

    // Pega os que têm menor frequência (pode ter empate)
    const menorFreq = frequencia[candidatos[0]]?.[hospitalId] || 0
    const empatados = candidatos.filter(g => (frequencia[g]?.[hospitalId] || 0) === menorFreq)

    // Sorteia entre empatados
    return empatados[Math.floor(Math.random() * empatados.length)]
  }

  for (const sabado of sabados) {
    const semana = getSemanaDoMes(sabado)
    const dataStr = sabado.toISOString().split('T')[0]
    const jaUsadosDia: Set<string> = new Set()
    gruposUsadosDia[dataStr] = jaUsadosDia

    // === FIXOS TODO SÁBADO ===

    // Campo Limpo
    escalasParaCriar.push({
      data: dataStr, grupo: 'Grupo Campo Limpo',
      hospital_id: HOSPITAIS.CAMPO_LIMPO,
      local_texto: 'Hospital Campo Limpo Paulista',
      hora_inicio: '09:00', confirmacao_aberta: false, atendentes: '',
    })
    jaUsadosDia.add('Grupo Campo Limpo')

    // Louveira - 2 escalas no mesmo dia
    escalasParaCriar.push({
      data: dataStr, grupo: 'Grupo Louveira',
      hospital_id: HOSPITAIS.SANTA_CASA,
      local_texto: 'Santa Casa de Louveira',
      hora_inicio: '09:00', confirmacao_aberta: false, atendentes: '',
    })
    escalasParaCriar.push({
      data: dataStr, grupo: 'Grupo Louveira',
      hospital_id: HOSPITAIS.SANTO_ANTONIO,
      local_texto: 'Hospital Santo Antonio',
      hora_inicio: '10:30', confirmacao_aberta: false, atendentes: '',
    })
    jaUsadosDia.add('Grupo Louveira')

    // Cabreuva - Itupeva todo sábado
    escalasParaCriar.push({
      data: dataStr, grupo: 'Grupo Cabreuva',
      hospital_id: HOSPITAIS.ITUPEVA,
      local_texto: 'Hospital Itupeva',
      hora_inicio: '13:00', confirmacao_aberta: false, atendentes: '',
    })

    // Cabreuva - Hortolandia + Retiro só no 1º e 4º sábado
    if (semana === 1 || semana === 4) {
      escalasParaCriar.push({
        data: dataStr, grupo: 'Grupo Cabreuva',
        hospital_id: HOSPITAIS.PA_HORTOLANDIA,
        local_texto: 'PA Hortolandia',
        hora_inicio: '09:00', confirmacao_aberta: false, atendentes: '',
      })
      escalasParaCriar.push({
        data: dataStr, grupo: 'Grupo Cabreuva',
        hospital_id: HOSPITAIS.PA_RETIRO,
        local_texto: 'PA Retiro',
        hora_inicio: '10:00', confirmacao_aberta: false, atendentes: '',
      })
    }
    jaUsadosDia.add('Grupo Cabreuva')

    // Psiquiatrico
    escalasParaCriar.push({
      data: dataStr, grupo: 'Grupo Psiquiatrico',
      hospital_id: HOSPITAIS.PSIQUIATRICO,
      local_texto: 'Hospital Psiquiatrico',
      hora_inicio: '10:00', confirmacao_aberta: false, atendentes: '',
    })
    jaUsadosDia.add('Grupo Psiquiatrico')

    // Caieiras
    escalasParaCriar.push({
      data: dataStr, grupo: 'Grupo Caieiras',
      hospital_id: HOSPITAIS.PSA_CAIEIRAS,
      local_texto: 'PSA Dr Ideir Hamamoto',
      hora_inicio: '14:00', confirmacao_aberta: false, atendentes: '',
    })
    jaUsadosDia.add('Grupo Caieiras')

    // Grupo Misto - só no 2º sábado
    if (semana === 2) {
      escalasParaCriar.push({
        data: dataStr, grupo: 'Grupo Misto',
        hospital_id: HOSPITAIS.PITANGUEIRAS,
        local_texto: 'Hospital Pitangueiras',
        hora_inicio: '13:30', confirmacao_aberta: false, atendentes: '',
      })
      jaUsadosDia.add('Grupo Misto')
    }

    // === ROTATIVOS ===
    const hospitaisRotativosDoDia = [...HOSPITAIS_ROTATIVOS]

    // No 2º e 3º sábado, Hortolandia e Retiro entram no rodízio
    if (semana === 2 || semana === 3) {
      hospitaisRotativosDoDia.push(...HORTOLANDIA_RETIRO)
    }

    for (const hospital of hospitaisRotativosDoDia) {
      const grupo = escolherGrupo(hospital.id, GRUPOS_ROTATIVOS, jaUsadosDia)
      if (!grupo) continue

      escalasParaCriar.push({
        data: dataStr, grupo,
        hospital_id: hospital.id,
        local_texto: hospital.nome,
        hora_inicio: hospital.hora,
        confirmacao_aberta: false, atendentes: '',
      })

      jaUsadosDia.add(grupo)
      if (!gruposUsadosMes[hospital.id]) gruposUsadosMes[hospital.id] = new Set()
      gruposUsadosMes[hospital.id].add(grupo)

      // Atualiza frequência para próximas iterações
      if (!frequencia[grupo]) frequencia[grupo] = {}
      frequencia[grupo][hospital.id] = (frequencia[grupo][hospital.id] || 0) + 1
    }
  }

  // Salvar no banco
  const { error } = await supabaseAdmin.from('escalas').insert(escalasParaCriar)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ success: true, total: escalasParaCriar.length })
}