import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const { id, aprovadoPor } = await request.json()

    const { data: solicitacao, error: erroBusca } = await supabase
      .from('solicitacoes')
      .select('*')
      .eq('id', id)
      .single()

    if (erroBusca || !solicitacao) {
      return NextResponse.json({ error: 'Solicitação não encontrada' }, { status: 404 })
    }

    const { data: usuario, error: erroAuth } = await supabase.auth.admin.createUser({
      email: solicitacao.email,
      password: solicitacao.senha,
      email_confirm: true,
    })

    if (erroAuth) {
      return NextResponse.json({ error: erroAuth.message }, { status: 500 })
    }

    const hoje = new Date().toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' }).split('/').reverse().join('-')

    const { error: erroMembro } = await supabase
      .from('membros')
      .insert([{
        nome:                 solicitacao.nome,
        telefone:             solicitacao.telefone,
        email:                solicitacao.email,
        data_nascimento:      solicitacao.data_nascimento,
        comum:                solicitacao.comum,
        cidade:               solicitacao.cidade,
        instrumento:          solicitacao.instrumento,
        status:               'Ativo',
        user_id:              usuario.user?.id,
        data_inscricao_darpe: hoje,
      }])

    if (erroMembro) {
      return NextResponse.json({ error: erroMembro.message }, { status: 500 })
    }

    await supabase
      .from('solicitacoes')
      .update({ status: 'aprovado' })
      .eq('id', id)

    // Registra o log
    await supabase
      .from('logs')
      .insert([{
        usuario_nome: aprovadoPor || 'Administrador',
        acao: `Aprovou solicitação de: ${solicitacao.nome}`,
        tabela: 'solicitacoes',
        registro_id: id,
        dados_antes: { status: 'pendente' },
        dados_depois: { status: 'aprovado', nome: solicitacao.nome, email: solicitacao.email },
      }])

    return NextResponse.json({ success: true })

  } catch (error) {
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}