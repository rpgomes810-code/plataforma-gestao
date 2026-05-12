'use client'

import { useRouter } from 'next/navigation'

export default function BotaoExcluirHospital({ id, nome }: { id: string, nome: string }) {
  const router = useRouter()

  const excluir = async () => {
    const confirmado = confirm(`Tem certeza que deseja excluir "${nome}"?`)
    if (!confirmado) return

    const res = await fetch(`/api/hospitais/${id}`, { method: 'DELETE' })

    if (res.ok) {
      router.refresh()
    } else {
      alert('Erro ao excluir hospital')
    }
  }

  return (
    <button onClick={excluir}
      className="flex-1 text-sm text-red-600 border border-red-200 rounded-lg py-1.5 hover:bg-red-50 transition">
      🗑️ Excluir
    </button>
  )
}