'use client'

import { useRouter } from 'next/navigation'

export default function BotaoExcluir({ id, nome }: { id: string, nome: string }) {
  const router = useRouter()

  const excluir = async () => {
    const confirmado = confirm(`Tem certeza que deseja excluir "${nome}"?`)
    if (!confirmado) return

    const res = await fetch(`/api/membros/${id}`, { method: 'DELETE' })

    if (res.ok) {
      router.refresh()
    } else {
      alert('Erro ao excluir membro')
    }
  }

  return (
    <button onClick={excluir}
      className="text-xs font-semibold px-3 py-1 rounded-full bg-red-50 text-red-600 hover:bg-red-100 transition">
      Excluir
    </button>
  )
}