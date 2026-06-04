'use client'

import { useState } from 'react'

export default function BotaoBackup() {
  const [baixando, setBaixando] = useState(false)

  const fazerBackup = async () => {
    setBaixando(true)
    try {
      const res = await fetch('/api/backup')
      const data = await res.json()
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      const hoje = new Date().toISOString().split('T')[0]
      a.href = url
      a.download = `backup-darpe-${hoje}.json`
      a.click()
      URL.revokeObjectURL(url)
    } catch (e) {
      alert('Erro ao gerar backup.')
    }
    setBaixando(false)
  }

  return (
    <button
      onClick={fazerBackup}
      disabled={baixando}
      style={{
        padding: '10px 20px', borderRadius: 8, border: 'none',
        background: baixando ? '#93c5fd' : '#2563eb',
        color: '#fff', fontSize: 14, fontWeight: 600,
        cursor: baixando ? 'not-allowed' : 'pointer',
        display: 'flex', alignItems: 'center', gap: 8,
      }}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
        <polyline points="7 10 12 15 17 10"/>
        <line x1="12" y1="15" x2="12" y2="3"/>
      </svg>
      {baixando ? 'Gerando...' : 'Backup'}
    </button>
  )
}