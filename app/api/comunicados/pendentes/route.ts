import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'

export const dynamic = 'force-dynamic'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(req: NextRequest) {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { getAll() { return cookieStore.getAll() }, setAll() {} } }
    )

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json([], { status: 200 })

    const { data: membro } = await supabaseAdmin
      .from('membros')
      .select('id, perfil')
      .eq('user_id', user.id)
      .single()

    if (!membro) return NextResponse.json([], { status: 200 })

    // Busca comunicados destinados ao perfil do membro (não avisos)
    const { data: comunicados } = await supabaseAdmin
      .from('comunicados')
      .select('*, comunicados_leituras(membro_id)')
      .eq('fixar_dashboard', false)
      .order('criado_em', { ascending: true })

    if (!comunicados) return NextResponse.json([], { status: 200 })

    // Filtra só os que são para o perfil do membro e que ele ainda não leu
    const pendentes = comunicados.filter(c => {
      const destinos = Array.isArray(c.perfis_destino) ? c.perfis_destino : []
      if (!destinos.includes(membro.perfil)) return false
      const jaLeu = c.comunicados_leituras?.some((l: any) => l.membro_id === membro.id)
      return !jaLeu
    })

    return NextResponse.json(pendentes)
  } catch {
    return NextResponse.json([], { status: 200 })
  }
}