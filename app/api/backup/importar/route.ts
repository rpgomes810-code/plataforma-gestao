import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
  const { dados, modo } = await req.json()
  // modo: 'comparar' | 'substituir' | 'adicionar'

  const tabelas = Object.keys(dados)
  const resultado: Record<string, any> = {}

  if (modo === 'comparar') {
    for (const tabela of tabelas) {
      const { data: atuais } = await supabase.from(tabela).select('*')
      const idsAtuais = new Set((atuais || []).map((r: any) => r.id))
      const registrosBackup = dados[tabela] || []

      const novos = registrosBackup.filter((r: any) => !idsAtuais.has(r.id))
      const diferentes: any[] = []
      const iguais: any[] = []

      for (const reg of registrosBackup) {
        if (!idsAtuais.has(reg.id)) continue
        const atual = (atuais || []).find((r: any) => r.id === reg.id)
        if (JSON.stringify(atual) !== JSON.stringify(reg)) {
          diferentes.push({ backup: reg, atual })
        } else {
          iguais.push(reg)
        }
      }

      resultado[tabela] = {
        novos: novos.length,
        diferentes: diferentes.length,
        iguais: iguais.length,
        detalhes: {
          novos,
          diferentes,
        }
      }
    }
    return NextResponse.json({ ok: true, comparacao: resultado })
  }

  if (modo === 'substituir') {
    for (const tabela of tabelas) {
      const registros = dados[tabela] || []
      if (registros.length === 0) continue
      await supabase.from(tabela).delete().neq('id', '00000000-0000-0000-0000-000000000000')
      await supabase.from(tabela).insert(registros)
    }
    return NextResponse.json({ ok: true })
  }

  if (modo === 'adicionar') {
    for (const tabela of tabelas) {
      const { data: atuais } = await supabase.from(tabela).select('id')
      const idsAtuais = new Set((atuais || []).map((r: any) => r.id))
      const registros = (dados[tabela] || []).filter((r: any) => !idsAtuais.has(r.id))
      if (registros.length === 0) continue
      await supabase.from(tabela).insert(registros)
    }
    return NextResponse.json({ ok: true })
  }

  return NextResponse.json({ error: 'Modo inválido' }, { status: 400 })
}