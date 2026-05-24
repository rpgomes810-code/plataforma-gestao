'use client'

import { useState, useEffect } from 'react'
import CardConfirmacao from './CardConfirmacao'

export default function Confirmacoes() {
  const [dados, setDados] = useState<any>(null)

  const carregar = () => {
    fetch('/api/confirmacoes/pagina', { cache: 'no-store' })
      .then(r => r.json())
      .then(setDados)
  }

  useEffect(() => {
    carregar()
  }, [])

  if (!dados) return (
    <div style={{ background: '#f1f5f9', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: '#64748b', fontSize: 14 }}>Carregando...</p>
    </div>
  )

  const { membroLogado, escalas, confirmacoes, todosMembros } = dados
  const isAdmin = membroLogado?.nivel_acesso === 'Administrador'

  const escalasVisiveis = (escalas?.filter((escala: any) => {
    const eDoGrupo = membroLogado?.grupo === escala.grupo
    const temConfirmacao = confirmacoes?.some((c: any) => c.escala_id === escala.id && c.membro_id === membroLogado?.id)
    const eOAtendente = membroLogado?.nome === escala.atendentes
    return isAdmin || eDoGrupo || temConfirmacao || eOAtendente
  }) || []).sort((a: any, b: any) => new Date(b.criado_em || b.data).getTime() - new Date(a.criado_em || a.data).getTime())

  const abertas = escalasVisiveis.filter((e: any) => e.confirmacao_aberta)

  return (
    <div style={{ background: '#f1f5f9', minHeight: '100vh', padding: '28px 40px' }} className="conf-wrap">
      <style>{`
        @media (max-width: 768px) { .conf-wrap { padding: 16px !important; } }
      `}</style>

      <div style={{ maxWidth: 1280, margin: '0 auto' }}>

        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: '#1e293b', margin: 0 }}>Confirmações de Presença</h1>
          <p style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>
            {abertas.length} escala{abertas.length !== 1 ? 's' : ''} aguardando confirmação
          </p>
        </div>

        {escalasVisiveis.length === 0 ? (
          <div style={{
            background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
            padding: '48px 24px', textAlign: 'center',
          }}>
            <p style={{ fontSize: 36, marginBottom: 12 }}>✅</p>
            <p style={{ color: '#64748b', fontSize: 14 }}>Nenhuma escala aguardando confirmação</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {escalasVisiveis.map((escala: any) => {
              const confirmacoesEscala = confirmacoes?.filter((c: any) => c.escala_id === escala.id) || []
              const membrosDoGrupo = todosMembros?.filter((m: any) => m.grupo === escala.grupo) || []
              const totalGrupo = membrosDoGrupo.length

              return (
                <CardConfirmacao
                  key={escala.id}
                  escala={escala}
                  confirmacoesIniciais={confirmacoesEscala}
                  membroLogado={membroLogado}
                  totalGrupo={totalGrupo}
                  membrosDoGrupo={membrosDoGrupo}
                  todosMembros={todosMembros}
                  isAdmin={isAdmin}
                  onAtualizar={carregar}
                />
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}