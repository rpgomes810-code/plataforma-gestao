import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import webpush from 'web-push'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
  const { subscription, membro_id } = await req.json()

  try {
    webpush.setVapidDetails(
      process.env.VAPID_SUBJECT!,
      process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
      process.env.VAPID_PRIVATE_KEY!
    )

    // Envia notificação silenciosa para testar se a assinatura é válida
    await webpush.sendNotification(
      subscription,
      JSON.stringify({ title: '', body: '', silent: true })
    )

    // Atualiza assinatura no banco
    await supabase.from('push_subscriptions').upsert(
      { membro_id, subscription },
      { onConflict: 'membro_id' }
    )

    return NextResponse.json({ ok: true })
  } catch (e: any) {
    // Assinatura inválida — remove do banco
    await supabase.from('push_subscriptions').delete().eq('membro_id', membro_id)
    return NextResponse.json({ error: 'Assinatura inválida' }, { status: 400 })
  }
}