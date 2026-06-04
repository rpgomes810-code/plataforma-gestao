'use client'

import { useState, useRef } from 'react'

type Comparacao = Record<string, {
  novos: number
  diferentes: number
  iguais: number
  detalhes: {
    novos: any[]
    diferentes: Array<{ backup: any; atual: any }>
  }
}>

const NOMES_TABELAS: Record<string, string> = {
  membros: 'Membros',
  escalas: 'Escalas',
  registros: 'Registros',
  hospitais: 'Hospitais',
  confirmacoes: 'Confirmações',
  grupos: 'Grupos',
  comunicados: 'Comunicados',
  logs: 'Logs',
  solicitacoes: 'Solicitações',
  candidatos: 'Candidatos',
  permissoes: 'Permissões',
  push_subscriptions: 'Assinaturas Push',
}

export default function BotaoBackup() {
  const [baixando, setBaixando] = useState(false)
  const [etapa, setEtapa] = useState<'idle' | 'comparando' | 'resultado' | 'importando' | 'concluido'>('idle')
  const [comparacao, setComparacao] = useState<Comparacao | null>(null)
  const [dadosBackup, setDadosBackup] = useState<any>(null)
  const [tabelaAberta, setTabelaAberta] = useState<string | null>(null)
  const [campoAberto, setCampoAberto] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

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

  const selecionarArquivo = () => inputRef.current?.click()

  const carregarArquivo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setEtapa('comparando')
    try {
      const texto = await file.text()
      const json = JSON.parse(texto)
      const dados = json.dados || json

      setDadosBackup(dados)

      const res = await fetch('/api/backup/importar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dados, modo: 'comparar' }),
      })
      const result = await res.json()
      setComparacao(result.comparacao)
      setEtapa('resultado')
    } catch (e) {
      alert('Erro ao ler arquivo de backup.')
      setEtapa('idle')
    }
    e.target.value = ''
  }

  const importar = async (modo: 'substituir' | 'adicionar') => {
    const msg = modo === 'substituir'
      ? 'ATENÇÃO: Isso vai SUBSTITUIR todos os dados atuais pelos do backup. Tem certeza?'
      : 'Isso vai adicionar apenas os registros que estão faltando. Tem certeza?'
    if (!confirm(msg)) return

    setEtapa('importando')
    try {
      const res = await fetch('/api/backup/importar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dados: dadosBackup, modo }),
      })
      if (res.ok) {
        setEtapa('concluido')
      } else {
        alert('Erro ao importar backup.')
        setEtapa('resultado')
      }
    } catch (e) {
      alert('Erro ao importar backup.')
      setEtapa('resultado')
    }
  }

  const temDiferencas = comparacao && Object.values(comparacao).some(t => t.novos > 0 || t.diferentes > 0)

  return (
    <>
      <input ref={inputRef} type="file" accept=".json" onChange={carregarArquivo} style={{ display: 'none' }} />

      <div style={{ display: 'flex', gap: 8 }}>
        <button onClick={fazerBackup} disabled={baixando} style={{
          padding: '10px 20px', borderRadius: 8, border: 'none',
          background: baixando ? '#93c5fd' : '#2563eb',
          color: '#fff', fontSize: 14, fontWeight: 600,
          cursor: baixando ? 'not-allowed' : 'pointer',
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
            <polyline points="7 10 12 15 17 10"/>
            <line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
          {baixando ? 'Gerando...' : 'Backup'}
        </button>

        <button onClick={selecionarArquivo} style={{
          padding: '10px 20px', borderRadius: 8, border: '1px solid #e2e8f0',
          background: '#fff', color: '#475569', fontSize: 14, fontWeight: 600,
          cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
            <polyline points="17 8 12 3 7 8"/>
            <line x1="12" y1="3" x2="12" y2="15"/>
          </svg>
          Importar
        </button>
      </div>

      {/* MODAL */}
      {etapa !== 'idle' && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div style={{ background: '#fff', borderRadius: 16, width: '100%', maxWidth: 680, maxHeight: '90vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>

            {/* Header */}
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: 16, fontWeight: 800, color: '#1e293b', margin: 0 }}>
                {etapa === 'comparando' && '🔍 Analisando backup...'}
                {etapa === 'resultado' && '📊 Resultado da Comparação'}
                {etapa === 'importando' && '⏳ Importando...'}
                {etapa === 'concluido' && '✅ Importação Concluída!'}
              </h2>
              {etapa !== 'comparando' && etapa !== 'importando' && (
                <button onClick={() => { setEtapa('idle'); setComparacao(null); setDadosBackup(null); setTabelaAberta(null) }}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', fontSize: 20 }}>✕</button>
              )}
            </div>

            {/* Conteúdo */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>

              {etapa === 'comparando' && (
                <div style={{ textAlign: 'center', padding: '40px 0' }}>
                  <div style={{ width: 40, height: 40, border: '3px solid #2563eb', borderTopColor: 'transparent', borderRadius: '50%', margin: '0 auto 16px', animation: 'spin 1s linear infinite' }} />
                  <p style={{ color: '#64748b', fontSize: 14 }}>Comparando dados do backup com o sistema atual...</p>
                  <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                </div>
              )}

              {etapa === 'resultado' && comparacao && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {!temDiferencas && (
                    <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 10, padding: '16px', textAlign: 'center' }}>
                      <p style={{ fontSize: 14, fontWeight: 600, color: '#16a34a', margin: 0 }}>✅ Nenhuma diferença encontrada! O sistema está igual ao backup.</p>
                    </div>
                  )}

                  {Object.entries(comparacao).map(([tabela, info]) => (
                    <div key={tabela} style={{ border: '1px solid #e2e8f0', borderRadius: 10, overflow: 'hidden' }}>
                      <button onClick={() => setTabelaAberta(tabelaAberta === tabela ? null : tabela)}
                        style={{ width: '100%', padding: '12px 16px', background: '#f8fafc', border: 'none', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: 13, fontWeight: 700, color: '#1e293b' }}>{NOMES_TABELAS[tabela] || tabela}</span>
                        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                          {info.novos > 0 && <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 999, background: '#dcfce7', color: '#16a34a' }}>{info.novos} novos</span>}
                          {info.diferentes > 0 && <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 999, background: '#fef9c3', color: '#854d0e' }}>{info.diferentes} diferentes</span>}
                          {info.iguais > 0 && <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 999, background: '#f1f5f9', color: '#64748b' }}>{info.iguais} iguais</span>}
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                            style={{ transform: tabelaAberta === tabela ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>
                            <polyline points="6 9 12 15 18 9"/>
                          </svg>
                        </div>
                      </button>

                      {tabelaAberta === tabela && (
                        <div style={{ padding: '12px 16px', borderTop: '1px solid #f1f5f9' }}>

                          {info.detalhes.novos.length > 0 && (
                            <div style={{ marginBottom: 12 }}>
                              <p style={{ fontSize: 12, fontWeight: 700, color: '#16a34a', margin: '0 0 8px' }}>🆕 Registros novos ({info.detalhes.novos.length})</p>
                              {info.detalhes.novos.map((r: any) => (
                                <div key={r.id} style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8, padding: '8px 12px', marginBottom: 6, fontSize: 12 }}>
                                  <strong>{r.nome || r.titulo || r.grupo || r.id}</strong>
                                  {r.data && <span style={{ color: '#64748b', marginLeft: 8 }}>{r.data}</span>}
                                </div>
                              ))}
                            </div>
                          )}

                          {info.detalhes.diferentes.length > 0 && (
                            <div>
                              <p style={{ fontSize: 12, fontWeight: 700, color: '#854d0e', margin: '0 0 8px' }}>✏️ Registros diferentes ({info.detalhes.diferentes.length})</p>
                              {info.detalhes.diferentes.map((d: any, i: number) => (
                                <div key={i} style={{ border: '1px solid #fde68a', borderRadius: 8, marginBottom: 8, overflow: 'hidden' }}>
                                  <button onClick={() => setCampoAberto(campoAberto === `${tabela}-${i}` ? null : `${tabela}-${i}`)}
                                    style={{ width: '100%', padding: '8px 12px', background: '#fffbeb', border: 'none', cursor: 'pointer', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#854d0e', display: 'flex', justifyContent: 'space-between' }}>
                                    <span>{d.backup?.nome || d.backup?.titulo || d.backup?.grupo || d.backup?.id}</span>
                                    <span>Ver diferenças ▾</span>
                                  </button>
                                  {campoAberto === `${tabela}-${i}` && (
                                    <div style={{ padding: '8px 12px' }}>
                                      {Object.keys(d.backup).map(campo => {
                                        if (JSON.stringify(d.backup[campo]) === JSON.stringify(d.atual[campo])) return null
                                        return (
                                          <div key={campo} style={{ marginBottom: 6, fontSize: 11 }}>
                                            <strong style={{ color: '#475569' }}>{campo}:</strong>
                                            <div style={{ background: '#fee2e2', padding: '2px 6px', borderRadius: 4, color: '#dc2626', marginTop: 2 }}>Backup: {String(d.backup[campo] ?? '—')}</div>
                                            <div style={{ background: '#dcfce7', padding: '2px 6px', borderRadius: 4, color: '#16a34a', marginTop: 2 }}>Atual: {String(d.atual[campo] ?? '—')}</div>
                                          </div>
                                        )
                                      })}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}

                          {info.detalhes.novos.length === 0 && info.detalhes.diferentes.length === 0 && (
                            <p style={{ fontSize: 12, color: '#94a3b8', margin: 0 }}>Todos os registros são iguais.</p>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {etapa === 'importando' && (
                <div style={{ textAlign: 'center', padding: '40px 0' }}>
                  <div style={{ width: 40, height: 40, border: '3px solid #2563eb', borderTopColor: 'transparent', borderRadius: '50%', margin: '0 auto 16px', animation: 'spin 1s linear infinite' }} />
                  <p style={{ color: '#64748b', fontSize: 14 }}>Importando dados...</p>
                </div>
              )}

              {etapa === 'concluido' && (
                <div style={{ textAlign: 'center', padding: '40px 0' }}>
                  <span style={{ fontSize: 48 }}>✅</span>
                  <p style={{ fontSize: 16, fontWeight: 700, color: '#16a34a', marginTop: 16 }}>Dados importados com sucesso!</p>
                  <p style={{ fontSize: 13, color: '#64748b' }}>Recarregue a página para ver os dados atualizados.</p>
                  <button onClick={() => window.location.reload()} style={{
                    marginTop: 16, padding: '10px 24px', borderRadius: 8, border: 'none',
                    background: '#2563eb', color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer',
                  }}>
                    Recarregar página
                  </button>
                </div>
              )}
            </div>

            {/* Footer com botões */}
            {etapa === 'resultado' && temDiferencas && (
              <div style={{ padding: '16px 24px', borderTop: '1px solid #f1f5f9', display: 'flex', gap: 8, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                <button onClick={() => importar('adicionar')} style={{
                  padding: '10px 20px', borderRadius: 8, border: '1px solid #e2e8f0',
                  background: '#fff', color: '#475569', fontSize: 14, fontWeight: 600, cursor: 'pointer',
                }}>
                  ➕ Adicionar só o que falta
                </button>
                <button onClick={() => importar('substituir')} style={{
                  padding: '10px 20px', borderRadius: 8, border: 'none',
                  background: '#dc2626', color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer',
                }}>
                  🔄 Substituir tudo
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}