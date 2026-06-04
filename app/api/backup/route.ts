import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET() {
  const tabelas = [
    'membros', 'escalas', 'registros', 'hospitais',
    'confirmacoes', 'grupos', 'comunicados', 'logs',
    'solicitacoes', 'candidatos', 'permissoes', 'push_subscriptions'
  ]

  const backup: Record<string, any[]> = {}

  for (const tabela of tabelas) {
    const { data } = await supabase.from(tabela).select('*')
    backup[tabela] = data || []
  }

  return NextResponse.json({
    gerado_em: new Date().toISOString(),
    versao: '1.0',
    dados: backup,
  })
}