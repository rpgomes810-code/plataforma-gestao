import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET() {
  const { data: ausentes, error } = await supabase
    .from('confirmacoes')
    .select('*, escalas!confirmacoes_escala_id_fkey(id, data, grupo, local_texto, hora_inicio, confirmacao_aberta), membros!confirmacoes_membro_id_fkey(nome, instrumento, tipo)')
    .eq('status', 'ausente')
    .is('substituto_id', null)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const vagas = ausentes?.filter((a: any) =>
    a.escalas?.confirmacao_aberta === true
  ) || []

  return NextResponse.json(vagas)
}

export async function POST(req: Request) {
  const { escala_id, membro_id, confirmacao_id } = await req.json()

  // Cria confirmação do substituto
  const { error: erroConfirmacao } = await supabase
    .from('confirmacoes')
    .upsert([{
      escala_id,
      membro_id,
      status: 'confirmado',
      tipo: 'avulso',
    }], { onConflict: 'escala_id,membro_id' })

  if (erroConfirmacao) return NextResponse.json({ error: erroConfirmacao.message }, { status: 500 })

  // Atualiza o registro do ausente com o substituto_id
  const { error: erroSubstituto } = await supabase
    .from('confirmacoes')
    .update({ substituto_id: membro_id })
    .eq('id', confirmacao_id)

  if (erroSubstituto) return NextResponse.json({ error: erroSubstituto.message }, { status: 500 })

  return NextResponse.json({ ok: true })
}