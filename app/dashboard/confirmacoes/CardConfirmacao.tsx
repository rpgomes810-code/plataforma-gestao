'use client'

import { useState } from 'react'

export default function CardConfirmacao({ escala, confirmacoesIniciais, membroLogado, totalGrupo, membrosDoGrupo, todosMembros, isAdmin, onAtualizar }: any) {
  const [confirmacoes, setConfirmacoes] = useState(confirmacoesIniciais)
  const [loading, setLoading] = useState(false)
  const [motivo, setMotivo] = useState('')
  const [mostraMotivo, setMostraMotivo] = useState(false)
  const [erro, setErro] = useState('')
  const [mostraDetalhes, setMostraDetalhes] = useState(false)

  const confirmados = confirmacoes.filter((c: any) => c.status === 'confirmado')
  const ausentes = confirmacoes.filter((c: any) => c.status === 'ausente')
  const dispensados = confirmacoes.filter((c: any) => c.status === 'dispensado')
  const avulsos = confirmacoes.filter((c: any) => c.tipo === 'avulso' && c.status === 'confirmado')
  const minhaConfirmacao = confirmacoes.find((c: any) => c.membro_id === membroLogado?.id)
  const euSouDoGrupo = membroLogado?.grupo === escala.grupo
  const statusAtual = minhaConfirmacao?.status || null
  const souAvulso = !euSouDoGrupo && minhaConfirmacao?.tipo === 'avulso'

  // Atendente
  const atendenteMembro = todosMembros?.find((m: any) => m.nome === escala.atendentes)
  const euSouOAtendente = membroLogado?.nome === escala.atendentes
  const confirmacaoAtendente = atendenteMembro ? confirmacoes.find((c: any) => c.membro_id === atendenteMembro.id) : null
  const statusAtendente = confirmacaoAtendente?.status || null

  const formatarData = (data: string) => {
    return new Date(data + 'T12:00:00').toLocaleDateString('pt-BR', {
      weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric'
    })
  }

  const getMembro = (membro_id: string) => todosMembros?.find((m: any) => m.id === membro_id)

  const cancelarConfirmacao = async (membro_id?: string) => {
    setLoading(true)
    const id = membro_id || membroLogado?.id
    const res = await fetch('/api/confirmacoes', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ escala_id: escala.id, membro_id: id }),
    })
    if (res.ok) {
      setConfirmacoes((prev: any[]) => prev.filter((c: any) => c.membro_id !== id))
      onAtualizar()
    }
    setLoading(false)
  }

  const dispensar = async (membro_id: string, statusAnterior: string) => {
    const confirmado = confirm('Deseja dispensar este membro por excesso?')
    if (!confirmado) return

    const res = await fetch('/api/confirmacoes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        escala_id: escala.id,
        membro_id,
        status: 'dispensado',
        status_anterior: statusAnterior,
        tipo: 'normal',
      }),
    })
    if (res.ok) {
      setConfirmacoes((prev: any[]) => {
        const semMembro = prev.filter((c: any) => c.membro_id !== membro_id)
        return [...semMembro, { id: Date.now(), escala_id: escala.id, membro_id, status: 'dispensado', status_anterior: statusAnterior, tipo: 'normal' }]
      })
      onAtualizar()
    }
  }

  const desfazerDispensa = async (membro_id: string, statusAnterior: string | null) => {
    const novoStatus = statusAnterior || 'pendente'
    if (novoStatus === 'pendente') {
      const res = await fetch('/api/confirmacoes', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ escala_id: escala.id, membro_id }),
      })
      if (res.ok) {
        setConfirmacoes((prev: any[]) => prev.filter((c: any) => c.membro_id !== membro_id))
        onAtualizar()
      }
    } else {
      const res = await fetch('/api/confirmacoes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ escala_id: escala.id, membro_id, status: novoStatus, tipo: 'normal' }),
      })
      if (res.ok) {
        setConfirmacoes((prev: any[]) => {
          const semMembro = prev.filter((c: any) => c.membro_id !== membro_id)
          return [...semMembro, { id: Date.now(), escala_id: escala.id, membro_id, status: novoStatus, tipo: 'normal' }]
        })
        onAtualizar()
      }
    }
  }

  const confirmar = async (status: string, membro_id?: string) => {
    if (status === 'ausente' && !mostraMotivo && !membro_id) {
      setMostraMotivo(true)
      return
    }

    setLoading(true)
    setErro('')

    const id = membro_id || membroLogado?.id

    const res = await fetch('/api/confirmacoes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        escala_id: escala.id,
        membro_id: id,
        status,
        motivo: status === 'ausente' ? motivo : null,
      }),
    })

    if (res.ok) {
      setConfirmacoes((prev: any[]) => {
        const semMinha = prev.filter((c: any) => c.membro_id !== id)
        return [...semMinha, {
          id: Date.now(),
          escala_id: escala.id,
          membro_id: id,
          status,
          tipo: 'normal',
          membros: { nome: getMembro(id)?.nome || membroLogado?.nome }
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
            <span className="text-gray-500">{confirmados.length} de {totalGrupo} confirmados</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2.5">
            <div className="bg-green-500 h-2.5 rounded-full transition-all"
              style={{ width: `${totalGrupo > 0 ? (confirmados.length / totalGrupo) * 100 : 0}%` }} />
          </div>
        </div>

        {/* Atendente */}
        {escala.atendentes && (
          <div className="bg-blue-50 rounded-xl px-4 py-3">
            <p className="text-xs font-semibold text-blue-400 uppercase mb-2">🎙️ Atendente</p>
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-gray-800">{escala.atendentes}</p>
              <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                statusAtendente === 'confirmado' ? 'bg-green-100 text-green-700' :
                statusAtendente === 'ausente' ? 'bg-red-100 text-red-700' :
                statusAtendente === 'dispensado' ? 'bg-gray-100 text-gray-500' :
                'bg-yellow-100 text-yellow-700'
              }`}>
                {statusAtendente === 'confirmado' ? '✅ Confirmado' :
                 statusAtendente === 'ausente' ? '❌ Ausente' :
                 statusAtendente === 'dispensado' ? '🔕 Dispensado' :
                 '⏳ Pendente'}
              </span>
            </div>

            {euSouOAtendente && (
              <div className="mt-3 border-t border-blue-100 pt-3">
                <p className="text-sm font-medium text-gray-700 mb-2">Podemos contar com você?</p>
                {statusAtendente === 'confirmado' && (
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-green-600 font-semibold">✅ Você confirmou presença</span>
                    <button onClick={() => cancelarConfirmacao(atendenteMembro?.id)} disabled={loading} className="text-xs text-gray-400 hover:text-gray-600">
                      {loading ? 'Aguarde...' : 'Cancelar'}
                    </button>
                  </div>
                )}
                {statusAtendente === 'ausente' && (
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-red-600 font-semibold">❌ Você informou ausência</span>
                    <button onClick={() => cancelarConfirmacao(atendenteMembro?.id)} disabled={loading} className="text-xs text-gray-400 hover:text-gray-600">
                      {loading ? 'Aguarde...' : 'Cancelar'}
                    </button>
                  </div>
                )}
                {statusAtendente === 'dispensado' && (
                  <span className="text-sm text-gray-500 font-semibold">🔕 Você foi dispensado</span>
                )}
                {!statusAtendente && (
                  <div className="flex gap-2">
                    <button onClick={() => confirmar('confirmado', atendenteMembro?.id)} disabled={loading}
                      className="bg-green-500 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-green-600 transition disabled:opacity-50">
                      {loading ? 'Salvando...' : '✅ Confirmar presença'}
                    </button>
                    <button onClick={() => confirmar('ausente', atendenteMembro?.id)} disabled={loading}
                      className="bg-red-50 text-red-600 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-red-100 transition disabled:opacity-50">
                      ❌ Não poderei
                    </button>
                  </div>
                )}
              </div>
            )}

            {isAdmin && atendenteMembro && statusAtendente && statusAtendente !== 'dispensado' && (
              <button onClick={() => dispensar(atendenteMembro.id, statusAtendente)} className="text-xs text-gray-400 hover:text-orange-600 mt-2">
                Dispensar atendente
              </button>
            )}
            {isAdmin && atendenteMembro && statusAtendente === 'dispensado' && (
              <button onClick={() => desfazerDispensa(atendenteMembro.id, confirmacaoAtendente?.status_anterior)} className="text-xs text-gray-400 hover:text-blue-600 mt-2">
                Desfazer dispensa
              </button>
            )}
          </div>
        )}

        {isAdmin && (
          <div>
            <button onClick={() => setMostraDetalhes(!mostraDetalhes)} className="text-xs text-blue-600 hover:text-blue-800 font-semibold">
              {mostraDetalhes ? '▲ Ocultar detalhes' : '▼ Ver detalhes'}
            </button>

            {mostraDetalhes && (
              <div className="mt-3 space-y-2">
                {membrosDoGrupo.map((membro: any) => {
                  const confirmacao = confirmacoes.find((c: any) => c.membro_id === membro.id)
                  const status = confirmacao?.status || 'pendente'
                  const statusAnterior = confirmacao?.status_anterior || 'pendente'
                  return (
                    <div key={membro.id} className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2">
                      <div>
                        <p className="text-sm font-medium text-gray-700">{membro.nome}</p>
                        <p className="text-xs text-gray-400">{membro.instrumento || membro.tipo}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                          status === 'confirmado' ? 'bg-green-100 text-green-700' :
                          status === 'ausente' ? 'bg-red-100 text-red-700' :
                          status === 'dispensado' ? 'bg-gray-100 text-gray-500' :
                          'bg-yellow-100 text-yellow-700'
                        }`}>
                          {status === 'confirmado' ? '✅ Confirmado' :
                           status === 'ausente' ? '❌ Ausente' :
                           status === 'dispensado' ? '🔕 Dispensado' :
                           '⏳ Pendente'}
                        </span>
                        {(status === 'confirmado' || status === 'pendente') && (
                          <button onClick={() => dispensar(membro.id, status)} className="text-xs text-gray-400 hover:text-orange-600 transition">
                            Dispensar
                          </button>
                        )}
                        {status === 'dispensado' && (
                          <button onClick={() => desfazerDispensa(membro.id, statusAnterior)} className="text-xs text-gray-400 hover:text-blue-600 transition">
                            Desfazer
                          </button>
                        )}
                      </div>
                    </div>
                  )
                })}

                {avulsos.length > 0 && (
                  <div className="mt-2">
                    <p className="text-xs font-semibold text-blue-400 uppercase mb-2">🔄 Avulsos</p>
                    {avulsos.map((c: any) => {
                      const membroAvulso = getMembro(c.membro_id)
                      return (
                        <div key={c.id} className="flex items-center justify-between bg-blue-50 rounded-lg px-3 py-2">
                          <div>
                            <p className="text-sm font-medium text-gray-700">{membroAvulso?.nome || '—'}</p>
                            <p className="text-xs text-gray-400">{membroAvulso?.grupo || '—'}</p>
                            {membroAvulso?.telefone && <p className="text-xs text-blue-600">📱 {membroAvulso.telefone}</p>}
                          </div>
                          <span className="text-xs font-semibold px-2 py-1 rounded-full bg-blue-100 text-blue-700">✅ Avulso</span>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {confirmados.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase mb-2">✅ Confirmados ({confirmados.length})</p>
            <div className="flex flex-wrap gap-2">
              {confirmados.map((c: any) => {
                const membroAvulso = c.tipo === 'avulso' ? getMembro(c.membro_id) : null
                return (
                  <span key={c.id} className="text-xs bg-green-50 text-green-700 px-2 py-1 rounded-full">
                    {c.tipo === 'avulso' ? `${membroAvulso?.nome || '—'} (avulso)` : c.membros?.nome}
                  </span>
                )
              })}
            </div>
          </div>
        )}

        {dispensados.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase mb-2">🔕 Dispensados ({dispensados.length})</p>
            <div className="flex flex-wrap gap-2">
              {dispensados.map((c: any) => {
                const m = getMembro(c.membro_id)
                return (
                  <span key={c.id} className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded-full">
                    {m?.nome || c.membros?.nome || '—'}
                  </span>
                )
              })}
            </div>
          </div>
        )}

        {ausentes.filter((a: any) => !a.substituto_id).length > 0 && (
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase mb-2">⚠️ Vagas abertas ({ausentes.filter((a: any) => !a.substituto_id).length})</p>
            <div className="space-y-2">
              {ausentes.filter((a: any) => !a.substituto_id).map((a: any, i: number) => {
                const membroAusente = getMembro(a.membro_id)
                const tipoVaga = membroAusente?.tipo === 'Atendente'
                  ? 'Atendente'
                  : membroAusente?.instrumento || a.membros?.instrumento || a.membros?.tipo || 'Músico'
                return (
                  <div key={i} className="flex items-center justify-between bg-yellow-50 rounded-lg px-3 py-2">
                    <div>
                      <p className="text-sm font-medium text-gray-700">{tipoVaga}</p>
                      <p className="text-xs text-gray-500">Ausência de: {membroAusente?.nome || a.membros?.nome}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {souAvulso && (
          <div className="border-t pt-4">
            <div className="flex items-center gap-3">
              <span className="text-sm text-blue-600 font-semibold">✅ Você confirmou presença como avulso</span>
              <button onClick={() => cancelarConfirmacao()} disabled={loading} className="text-xs text-gray-400 hover:text-gray-600">
                {loading ? 'Aguarde...' : 'Cancelar'}
              </button>
            </div>
          </div>
        )}

        {euSouDoGrupo && (
          <div className="border-t pt-4">
            <p className="text-sm font-medium text-gray-700 mb-3">Podemos contar com você?</p>
            {erro && <p className="text-xs text-red-500 mb-2">{erro}</p>}

            {statusAtual === 'confirmado' && (
              <div className="flex items-center gap-3">
                <span className="text-sm text-green-600 font-semibold">✅ Você confirmou presença</span>
                <button onClick={() => cancelarConfirmacao()} disabled={loading} className="text-xs text-gray-400 hover:text-gray-600">
                  {loading ? 'Aguarde...' : 'Cancelar'}
                </button>
              </div>
            )}

            {statusAtual === 'ausente' && (
              <div className="flex items-center gap-3">
                <span className="text-sm text-red-600 font-semibold">❌ Você informou ausência</span>
                <button onClick={() => cancelarConfirmacao()} disabled={loading} className="text-xs text-gray-400 hover:text-gray-600">
                  {loading ? 'Aguarde...' : 'Cancelar'}
                </button>
              </div>
            )}

            {statusAtual === 'dispensado' && (
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-500 font-semibold">🔕 Você foi dispensado por excesso</span>
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