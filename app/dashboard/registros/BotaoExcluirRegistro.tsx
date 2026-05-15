'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function BotaoExcluirRegistro({ id, hospital }: { id: string, hospital: string }) {
  const router = useRouter()
  const [usuarioNome, setUsuarioNome] = useState('Administrador')

  useEffect(() => {
    fetch('/api/membros/eu')
      .then(res => res.json())
      .then(data => { if (data?.nome) setUsuarioNome(data.nome) })
  }, [])

  const excluir = async () => {
    const confirmado = confirm(`Tem certeza que deseja excluir este registro de atendimento?`)
    if (!confirmado) return

    const dadosRes = await fetch(`/api/registros/${id}`)
    const dadosAntes = dadosRes.ok ? await dadosRes.json() : { id }

    const res = await fetch(`/api/registros/${id}`, { method: 'DELETE' })

    if (res.ok) {
      await fetch('/api/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          usuario_nome: usuarioNome,
          acao: `Excluiu registro de atendimento: ${hospital}`,
          tabela: 'registros',
          registro_id: id,
          dados_antes: dadosAntes,
          dados_depois: { excluido: true },
        }),
      })
      router.refresh()
    } else {
      alert('Erro ao excluir registro')
    }
  }

  return (
    <button onClick={excluir}
      className="text-xs font-semibold px-3 py-1 rounded-full bg-red-50 text-red-600 hover:bg-red-100 transition">
      Excluir
    </button>
  )
}