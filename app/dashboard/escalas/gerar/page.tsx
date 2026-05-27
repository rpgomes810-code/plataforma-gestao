'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const meses = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro']

export default function GerarEscalas() {
  const router = useRouter()
  const hoje = new Date()
  const [mes, setMes] = useState(hoje.getMonth() + 2 > 12 ? 1 : hoje.getMonth() + 2)
  const [ano, setAno] = useState(hoje.getMonth() + 2 > 12 ? hoje.getFullYear() + 1 : hoje.getFullYear())
  const [loading, setLoading] = useState(false)
  const [resultado, setResultado] = useState<any>(null)
  const [erro, setErro] = useState('')

  const gerar = async () => {
    if (!confirm(`Gerar escalas para ${meses[mes - 1]} ${ano}? Isso criará todas as escalas do mês automaticamente.`)) return

    setLoading(true)
    setErro('')
    setResultado(null)

    const res = await fetch('/api/escalas/gerar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mes, ano }),
    })

    const data = await res.json()

    if (res.ok) {
      setResultado(data)
    } else {
      setErro(data.error || 'Erro ao gerar escalas')
    }

    setLoading(false)
  }

  const inputStyle: React.CSSProperties = {
    padding: '10px 14px', borderRadius: 8, border: '1px solid #e2e8f0',
    background: '#f8fafc', fontSize: 14, color: '#1e293b', outline: 'none',
    appearance: 'none', WebkitAppearance: 'none', cursor: 'pointer',
  }

  return (
    <div style={{ background: '#f1f5f9', minHeight: '100vh', padding: '28px 40px' }} className="gerar-wrap">
      <style>{`@media (max-width: 768px) { .gerar-wrap { padding: 16px !important; } }`}</style>

      <div style={{ maxWidth: 600, margin: '0 auto' }}>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: '#1e293b', margin: 0 }}>Gerar Escalas</h1>
            <p style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>O sistema gera automaticamente seguindo as regras de rotatividade</p>
          </div>
          <a href="/dashboard/escalas" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: '#64748b', textDecoration: 'none' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
            </svg>
            Voltar
          </a>
        </div>

        <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', padding: '28px' }}>

          <p style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', letterSpacing: 1, marginBottom: 16 }}>SELECIONE O PERÍODO</p>

          <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#64748b', marginBottom: 6 }}>Mês</label>
              <div style={{ position: 'relative' }}>
                <select value={mes} onChange={e => setMes(Number(e.target.value))} style={{ ...inputStyle, width: '100%', paddingRight: 32 }}>
                  {meses.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
                </select>
                <svg style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
                  width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="6 9 12 15 18 9"/>
                </svg>
              </div>
            </div>
            <div style={{ width: 120 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#64748b', marginBottom: 6 }}>Ano</label>
              <div style={{ position: 'relative' }}>
                <select value={ano} onChange={e => setAno(Number(e.target.value))} style={{ ...inputStyle, width: '100%', paddingRight: 32 }}>
                  {[2025, 2026, 2027].map(a => <option key={a} value={a}>{a}</option>)}
                </select>
                <svg style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
                  width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="6 9 12 15 18 9"/>
                </svg>
              </div>
            </div>
          </div>

          {/* Resumo das regras */}
          <div style={{ background: '#f8fafc', borderRadius: 10, padding: '16px', marginBottom: 24, border: '1px solid #f1f5f9' }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: '#475569', margin: '0 0 10px' }}>Regras aplicadas automaticamente:</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {[
                '✅ Grupos fixos alocados nos seus hospitais todo sábado',
                '✅ Grupo Misto → Pitangueiras apenas no 2º sábado',
                '✅ Grupo Cabreuva → Hortolandia + Retiro no 1º e 4º sábado',
                '✅ Rodízio justo: prioriza grupos que foram menos vezes',
                '✅ Atendentes ficam em branco para o ADM definir',
              ].map((r, i) => (
                <p key={i} style={{ fontSize: 12, color: '#64748b', margin: 0 }}>{r}</p>
              ))}
            </div>
          </div>

          {erro && (
            <div style={{ background: '#fee2e2', borderRadius: 8, padding: '12px 16px', marginBottom: 16, fontSize: 13, color: '#dc2626' }}>
              {erro}
            </div>
          )}

          {resultado && (
            <div style={{ background: '#dcfce7', borderRadius: 8, padding: '12px 16px', marginBottom: 16, fontSize: 13, color: '#16a34a' }}>
              ✅ {resultado.total} escalas geradas com sucesso para {meses[mes - 1]} {ano}!
            </div>
          )}

          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={gerar} disabled={loading} style={{
              flex: 1, padding: '12px', borderRadius: 8, border: 'none',
              background: loading ? '#93c5fd' : '#2563eb',
              color: '#fff', fontSize: 14, fontWeight: 700,
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}>
              {loading ? (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ animation: 'spin 1s linear infinite' }}>
                    <line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/>
                    <line x1="4.93" y1="4.93" x2="7.76" y2="7.76"/><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"/>
                    <line x1="2" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="22" y2="12"/>
                    <line x1="4.93" y1="19.07" x2="7.76" y2="16.24"/><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"/>
                  </svg>
                  Gerando...
                </>
              ) : (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/>
                    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
                  </svg>
                  Gerar Escalas de {meses[mes - 1]} {ano}
                </>
              )}
            </button>
            {resultado && (
              <button onClick={() => router.push('/dashboard/escalas')} style={{
                padding: '12px 20px', borderRadius: 8, border: '1px solid #2563eb',
                background: '#fff', color: '#2563eb', fontSize: 14, fontWeight: 600, cursor: 'pointer',
              }}>
                Ver escalas
              </button>
            )}
          </div>
          <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    </div>
  )
}