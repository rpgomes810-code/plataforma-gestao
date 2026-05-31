'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function FiltroRelatorio({ periodoAtual, inicioAtual, fimAtual }: {
  periodoAtual: string
  inicioAtual?: string
  fimAtual?: string
}) {
  const router = useRouter()
  const [periodo, setPeriodo] = useState(periodoAtual)
  const [inicio, setInicio] = useState(inicioAtual || '')
  const [fim, setFim] = useState(fimAtual || '')

  const aplicar = () => {
    if (periodo === 'personalizado') {
      router.push(`/dashboard/relatorios?periodo=personalizado&inicio=${inicio}&fim=${fim}`)
    } else {
      router.push(`/dashboard/relatorios?periodo=${periodo}`)
    }
  }

  const inputStyle: React.CSSProperties = {
    padding: '9px 14px', borderRadius: 8,
    border: '1px solid #e2e8f0', background: '#fff',
    fontSize: 13, color: '#334155', outline: 'none',
    boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
  }

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'flex-end' }}>
      <div style={{ position: 'relative' }}>
        <select
          value={periodo}
          onChange={e => setPeriodo(e.target.value)}
          style={{ ...inputStyle, appearance: 'none', WebkitAppearance: 'none', paddingRight: 32, cursor: 'pointer' }}
        >
          <option value="mes_atual">Mês atual</option>
          <option value="mes_anterior">Mês anterior</option>
          <option value="bimestre">Último bimestre</option>
          <option value="trimestre">Último trimestre</option>
          <option value="semestre">Último semestre</option>
          <option value="ano">Último ano</option>
          <option value="personalizado">Personalizado</option>
        </select>
        <svg style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
          width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </div>

      {periodo === 'personalizado' && (
        <>
          <input type="date" value={inicio} onChange={e => setInicio(e.target.value)} style={inputStyle} />
          <input type="date" value={fim} onChange={e => setFim(e.target.value)} style={inputStyle} />
        </>
      )}

      <button onClick={aplicar} style={{
        padding: '9px 20px', borderRadius: 8, border: 'none',
        background: '#2563eb', color: '#fff',
        fontSize: 13, fontWeight: 600, cursor: 'pointer',
        boxShadow: '0 1px 2px rgba(37,99,235,0.2)',
      }}>
        Aplicar
      </button>
    </div>
  )
}