import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
  const { subscription, membro_id } = await req.json()

  const { data, error } = await supabase
    .from('push_subscriptions')
    .select('subscription')
    .eq('membro_id', membro_id)
    .single()

  if (error || !data) return NextResponse.json({ error: 'Sem assinatura' }, { status: 400 })

  // Compara o endpoint da assinatura do dispositivo com o salvo no banco
  const endpointDispositivo = subscription?.endpoint
  const endpointBanco = data.subscription?.endpoint

  if (!endpointDispositivo || !endpointBanco || endpointDispositivo !== endpointBanco) {
    // Endpoints diferentes — assinatura desatualizada, remove do banco
    await supabase.from('push_subscriptions').delete().eq('membro_id', membro_id)
    return NextResponse.json({ error: 'Assinatura desatualizada' }, { status: 400 })
  }

  // Atualiza assinatura no banco com a mais recente
  await supabase.from('push_subscriptions').upsert(
    { membro_id, subscription },
    { onConflict: 'membro_id' }
  )

  return NextResponse.json({ ok: true })
}