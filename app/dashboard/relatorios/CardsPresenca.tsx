'use client'

import { useState } from 'react'

type Item = { nome: string; grupo: string; escala: string; data: string }

function CardPresenca({ emoji, titulo, cor, items, corBg, corTexto }: {
  emoji: string
  titulo: string
  cor: string
  items: Item[]
  corBg: string
  corTexto: string
}) {
  const [aberto, setAberto] = useState(false)

  const formatarData = (data: string) => new Date(data + 'T12:00:00').toLocaleDateString('pt-BR')

  return (
    <div className="bg-white rounded-2xl shadow overflow-hidden">
      <button onClick={() => setAberto(!aberto)} className="w-full p-5 text-center hover:bg-gray-50 transition">
        <p className={`text-3xl font-bold ${cor}`}>{items.length}</p>
        <p className="text-sm text-gray-500 mt-1">{emoji} {titulo}</p>
        <p className="text-xs text-gray-400 mt-1">{aberto ? '▲ Ocultar' : '▼ Ver detalhes'}</p>
      </button>

      {aberto && (
        <div className="px-4 pb-4 space-y-2">
          {items.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-2">Nenhuma ocorrência ✅</p>
          ) : (
            items.map((item, i) => (
              <div key={i} className={`flex items-center justify-between ${corBg} rounded-lg px-3 py-2`}>
                <div>
                  <p className="text-sm font-semibold text-gray-800">{item.nome}</p>
                  <p className="text-xs text-gray-500">{item.grupo} · {item.escala}</p>
                </div>
                <span className={`text-xs font-semibold ${corTexto}`}>{formatarData(item.data)}</span>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}

export default function CardsPresenca({ confirmouMasNaoFoi, naoConfirmouMasFoi, faltou }: {
  confirmouMasNaoFoi: Item[]
  naoConfirmouMasFoi: Item[]
  faltou: Item[]
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <CardPresenca
        emoji="⚠️"
        titulo="Confirmou mas não foi"
        cor="text-orange-500"
        corBg="bg-orange-50"
        corTexto="text-orange-600"
        items={confirmouMasNaoFoi}
      />
      <CardPresenca
        emoji="🔵"
        titulo="Não confirmou mas foi"
        cor="text-blue-500"
        corBg="bg-blue-50"
        corTexto="text-blue-600"
        items={naoConfirmouMasFoi}
      />
      <CardPresenca
        emoji="❌"
        titulo="Não confirmou e não foi"
        cor="text-red-500"
        corBg="bg-red-50"
        corTexto="text-red-600"
        items={faltou}
      />
    </div>
  )
}