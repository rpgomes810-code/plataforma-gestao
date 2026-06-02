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
    <button
      onClick={excluir}
      title="Excluir escala"
      style={{
        width: 30, height: 30, borderRadius: 7, border: 'none',
        background: '#fee2e2', cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 0,
      }}
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="3 6 5 6 21 6"/>
        <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
        <path d="M10 11v6"/><path d="M14 11v6"/>
        <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/>
      </svg>
    </button>
  )
}