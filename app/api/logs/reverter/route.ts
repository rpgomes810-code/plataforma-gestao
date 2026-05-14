import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
  const { log_id, tabela, dados_antes } = await req.json()

  if (!tabela || !dados_antes) {
    return NextResponse.json({ error: 'Dados insuficientes para reverter' }, { status: 400 })
  }

  // Remove campos que não devem ser reinseridos
  const { id, ...dadosSemId } = dados_antes

  const { error } = await supabase
    .from(tabela)
    .insert([{ id, ...dadosSemId }])

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Marca o log como revertido
  await supabase
    .from('logs')
    .update({ acao: `[REVERTIDO] ${dados_antes.nome ? 'Excluiu membro: ' + dados_antes.nome : 'Exclusão revertida'}` })
    .eq('id', log_id)

  return NextResponse.json({ ok: true })
}