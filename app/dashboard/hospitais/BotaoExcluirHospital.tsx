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
    <button onClick={excluir} title="Excluir" style={{
      width: 30, height: 30, borderRadius: 7,
      background: '#fff1f2',
      border: 'none',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      cursor: 'pointer',
    }}>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="3 6 5 6 21 6"/>
        <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
        <path d="M10 11v6"/><path d="M14 11v6"/>
        <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/>
      </svg>
    </button>
  )
}