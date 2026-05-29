'use client'

import { useEffect, useState } from 'react'

const PERFIS = [
  'Músico/Vocal', 'Atendente', 'Organizador', 'Ancião',
  'Cooperador Jovens', 'Cooperador Oficial', 'Diácono',
  'Encarregado Local', 'Encarregado Regional', 'Administrador', 'Secretário',
]

export default function Comunicados() {
  const [comunicados, setComunicados] = useState<any[]>([])
  const [membro, setMembro] = useState<any>(null)
  const [permissoes, setPermissoes] = useState<any>(null)
  const [membros, setMembros] = useState<any[]>([])
  const [busca, setBusca] = useState('')
  const [mostrarForm, setMostrarForm] = useState(false)
  const [tipoForm, setTipoForm] = useState<'comunicado' | 'aviso'>('comunicado')
  const [editando, setEditando] = useState<any>(null)
  const [titulo, setTitulo] = useState('')
  const [conteudo, setConteudo] = useState('')
  const [perfisSelecionados, setPerfisSelecionados] = useState<string[]>([])
  const [diasAviso, setDiasAviso] = useState(7)
  const [salvando, setSalvando] = useState(false)
  const [loading, setLoading] = useState(true)
  const [expandido, setExpandido] = useState<string | null>(null)

  const carregarComunicados = (b = busca) => {
    setLoading(true)
    fetch(`/api/comunicados?busca=${encodeURIComponent(b)}`)
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setComunicados(data); setLoading(false) })
      .catch(() => setLoading(false))
  }

  useEffect(() => {
    fetch('/api/membros/eu').then(r => r.json()).then(data => { setMembro(data); setPermissoes(data.permissoes || {}) })
    fetch('/api/membros').then(r => r.json()).then(data => { if (Array.isArray(data)) setMembros(data) })
    carregarComunicados('')
  }, [])

  const podeCriar = permissoes?.comunicados?.criar === true
  const podeEditar = permissoes?.comunicados?.editar === true
  const podeExcluir = permissoes?.comunicados?.excluir === true
  const isGestor = podeCriar || podeEditar || podeExcluir

  const abrirNovoAviso = () => {
    setEditando(null); setTitulo(''); setConteudo(''); setPerfisSelecionados([]); setDiasAviso(7)
    setTipoForm('aviso'); setMostrarForm(true)
  }

  const abrirNovoComunicado = () => {
    setEditando(null); setTitulo(''); setConteudo(''); setPerfisSelecionados([]); setDiasAviso(7)
    setTipoForm('comunicado'); setMostrarForm(true)
  }

  const abrirEdicao = (comunicado: any) => {
    setEditando(comunicado); setTitulo(comunicado.titulo)
    setConteudo(comunicado.conteudo); setPerfisSelecionados(comunicado.perfis_destino || [])
    setTipoForm(comunicado.fixar_dashboard ? 'aviso' : 'comunicado')
    setMostrarForm(true)
  }

  const fecharForm = () => {
    setMostrarForm(false); setEditando(null)
    setTitulo(''); setConteudo(''); setPerfisSelecionados([])
  }

  const togglePerfil = (perfil: string) => {
    setPerfisSelecionados(prev => prev.includes(perfil) ? prev.filter(p => p !== perfil) : [...prev, perfil])
  }

  const selecionarTodos = () => {
    setPerfisSelecionados(perfisSelecionados.length === PERFIS.length ? [] : [...PERFIS])
  }

  const salvar = async () => {
    if (!titulo.trim() || !conteudo.trim()) {
      alert('Preencha título e conteúdo.')
      return
    }
    if (tipoForm === 'comunicado' && perfisSelecionados.length === 0) {
      alert('Selecione pelo menos um perfil.')
      return
    }
    setSalvando(true)

    const expira = new Date()
    expira.setDate(expira.getDate() + diasAviso)
    const dashboard_expira_em = expira.toISOString().split('T')[0]

    const body = tipoForm === 'aviso'
      ? { titulo, conteudo, perfis_destino: PERFIS, fixar_dashboard: true, dashboard_expira_em }
      : { titulo, conteudo, perfis_destino: perfisSelecionados, fixar_dashboard: false }

    if (editando) {
      await fetch('/api/comunicados', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: editando.id, ...body }) })
    } else {
      await fetch('/api/comunicados', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    }
    fecharForm(); carregarComunicados(''); setSalvando(false)
  }

  const excluir = async (id: string) => {
    if (!confirm('Excluir este comunicado?')) return
    await fetch('/api/comunicados', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) })
    carregarComunicados()
  }

  const marcarCiente = async (comunicado_id: string) => {
    await fetch('/api/comunicados/ciente', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ comunicado_id }) })
    carregarComunicados()
  }

  const jaSouCiente = (comunicado: any) => comunicado.comunicados_leituras?.some((l: any) => l.membro_id === membro?.id)
  const souDestinatario = (comunicado: any) => comunicado.perfis_destino?.includes(membro?.perfil)
  const getDestinatarios = (comunicado: any) => membros.filter(m => comunicado.perfis_destino?.includes(m.perfil) && m.status === 'Ativo')
  const getCientes = (comunicado: any) => comunicado.comunicados_leituras?.map((l: any) => l.membro_id) || []

  const comunicadosVisiveis = comunicados.filter((c: any) => {
    if (isGestor) return true
    return c.perfis_destino?.includes(membro?.perfil)
  })

  const formatarData = (data: string) => new Date(data).toLocaleDateString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
  })

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '10px 14px', borderRadius: 8,
    border: '1px solid #e2e8f0', background: '#f8fafc',
    fontSize: 14, color: '#1e293b', outline: 'none', boxSizing: 'border-box',
  }

  return (
    <div style={{ background: '#f1f5f9', minHeight: '100vh', padding: '28px 40px' }} className="com-wrap">
      <style>{`@media (max-width: 768px) { .com-wrap { padding: 16px !important; } }`}</style>

      <div style={{ maxWidth: 1280, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: '#1e293b', margin: 0 }}>Comunicados</h1>
            <p style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>{comunicadosVisiveis.length} comunicado{comunicadosVisiveis.length !== 1 ? 's' : ''}</p>
          </div>
          {podeCriar && (
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={abrirNovoAviso} style={{
                padding: '9px 16px', borderRadius: 8, border: '1px solid #d97706',
                background: '#fff', color: '#d97706', fontSize: 13, fontWeight: 600, cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 6,
              }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                Novo Aviso
              </button>
              <button onClick={mostrarForm && tipoForm === 'comunicado' ? fecharForm : abrirNovoComunicado} style={{
                padding: '9px 16px', borderRadius: 8,
                border: mostrarForm && tipoForm === 'comunicado' ? '1px solid #e2e8f0' : '1px solid #2563eb',
                background: '#fff',
                color: mostrarForm && tipoForm === 'comunicado' ? '#475569' : '#2563eb',
                fontSize: 13, fontWeight: 600, cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 6,
              }}>
                {mostrarForm && tipoForm === 'comunicado' ? '✕ Cancelar' : (
                  <>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                    </svg>
                    Novo Comunicado
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Formulário */}
        {mostrarForm && (podeCriar || podeEditar) && (
          <div style={{ background: '#fff', borderRadius: 12, border: `1px solid ${tipoForm === 'aviso' ? '#fde68a' : '#e2e8f0'}`, boxShadow: '0 1px 3px rgba(0,0,0,0.06)', padding: '24px 28px', marginBottom: 20 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: '#1e293b', margin: '0 0 20px', display: 'flex', alignItems: 'center', gap: 8 }}>
              {tipoForm === 'aviso' ? '⚠️ Novo Aviso para o Dashboard' : editando ? 'Editar Comunicado' : 'Novo Comunicado'}
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#64748b', marginBottom: 6 }}>Título *</label>
                <input value={titulo} onChange={e => setTitulo(e.target.value)} placeholder="Título" style={inputStyle} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#64748b', marginBottom: 6 }}>Conteúdo *</label>
                <textarea value={conteudo} onChange={e => setConteudo(e.target.value)} placeholder="Digite o conteúdo..." rows={4}
                  style={{ ...inputStyle, resize: 'vertical' }} />
              </div>

              {tipoForm === 'aviso' && (
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#64748b', marginBottom: 6 }}>Exibir no dashboard por quantos dias? *</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <input type="number" min={1} max={90} value={diasAviso} onChange={e => setDiasAviso(Number(e.target.value))}
                      style={{ ...inputStyle, width: 100 }} />
                    <span style={{ fontSize: 13, color: '#64748b' }}>
                      dias (até {(() => { const d = new Date(); d.setDate(d.getDate() + diasAviso); return d.toLocaleDateString('pt-BR') })()})
                    </span>
                  </div>
                </div>
              )}

              {tipoForm === 'comunicado' && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                    <label style={{ fontSize: 12, fontWeight: 600, color: '#64748b' }}>Enviar para *</label>
                    <button onClick={selecionarTodos} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#2563eb', fontSize: 12, fontWeight: 600 }}>
                      {perfisSelecionados.length === PERFIS.length ? 'Desmarcar todos' : 'Selecionar todos'}
                    </button>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {PERFIS.map(perfil => (
                      <button key={perfil} onClick={() => togglePerfil(perfil)} style={{
                        padding: '6px 12px', borderRadius: 8, border: 'none', cursor: 'pointer',
                        fontSize: 12, fontWeight: 600,
                        background: perfisSelecionados.includes(perfil) ? '#2563eb' : '#f1f5f9',
                        color: perfisSelecionados.includes(perfil) ? '#fff' : '#64748b',
                      }}>
                        {perfil}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', gap: 10, paddingTop: 4 }}>
                <button onClick={salvar} disabled={salvando} style={{
                  padding: '10px 24px', borderRadius: 8, border: 'none',
                  background: salvando ? '#93c5fd' : tipoForm === 'aviso' ? '#d97706' : '#2563eb',
                  color: '#fff', fontSize: 14, fontWeight: 600,
                  cursor: salvando ? 'not-allowed' : 'pointer',
                }}>
                  {salvando ? 'Salvando...' : tipoForm === 'aviso' ? 'Publicar Aviso' : editando ? 'Salvar Alterações' : 'Enviar Comunicado'}
                </button>
                <button onClick={fecharForm} style={{
                  padding: '10px 24px', borderRadius: 8, border: 'none',
                  background: '#f1f5f9', color: '#475569', fontSize: 14, fontWeight: 600, cursor: 'pointer',
                }}>
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Busca */}
        <div style={{
          background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12,
          padding: '11px 16px', marginBottom: 16,
          boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input value={busca} onChange={e => { setBusca(e.target.value); carregarComunicados(e.target.value) }}
            placeholder="Buscar comunicados..."
            style={{ border: 'none', outline: 'none', fontSize: 14, color: '#334155', width: '100%', background: 'transparent' }}
          />
        </div>

        {/* Lista */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: 48, color: '#64748b' }}>Carregando...</div>
        ) : comunicadosVisiveis.length === 0 ? (
          <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', padding: '48px 24px', textAlign: 'center' }}>
            <p style={{ fontSize: 36, marginBottom: 12 }}>📢</p>
            <p style={{ color: '#64748b', fontSize: 14 }}>Nenhum comunicado encontrado</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {comunicadosVisiveis.map(comunicado => {
              const ciente = jaSouCiente(comunicado)
              const destinatarios = getDestinatarios(comunicado)
              const cientes = getCientes(comunicado)
              const totalDestinatarios = destinatarios.length
              const totalCientes = cientes.length
              const percentual = totalDestinatarios > 0 ? Math.round((totalCientes / totalDestinatarios) * 100) : 0
              const expandidoAgora = expandido === comunicado.id
              const isAviso = comunicado.fixar_dashboard

              return (
                <div key={comunicado.id} style={{
                  background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                  borderLeft: `4px solid ${isAviso ? '#d97706' : ciente ? '#16a34a' : '#d97706'}`,
                  padding: '20px 24px',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                        {isAviso && (
                          <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 999, background: '#fff7ed', color: '#d97706' }}>
                            ⚠️ AVISO DASHBOARD
                          </span>
                        )}
                        <h3 style={{ fontSize: 15, fontWeight: 700, color: '#1e293b', margin: 0 }}>{comunicado.titulo}</h3>
                      </div>
                      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                        <span style={{ fontSize: 12, color: '#94a3b8' }}>📅 {formatarData(comunicado.criado_em)}</span>
                        <span style={{ fontSize: 12, color: '#94a3b8' }}>👤 {comunicado.criado_por}</span>
                        {isAviso && comunicado.dashboard_expira_em && (
                          <span style={{ fontSize: 12, color: '#d97706' }}>
                            ⏱️ Expira em {new Date(comunicado.dashboard_expira_em + 'T12:00:00').toLocaleDateString('pt-BR')}
                          </span>
                        )}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 6 }}>
                      {podeEditar && (
                        <button onClick={() => abrirEdicao(comunicado)} title="Editar" style={{
                          width: 30, height: 30, borderRadius: 7, border: 'none',
                          background: '#eff6ff', cursor: 'pointer',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                            <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                          </svg>
                        </button>
                      )}
                      {podeExcluir && (
                        <button onClick={() => excluir(comunicado.id)} title="Excluir" style={{
                          width: 30, height: 30, borderRadius: 7, border: 'none',
                          background: '#fff1f2', cursor: 'pointer',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="3 6 5 6 21 6"/>
                            <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>

                  <p style={{ fontSize: 14, color: '#475569', lineHeight: 1.6, margin: '0 0 14px', wordBreak: 'break-word' }}>{comunicado.conteudo}</p>

                  {!isAviso && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 14 }}>
                      {comunicado.perfis_destino?.map((p: string) => (
                        <span key={p} style={{ padding: '3px 10px', borderRadius: 999, background: '#eff6ff', color: '#2563eb', fontSize: 11, fontWeight: 600 }}>{p}</span>
                      ))}
                    </div>
                  )}

                  {isGestor && totalDestinatarios > 0 && !isAviso && (
                    <div style={{ background: '#f8fafc', borderRadius: 10, padding: '12px 16px', marginBottom: 12 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                        <span style={{ fontSize: 13, fontWeight: 600, color: '#475569' }}>Ciência dos destinatários</span>
                        <button onClick={() => setExpandido(expandidoAgora ? null : comunicado.id)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 700, color: percentual === 100 ? '#16a34a' : '#2563eb', display: 'flex', alignItems: 'center', gap: 4 }}>
                          {totalCientes}/{totalDestinatarios} — {percentual}%
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            {expandidoAgora ? <polyline points="18 15 12 9 6 15"/> : <polyline points="6 9 12 15 18 9"/>}
                          </svg>
                        </button>
                      </div>
                      <div style={{ height: 6, borderRadius: 999, background: '#e2e8f0' }}>
                        <div style={{ height: 6, borderRadius: 999, background: percentual === 100 ? '#16a34a' : '#2563eb', width: `${percentual}%`, transition: 'width 0.3s' }} />
                      </div>
                      {expandidoAgora && (
                        <div style={{ marginTop: 14, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                          <div>
                            <p style={{ fontSize: 12, fontWeight: 700, color: '#16a34a', margin: '0 0 8px' }}>✅ Cientes ({totalCientes})</p>
                            {destinatarios.filter(d => cientes.includes(d.id)).map(d => (
                              <p key={d.id} style={{ fontSize: 13, color: '#475569', margin: '0 0 4px' }}>• {d.nome}</p>
                            ))}
                            {totalCientes === 0 && <p style={{ fontSize: 13, color: '#94a3b8' }}>Nenhum ainda</p>}
                          </div>
                          <div>
                            <p style={{ fontSize: 12, fontWeight: 700, color: '#d97706', margin: '0 0 8px' }}>⏳ Pendentes ({totalDestinatarios - totalCientes})</p>
                            {destinatarios.filter(d => !cientes.includes(d.id)).map(d => (
                              <p key={d.id} style={{ fontSize: 13, color: '#475569', margin: '0 0 4px' }}>• {d.nome}</p>
                            ))}
                            {totalDestinatarios === totalCientes && <p style={{ fontSize: 13, color: '#94a3b8' }}>Todos cientes! 🎉</p>}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {souDestinatario(comunicado) && !isAviso && (
                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                      {!ciente ? (
                        <button onClick={() => marcarCiente(comunicado.id)} style={{
                          padding: '8px 20px', borderRadius: 8, border: 'none',
                          background: '#16a34a', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer',
                        }}>
                          ✅ Estou ciente
                        </button>
                      ) : (
                        <span style={{ padding: '8px 20px', borderRadius: 8, background: '#dcfce7', color: '#16a34a', fontSize: 13, fontWeight: 600 }}>
                          ✅ Ciente
                        </span>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}