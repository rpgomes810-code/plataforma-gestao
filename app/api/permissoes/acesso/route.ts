import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const membro_id = searchParams.get('membro_id')

  if (!membro_id) return NextResponse.json({ acesso: false })

  const { data } = await supabaseAdmin
    .from('permissoes_admin')
    .select('id')
    .eq('membro_id', membro_id)
    .single()

  return NextResponse.json({ acesso: !!data })
}