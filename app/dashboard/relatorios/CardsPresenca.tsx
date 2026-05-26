'use client'

import { useState } from 'react'

type Item = { nome: string; grupo: string; escala: string; data: string }

function CardPresenca({ titulo, items, bg, color }: {
  titulo: string
  items: Item[]
  bg: string
  color: string
}) {
  const [aberto, setAberto] = useState(false)
  const formatarData = (data: string) => new Date(data + 'T12:00:00').toLocaleDateString('pt-BR')

  return (
    <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
      <button onClick={() => setAberto(!aberto)} style={{
        width: '100%', padding: '20px', textAlign: 'center',
        background: 'none', border: 'none', cursor: 'pointer',
      }}>
        <p style={{ fontSize: 32, fontWeight: 800, color, margin: 0 }}>{items.length}</p>
        <p style={{ fontSize: 13, color: '#64748b', margin: '6px 0 4px' }}>{titulo}</p>
        <p style={{ fontSize: 11, color: '#94a3b8', margin: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            {aberto ? <polyline points="18 15 12 9 6 15"/> : <polyline points="6 9 12 15 18 9"/>}
          </svg>
          {aberto ? 'Ocultar' : 'Ver detalhes'}
        </p>
      </button>

      {aberto && (
        <div style={{ padding: '0 16px 16px', display: 'flex', flexDirection: 'column', gap: 6 }}>
          {items.length === 0 ? (
            <p style={{ fontSize: 13, color: '#94a3b8', textAlign: 'center', padding: '8px 0' }}>Nenhuma ocorrência ✅</p>
          ) : (
            items.map((item, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                background: bg, borderRadius: 8, padding: '10px 12px',
              }}>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 600, color: '#1e293b', margin: 0 }}>{item.nome}</p>
                  <p style={{ fontSize: 11, color: '#64748b', margin: 0 }}>{item.grupo} · {item.escala}</p>
                </div>
                <span style={{ fontSize: 11, fontWeight: 600, color, flexShrink: 0 }}>{formatarData(item.data)}</span>
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
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 20 }} className="cards-presenca">
      <style>{`@media (max-width: 768px) { .cards-presenca { grid-template-columns: 1fr !important; } }`}</style>
      <CardPresenca titulo="Confirmou mas não foi" items={confirmouMasNaoFoi} bg="#fff7ed" color="#d97706" />
      <CardPresenca titulo="Não confirmou mas foi" items={naoConfirmouMasFoi} bg="#eff6ff" color="#2563eb" />
      <CardPresenca titulo="Não confirmou e não foi" items={faltou} bg="#fee2e2" color="#dc2626" />
    </div>
  )
}