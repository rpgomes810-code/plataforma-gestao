'use client'

import { useRouter } from 'next/navigation'

export default function BotaoExcluirHospital({ id, nome, usuarioNome }: { id: string, nome: string, usuarioNome?: string }) {
  const router = useRouter()

  const excluir = async () => {
    const confirmado = confirm(`Tem certeza que deseja excluir "${nome}"?`)
    if (!confirmado) return

    const dadosRes = await fetch(`/api/hospitais/${id}`)
    const dadosAntes = await dadosRes.json()

    const res = await fetch(`/api/hospitais/${id}`, { method: 'DELETE' })
    const data = await res.json()

    if (res.ok) {
      await fetch('/api/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          usuario_nome: usuarioNome || 'Administrador',
          acao: `Excluiu hospital: ${nome}`,
          tabela: 'hospitais',
          registro_id: id,
          dados_antes: dadosAntes,
          dados_depois: { excluido: true },
        }),
      })
      router.refresh()
    } else if (data.error?.includes('violates foreign key') || data.error?.includes('foreign key constraint')) {
      alert(`Não é possível excluir "${nome}" pois ele possui escalas vinculadas. Exclua as escalas primeiro.`)
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