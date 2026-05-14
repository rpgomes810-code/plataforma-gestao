'use client'

import { useEffect, useState } from 'react'

export default function BotaoExcluirEscala({ id }: { id: string }) {
  const [usuarioNome, setUsuarioNome] = useState('Administrador')

  useEffect(() => {
    fetch('/api/membros/eu')
      .then(res => res.json())
      .then(data => { if (data?.nome) setUsuarioNome(data.nome) })
  }, [])

  const excluir = async () => {
    const confirmado = confirm('Tem certeza que deseja excluir esta escala?')
    if (!confirmado) return

    // Busca dados da escala antes de excluir
    const dadosRes = await fetch(`/api/escalas/${id}`)
    const dadosAntes = dadosRes.ok ? await dadosRes.json() : { id }

    const res = await fetch(`/api/escalas/${id}`, { method: 'DELETE' })

    if (res.ok) {
      await fetch('/api/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          usuario_nome: usuarioNome,
          acao: 'Excluiu escala',
          tabela: 'escalas',
          registro_id: id,
          dados_antes: dadosAntes,
          dados_depois: { excluido: true },
        }),
      })
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