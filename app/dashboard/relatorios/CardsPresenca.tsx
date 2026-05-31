'use client'

import { useState } from 'react'

type Item = { nome: string; grupo: string; escala: string; data: string }

export default function CardsPresenca({ confirmouMasNaoFoi, naoConfirmouMasFoi, faltou }: {
  confirmouMasNaoFoi: Item[]
  naoConfirmouMasFoi: Item[]
  faltou: Item[]
}) {
  const [expandido, setExpandido] = useState<string | null>(null)
  const formatarData = (data: string) => new Date(data + 'T12:00:00').toLocaleDateString('pt-BR')

  const secoes = [
    { key: 'confirmou', label: 'Confirmou mas não foi', items: confirmouMasNaoFoi, cor: '#d97706', bg: '#fff7ed', border: '#d97706' },
    { key: 'naoconfirmou', label: 'Não confirmou mas foi', items: naoConfirmouMasFoi, cor: '#2563eb', bg: '#eff6ff', border: '#2563eb' },
    { key: 'faltou', label: 'Não confirmou e não foi', items: faltou, cor: '#dc2626', bg: '#fee2e2', border: '#dc2626' },
  ]

  return (
    <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', marginBottom: 12, overflow: 'hidden' }}>
      
      {/* Linha com os 3 números */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)' }}>
        {secoes.map((s, idx) => (
          <button
            key={s.key}
            onClick={() => setExpandido(expandido === s.key ? null : s.key)}
            style={{
              padding: '20px 16px', textAlign: 'center', cursor: 'pointer',
              background: expandido === s.key ? s.bg : '#fff',
              border: 'none',
              borderRight: idx < 2 ? '1px solid #f1f5f9' : 'none',
              borderBottom: expandido === s.key ? `2px solid ${s.border}` : '2px solid transparent',
              transition: 'all 0.15s',
            }}
          >
            <p style={{ fontSize: 36, fontWeight: 800, color: s.cor, margin: 0, lineHeight: 1 }}>{s.items.length}</p>
            <p style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.5, margin: '8px 0 4px' }}>{s.label}</p>
            <p style={{ fontSize: 11, color: s.cor, margin: 0, fontWeight: 600 }}>
              {expandido === s.key ? '▲ Ocultar' : '▼ Ver membros'}
            </p>
          </button>
        ))}
      </div>

      {/* Detalhes expandidos */}
      {expandido && (() => {
        const secao = secoes.find(s => s.key === expandido)!
        return (
          <div style={{ padding: '16px 20px', background: secao.bg, borderTop: `1px solid ${secao.border}33` }}>
            {secao.items.length === 0 ? (
              <p style={{ fontSize: 13, color: '#94a3b8', textAlign: 'center', margin: 0 }}>Nenhuma ocorrência ✅</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {secao.items.map((item, i) => (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    background: '#fff', borderRadius: 8, padding: '10px 14px',
                    border: `1px solid ${secao.border}22`,
                  }}>
                    <div>
                      <p style={{ fontSize: 13, fontWeight: 600, color: '#1e293b', margin: 0 }}>{item.nome}</p>
                      <p style={{ fontSize: 11, color: '#64748b', margin: 0 }}>{item.grupo} · {item.escala}</p>
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 700, color: secao.cor, flexShrink: 0 }}>
                      {formatarData(item.data)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )
      })()}
    </div>
  )
}