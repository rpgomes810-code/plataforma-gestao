import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
  const { subscription, membro_id } = await req.json()

  await supabase.from('push_subscriptions').upsert(
    { membro_id, subscription },
    { onConflict: 'membro_id' }
  )

  return NextResponse.json({ ok: true })
}