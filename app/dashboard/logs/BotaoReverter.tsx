'use client'

import { useRouter } from 'next/navigation'

export default function BotaoReverter({ logId, tabela, dadosAntes }: {
  logId: string
  tabela: string
  dadosAntes: object
}) {
  const router = useRouter()

  const reverter = async () => {
    const confirmado = confirm('Tem certeza que deseja reverter essa exclusão?')
    if (!confirmado) return

    const res = await fetch('/api/logs/reverter', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ log_id: logId, tabela, dados_antes: dadosAntes }),
    })

    if (res.ok) {
      alert('Ação revertida com sucesso!')
      router.refresh()
    } else {
      const data = await res.json()
      alert('Erro ao reverter: ' + data.error)
    }
  }

  return (
    <button onClick={reverter}
      className="text-xs font-semibold px-2 py-1 rounded-full bg-orange-50 text-orange-600 hover:bg-orange-100 transition">
      ↩ Reverter
    </button>
  )
}