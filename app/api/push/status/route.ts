import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const membro_id = searchParams.get('membro_id')
  const endpoint = searchParams.get('endpoint')

  if (!membro_id || !endpoint) {
    return NextResponse.json({ ativo: false })
  }

  const { data } = await supabase
    .from('push_subscriptions')
    .select('subscription')
    .eq('membro_id', membro_id)
    .single()

  if (!data) return NextResponse.json({ ativo: false })

  const endpointBanco = data.subscription?.endpoint
  const ativo = endpointBanco === endpoint

  return NextResponse.json({ ativo })
}