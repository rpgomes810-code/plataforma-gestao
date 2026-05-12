'use client'

export default function BotaoExcluirEscala({ id }: { id: string }) {
  const excluir = async () => {
    const confirmado = confirm('Tem certeza que deseja excluir esta escala?')
    if (!confirmado) return

    const res = await fetch(`/api/escalas/${id}`, { method: 'DELETE' })

    if (res.ok) {
      window.location.reload()
    } else {
      alert('Erro ao excluir escala')
    }
  }

  return (
    <button onClick={excluir}
      className="text-xs text-red-600 hover:underline ml-3">
      Excluir
    </button>
  )
}