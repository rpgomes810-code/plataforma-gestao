export async function registrarLog({
  usuario_id,
  usuario_nome,
  acao,
  tabela,
  registro_id,
  dados_antes,
  dados_depois,
}: {
  usuario_id?: string
  usuario_nome?: string
  acao: string
  tabela?: string
  registro_id?: string
  dados_antes?: object
  dados_depois?: object
}) {
  await fetch('/api/logs', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      usuario_id,
      usuario_nome,
      acao,
      tabela,
      registro_id,
      dados_antes: dados_antes || null,
      dados_depois: dados_depois || null,
    }),
  })
}