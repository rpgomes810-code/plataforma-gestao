export async function POST(req: NextRequest) {
  const body = await req.json()
  const { titulo, conteudo, perfis_destino, fixar_dashboard, dashboard_expira_em } = body
  const criado_por = await getUsuarioLogado()

  const { data, error } = await supabaseAdmin
    .from('comunicados')
    .insert([{
      titulo, conteudo, perfis_destino, criado_por,
      fixar_dashboard: fixar_dashboard || false,
      dashboard_expira_em: dashboard_expira_em || null
    }])
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Só envia notificação se NÃO for aviso de dashboard
  if (!fixar_dashboard) {
    const { data: membros } = await supabaseAdmin
      .from('membros')
      .select('id')
      .in('perfil', perfis_destino)
      .eq('status', 'Ativo')

    if (membros && membros.length > 0) {
      const ids = membros.map((m: any) => m.id)
      const { data: assinaturas } = await supabaseAdmin
        .from('push_subscriptions')
        .select('subscription')
        .in('membro_id', ids)

      const payload = JSON.stringify({
        title: `📢 Novo comunicado: ${titulo}`,
        body: conteudo.substring(0, 100) + (conteudo.length > 100 ? '...' : ''),
        url: '/dashboard/comunicados'
      })

      for (const item of assinaturas || []) {
        try {
          await webpush.sendNotification(item.subscription, payload)
        } catch (e) {}
      }
    }
  }

  return NextResponse.json({ ok: true, id: data.id })
}