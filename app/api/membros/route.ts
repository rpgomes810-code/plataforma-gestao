import { supabase } from '../../lib/supabase'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const formData = await request.formData()

  const membro = {
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
  }

  const { error } = await supabase.from('membros').insert([membro])

  if (error) {
    return NextResponse.redirect(new URL('/dashboard/membros/novo?erro=1', request.url))
  }

  return NextResponse.redirect(new URL('/dashboard/membros?sucesso=1', request.url))
}