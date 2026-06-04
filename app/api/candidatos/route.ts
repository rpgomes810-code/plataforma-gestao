import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const CAMPOS_MAIUSCULO = ['nome', 'comum', 'cidade', 'instrumento', 'como_conheceu_indicacao', 'como_conheceu_outros']

function maiuscular(obj: any) {
  const resultado = { ...obj }
  for (const campo of CAMPOS_MAIUSCULO) {
    if (resultado[campo] && typeof resultado[campo] === 'string') {
      resultado[campo] = resultado[campo].toUpperCase()
    }
  }
  return resultado
}

export async function POST(req: Request) {
  const body = await req.json()
  const { nome, telefone, data_nascimento, comum, cidade, instrumento, instrumento_outro,
    como_conheceu, como_conheceu_indicacao, como_conheceu_outros, disponibilidade } = body

  if (!nome || !telefone) return NextResponse.json({ error: 'Campos obrigatórios faltando' }, { status: 400 })

  const dados = maiuscular({
    nome, telefone, data_nascimento: data_nascimento || null, comum, cidade,
    instrumento: instrumento === 'Outro' ? instrumento_outro : instrumento,
    como_conheceu, como_conheceu_indicacao, como_conheceu_outros, disponibilidade,
    status: 'candidato',
  })

  const { error } = await supabase.from('candidatos').insert(dados)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}

export async function GET() {
  const { data, error } = await supabase
    .from('candidatos').select('*')
    .order('criado_em', { ascending: false })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function PUT(req: Request) {
  const body = await req.json()
  const { id, ...campos } = body
  const dados = maiuscular(campos)
  const { error } = await supabase.from('candidatos').update(dados).eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}