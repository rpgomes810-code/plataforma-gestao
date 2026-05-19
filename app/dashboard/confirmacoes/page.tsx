'use client'

import { useState, useEffect } from 'react'
import CardConfirmacao from './CardConfirmacao'
import BotaoNotificacao from '@/app/components/BotaoNotificacao'

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

  if (!dados) return <div className="p-6 text-gray-500">Carregando...</div>

  const { membroLogado, escalas, confirmacoes, todosMembros } = dados
  const isAdmin = membroLogado?.nivel_acesso === 'Administrador'

  const escalasVisiveis = (escalas?.filter((escala: any) => {
    const eDoGrupo = membroLogado?.grupo === escala.grupo
    const temConfirmacao = confirmacoes?.some((c: any) => c.escala_id === escala.id && c.membro_id === membroLogado?.id)
    return isAdmin || eDoGrupo || temConfirmacao
  }) || []).sort((a: any, b: any) => new Date(b.criado_em || b.data).getTime() - new Date(a.criado_em || a.data).getTime())

  const abertas = escalasVisiveis.filter((e: any) => e.confirmacao_aberta)

  return (
    <div className="p-4 md:p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Confirmações de Presença</h2>
          <p className="text-sm text-gray-500">{abertas.length} escala(s) aguardando confirmação</p>
        </div>
        {membroLogado?.id && (
          <BotaoNotificacao membroId={membroLogado.id} />
        )}
      </div>

      {escalasVisiveis.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl shadow">
          <p className="text-4xl mb-3">✅</p>
          <p className="text-gray-500">Nenhuma escala aguardando confirmação</p>
        </div>
      ) : (
        <div className="space-y-6">
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
  )
}