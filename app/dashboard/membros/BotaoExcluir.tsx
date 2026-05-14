'use client'

import { useRouter } from 'next/navigation'

export default function BotaoExcluir({ id, nome, usuarioNome }: { id: string, nome: string, usuarioNome?: string }) {
  const router = useRouter()

  const excluir = async () => {
    const confirmado = confirm(`Tem certeza que deseja excluir "${nome}"?`)
    if (!confirmado) return

    // Busca dados antes de excluir
    const dadosRes = await fetch(`/api/membros/${id}`)
    const dadosAntes = await dadosRes.json()

    const res = await fetch(`/api/membros/${id}`, { method: 'DELETE' })

    if (res.ok) {
      // Registra o log
      await fetch('/api/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          usuario_nome: usuarioNome || 'Administrador',
          acao: 'Excluiu membro',
          tabela: 'membros',
          registro_id: id,
          dados_antes: dadosAntes,
          dados_depois: null,
        }),
      })
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