import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import webpush from 'web-push'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

webpush.setVapidDetails(
  process.env.VAPID_SUBJECT!,
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
)

export async function POST() {
  const { data: assinaturas } = await supabase.from('push_subscriptions').select('*')

  if (!assinaturas || assinaturas.length === 0) {
    return NextResponse.json({ ok: true, enviados: 0 })
  }

  const payload = JSON.stringify({
    title: 'DARPE — Confirmação aberta!',
    body: 'O admin abriu as confirmações. Acesse para confirmar sua presença.'
  })

  let enviados = 0
  for (const item of assinaturas) {
    try {
      await webpush.sendNotification(item.subscription, payload)
      enviados++
    } catch (e) {
      await supabase.from('push_subscriptions').delete().eq('id', item.id)
    }
  }

  return NextResponse.json({ ok: true, enviados })
}