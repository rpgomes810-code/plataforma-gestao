import { supabase } from '../../lib/supabase'
import { NextRequest, NextResponse } from 'next/server'

const CAMPOS_MAIUSCULO = ['nome', 'comum', 'cidade', 'instrumento', 'grupo', 'perfil', 'cargo', 'observacoes']

function maiuscular(obj: any) {
  const resultado = { ...obj }
  for (const campo of CAMPOS_MAIUSCULO) {
    if (resultado[campo] && typeof resultado[campo] === 'string') {
      resultado[campo] = resultado[campo].toUpperCase()
    }
  }
  return resultado
}

export async function GET() {
  const { data, error } = await supabase
    .from('membros')
    .select('id, nome, grupo, perfil, status')
    .order('nome', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(request: NextRequest) {
  const formData = await request.formData()

  const membro = maiuscular({
    nome: formData.get('nome'),
    telefone: formData.get('telefone'),
    data_nascimento: formData.get('data_nascimento') || null,
    comum: formData.get('comum'),
    cidade: formData.get('cidade'),
    tipo: formData.get('tipo'),
    instrumento: formData.get('instrumento') || null,
    grupo: formData.get('grupo'),
    nivel_acesso: formData.get('nivel_acesso'),
    cargo: formData.get('cargo') || null,
    observacoes: formData.get('observacoes') || null,
    status: 'Ativo',
    aprovado: false,
  })

  const { error } = await supabase.from('membros').insert([membro])

  if (error) {
    return NextResponse.redirect(new URL('/dashboard/membros/novo?erro=1', request.url))
  }

  return NextResponse.redirect(new URL('/dashboard/membros?sucesso=1', request.url))
}