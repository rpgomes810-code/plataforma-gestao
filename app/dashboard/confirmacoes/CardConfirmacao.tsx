'use client'

import { useState } from 'react'

export default function CardConfirmacao({ escala, confirmacoesIniciais, membroLogado, totalGrupo, membrosDoGrupo, isAdmin, onAtualizar }: any) {
  const [confirmacoes, setConfirmacoes] = useState(confirmacoesIniciais)
  const [loading, setLoading] = useState(false)
  const [motivo, setMotivo] = useState('')
  const [mostraMotivo, setMostraMotivo] = useState(false)
  const [erro, setErro] = useState('')
  const [mostraDetalhes, setMostraDetalhes] = useState(false)

  const confirmados = confirmacoes.filter((c: any) => c.status === 'confirmado')
  const ausentes = confirmacoes.filter((c: any) => c.status === 'ausente')
  const minhaConfirmacao = confirmacoes.find((c: any) => c.membro_id === membroLogado?.id)
  const euSouDoGrupo = membroLogado?.grupo === escala.grupo
  const statusAtual = minhaConfirmacao?.status || null

  const formatarData = (data: string) => {
    return new Date(data + 'T12:00:00').toLocaleDateString('pt-BR', {
      weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric'
    })
  }

  const cancelarConfirmacao = async () => {
    setLoading(true)
    const res = await fetch('/api/confirmacoes', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        escala_id: escala.id,
        membro_id: membroLogado?.id,
      }),
    })
    if (res.ok) {
      setConfirmacoes((prev: any[]) => prev.filter((c: any) => c.membro_id !== membroLogado?.id))
      onAtualizar()
    }
    setLoading(false)
  }

  const confirmar = async (status: string) => {
    if (status === 'ausente' && !mostraMotivo) {
      setMostraMotivo(true)
      return
    }

    setLoading(true)
    setErro('')

    const res = await fetch('/api/confirmacoes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        escala_id: escala.id,
        membro_id: membroLogado?.id,
        status,
        motivo: status === 'ausente' ? motivo : null,
      }),
    })

    if (res.ok) {
      setConfirmacoes((prev: any[]) => {
        const semMinha = prev.filter((c: any) => c.membro_id !== membroLogado?.id)
        return [...semMinha, {
          id: Date.now(),
          escala_id: escala.id,
          membro_id: membroLogado?.id,
          status,
          tipo: 'normal',
          membros: { nome: membroLogado?.nome, instrumento: membroLogado?.instrumento, tipo: membroLogado?.tipo }
        }]
      })
      setMostraMotivo(false)
      setMotivo('')
      onAtualizar()
    } else {
      const data = await res.json()
      setErro(data.error || 'Erro ao confirmar')
    }

    setLoading(false)
  }

  return (
    <div className="bg-white rounded-2xl shadow overflow-hidden">
      <div className="bg-blue-600 px-6 py-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-white font-bold text-lg">{escala.grupo}</h3>
            <p className="text-blue-100 text-sm">{formatarData(escala.data)} · {escala.hora_inicio} · {escala.local_texto}</p>
          </div>
          {isAdmin && (
            <button
              onClick={async () => {
                await fetch(`/api/escalas/${escala.id}/confirmacao`, { method: 'PATCH' })
                onAtualizar()
              }}
              className="text-xs bg-white/20 text-white px-3 py-1 rounded-full hover:bg-white/30 transition"
            >
              {escala.confirmacao_aberta ? 'Fechar confirmações' : 'Abrir confirmações'}
            </button>
          )}
        </div>
      </div>

      <div className="p-6 space-y-4">
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span className="font-medium text-gray-700">Confirmações</span>
            <span className="text-gray-500">{confirmados.length} de {totalGrupo} confirmados</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2.5">
            <div className="bg-green-500 h-2.5 rounded-full transition-all"
              style={{ width: `${totalGrupo > 0 ? (confirmados.length / totalGrupo) * 100 : 0}%` }} />
          </div>
        </div>

        {isAdmin && (
          <div>
            <button
              onClick={() => setMostraDetalhes(!mostraDetalhes)}
              className="text-xs text-blue-600 hover:text-blue-800 font-semibold"
            >
              {mostraDetalhes ? '▲ Ocultar detalhes' : '▼ Ver detalhes'}
            </button>

            {mostraDetalhes && (
              <div className="mt-3 space-y-2">
                {membrosDoGrupo.map((membro: any) => {
                  const confirmacao = confirmacoes.find((c: any) => c.membro_id === membro.id)
                  const status = confirmacao?.status || 'pendente'
                  return (
                    <div key={membro.id} className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2">
                      <div>
                        <p className="text-sm font-medium text-gray-700">{membro.nome}</p>
                        <p className="text-xs text-gray-400">{membro.instrumento || membro.tipo}</p>
                      </div>
                      <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                        status === 'confirmado' ? 'bg-green-100 text-green-700' :
                        status === 'ausente' ? 'bg-red-100 text-red-700' :
                        'bg-gray-100 text-gray-500'
                      }`}>
                        {status === 'confirmado' ? '✅ Confirmado' :
                         status === 'ausente' ? '❌ Ausente' :
                         '⏳ Pendente'}
                      </span>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {confirmados.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase mb-2">✅ Confirmados ({confirmados.length})</p>
            <div className="flex flex-wrap gap-2">
              {confirmados.map((c: any) => (
                <span key={c.id} className="text-xs bg-green-50 text-green-700 px-2 py-1 rounded-full">
                  {c.membros?.nome}
                </span>
              ))}
            </div>
          </div>
        )}

        {ausentes.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase mb-2">⚠️ Vagas abertas ({ausentes.length})</p>
            <div className="space-y-2">
              {ausentes.map((a: any, i: number) => (
                <div key={i} className="flex items-center justify-between bg-yellow-50 rounded-lg px-3 py-2">
                  <div>
                    <p className="text-sm font-medium text-gray-700">{a.membros?.instrumento || a.membros?.tipo}</p>
                    <p className="text-xs text-gray-500">Ausência de: {a.membros?.nome}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {euSouDoGrupo && (
          <div className="border-t pt-4">
            <p className="text-sm font-medium text-gray-700 mb-3">Sua confirmação:</p>
            {erro && <p className="text-xs text-red-500 mb-2">{erro}</p>}

            {statusAtual === 'confirmado' && (
              <div className="flex items-center gap-3">
                <span className="text-sm text-green-600 font-semibold">
                  {minhaConfirmacao?.tipo === 'avulso' ? '✅ Você confirmou presença como avulso' : '✅ Você confirmou presença'}
                </span>
                <button onClick={cancelarConfirmacao} disabled={loading} className="text-xs text-gray-400 hover:text-gray-600">
                  {loading ? 'Aguarde...' : 'Cancelar'}
                </button>
              </div>
            )}

            {statusAtual === 'ausente' && (
              <div className="flex items-center gap-3">
                <span className="text-sm text-red-600 font-semibold">❌ Você informou ausência</span>
                <button onClick={cancelarConfirmacao} disabled={loading} className="text-xs text-gray-400 hover:text-gray-600">
                  {loading ? 'Aguarde...' : 'Cancelar'}
                </button>
              </div>
            )}

            {!statusAtual && (
              mostraMotivo ? (
                <div className="space-y-2">
                  <input
                    type="text"
                    value={motivo}
                    onChange={e => setMotivo(e.target.value)}
                    placeholder="Motivo da ausência (opcional)"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <div className="flex gap-2">
                    <button onClick={() => confirmar('ausente')} disabled={loading}
                      className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-red-600 transition disabled:opacity-50">
                      {loading ? 'Salvando...' : 'Confirmar ausência'}
                    </button>
                    <button onClick={() => setMostraMotivo(false)}
                      className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-200 transition">
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex gap-2">
                  <button onClick={() => confirmar('confirmado')} disabled={loading}
                    className="bg-green-500 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-green-600 transition disabled:opacity-50">
                    {loading ? 'Salvando...' : '✅ Confirmar presença'}
                  </button>
                  <button onClick={() => confirmar('ausente')} disabled={loading}
                    className="bg-red-50 text-red-600 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-red-100 transition disabled:opacity-50">
                    ❌ Não poderei estar presente
                  </button>
                </div>
              )
            )}
          </div>
        )}
      </div>
    </div>
  )
}