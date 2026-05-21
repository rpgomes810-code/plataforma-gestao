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
  const [busca, setBusca] = useState('')
  const [mostrarForm, setMostrarForm] = useState(false)
  const [editando, setEditando] = useState<any>(null)
  const [titulo, setTitulo] = useState('')
  const [conteudo, setConteudo] = useState('')
  const [perfisSelecionados, setPerfisSelecionados] = useState<string[]>([])
  const [salvando, setSalvando] = useState(false)
  const [loading, setLoading] = useState(true)

  const carregarComunicados = (b = busca) => {
    setLoading(true)
    fetch(`/api/comunicados?busca=${encodeURIComponent(b)}`)
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setComunicados(data); setLoading(false) })
      .catch(() => setLoading(false))
  }

  useEffect(() => {
    fetch('/api/membros/eu').then(r => r.json()).then(data => {
      setMembro(data)
      setPermissoes(data.permissoes || {})
    })
    carregarComunicados('')
  }, [])

  const podeCriar = permissoes?.comunicados?.criar === true
  const podeEditar = permissoes?.comunicados?.editar === true
  const podeExcluir = permissoes?.comunicados?.excluir === true

  const abrirEdicao = (comunicado: any) => {
    setEditando(comunicado)
    setTitulo(comunicado.titulo)
    setConteudo(comunicado.conteudo)
    setPerfisSelecionados(comunicado.perfis_destino || [])
    setMostrarForm(true)
  }

  const fecharForm = () => {
    setMostrarForm(false)
    setEditando(null)
    setTitulo('')
    setConteudo('')
    setPerfisSelecionados([])
  }

  const togglePerfil = (perfil: string) => {
    setPerfisSelecionados(prev =>
      prev.includes(perfil) ? prev.filter(p => p !== perfil) : [...prev, perfil]
    )
  }

  const selecionarTodos = () => {
    setPerfisSelecionados(perfisSelecionados.length === PERFIS.length ? [] : [...PERFIS])
  }

  const salvar = async () => {
    if (!titulo.trim() || !conteudo.trim() || perfisSelecionados.length === 0) {
      alert('Preencha título, conteúdo e selecione pelo menos um perfil.')
      return
    }
    setSalvando(true)

    if (editando) {
      await fetch('/api/comunicados', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: editando.id, titulo, conteudo, perfis_destino: perfisSelecionados }),
      })
    } else {
      await fetch('/api/comunicados', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ titulo, conteudo, perfis_destino: perfisSelecionados }),
      })
    }

    fecharForm()
    carregarComunicados('')
    setSalvando(false)
  }

  const excluir = async (id: string) => {
    if (!confirm('Excluir este comunicado?')) return
    await fetch('/api/comunicados', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    carregarComunicados()
  }

  const marcarCiente = async (comunicado_id: string) => {
    await fetch('/api/comunicados/ciente', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ comunicado_id }),
    })
    carregarComunicados()
  }

  const jaSouCiente = (comunicado: any) => {
    return comunicado.comunicados_leituras?.some((l: any) => l.membro_id === membro?.id)
  }

  const comunicadosVisiveis = comunicados.filter((c: any) => {
    if (podeCriar || podeEditar || podeExcluir) return true
    return c.perfis_destino?.includes(membro?.perfil)
  })

  const formatarData = (data: string) => new Date(data).toLocaleDateString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
  })

  const cardStyle = {
    background: 'rgba(255,255,255,0.08)',
    border: '1px solid rgba(255,255,255,0.15)',
    borderRadius: 16,
    padding: 20,
  }

  return (
    <div style={{ padding: 24, minHeight: '100vh', background: '#0f172a' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <p style={{ color: '#94a3b8', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0 }}>Gestão</p>
          <h2 style={{ color: '#ffffff', fontSize: 24, fontWeight: 700, margin: '4px 0 0' }}>Comunicados</h2>
        </div>
        {podeCriar && (
          <button onClick={() => mostrarForm ? fecharForm() : setMostrarForm(true)} style={{
            padding: '10px 20px', borderRadius: 12, border: 'none', cursor: 'pointer',
            fontWeight: 600, fontSize: 14, color: 'white',
            background: mostrarForm ? 'rgba(255,255,255,0.1)' : 'linear-gradient(135deg, #1e40af, #3b82f6)',
          }}>
            {mostrarForm ? '✕ Cancelar' : '+ Novo Comunicado'}
          </button>
        )}
      </div>

      {/* Formulário */}
      {mostrarForm && (podeCriar || podeEditar) && (
        <div style={{ ...cardStyle, marginBottom: 24 }}>
          <h3 style={{ color: '#e2e8f0', fontSize: 16, fontWeight: 700, margin: '0 0 16px' }}>
            {editando ? '✏️ Editar Comunicado' : 'Novo Comunicado'}
          </h3>

          <div style={{ marginBottom: 12 }}>
            <label style={{ color: '#94a3b8', fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 6 }}>Título *</label>
            <input value={titulo} onChange={e => setTitulo(e.target.value)} placeholder="Título do comunicado"
              style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.05)', color: '#f1f5f9', fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ color: '#94a3b8', fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 6 }}>Conteúdo *</label>
            <textarea value={conteudo} onChange={e => setConteudo(e.target.value)} placeholder="Digite o comunicado..." rows={4}
              style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.05)', color: '#f1f5f9', fontSize: 14, outline: 'none', resize: 'vertical', boxSizing: 'border-box' }} />
          </div>

          <div style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <label style={{ color: '#94a3b8', fontSize: 13, fontWeight: 500 }}>Enviar para *</label>
              <button onClick={selecionarTodos} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#60a5fa', fontSize: 12 }}>
                {perfisSelecionados.length === PERFIS.length ? 'Desmarcar todos' : 'Selecionar todos'}
              </button>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {PERFIS.map(perfil => (
                <button key={perfil} onClick={() => togglePerfil(perfil)}
                  style={{
                    padding: '6px 12px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 500,
                    background: perfisSelecionados.includes(perfil) ? '#3b82f6' : 'rgba(255,255,255,0.08)',
                    color: perfisSelecionados.includes(perfil) ? 'white' : '#94a3b8',
                  }}>
                  {perfil}
                </button>
              ))}
            </div>
          </div>

          <button onClick={salvar} disabled={salvando}
            style={{ padding: '12px 24px', borderRadius: 12, border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 14, color: 'white', background: 'linear-gradient(135deg, #1e40af, #3b82f6)', opacity: salvando ? 0.5 : 1 }}>
            {salvando ? 'Salvando...' : editando ? '💾 Salvar Alterações' : '📢 Enviar Comunicado'}
          </button>
        </div>
      )}

      {/* Busca */}
      <div style={{ marginBottom: 20 }}>
        <input
          value={busca}
          onChange={e => { setBusca(e.target.value); carregarComunicados(e.target.value) }}
          placeholder="🔍 Buscar comunicados..."
          style={{ width: '100%', padding: '12px 16px', borderRadius: 12, border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.05)', color: '#f1f5f9', fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
        />
      </div>

      {/* Lista */}
      {loading ? (
        <p style={{ color: '#64748b', textAlign: 'center', padding: 40 }}>Carregando...</p>
      ) : comunicadosVisiveis.length === 0 ? (
        <div style={{ ...cardStyle, textAlign: 'center', padding: 48 }}>
          <p style={{ fontSize: 36, margin: '0 0 8px' }}>📢</p>
          <p style={{ color: '#64748b' }}>Nenhum comunicado encontrado</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {comunicadosVisiveis.map(comunicado => {
            const ciente = jaSouCiente(comunicado)
            const totalCientes = comunicado.comunicados_leituras?.length || 0
            return (
              <div key={comunicado.id} style={{ ...cardStyle, borderLeft: ciente ? '3px solid #34d399' : '3px solid #f59e0b' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ color: '#f1f5f9', fontSize: 16, fontWeight: 700, margin: '0 0 4px' }}>{comunicado.titulo}</h3>
                    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                      <span style={{ color: '#64748b', fontSize: 12 }}>📅 {formatarData(comunicado.criado_em)}</span>
                      <span style={{ color: '#64748b', fontSize: 12 }}>👤 {comunicado.criado_por}</span>
                      <span style={{ color: '#34d399', fontSize: 12 }}>✅ {totalCientes} ciente{totalCientes !== 1 ? 's' : ''}</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {podeEditar && (
                      <button onClick={() => abrirEdicao(comunicado)}
                        style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: 8, padding: '6px 10px', cursor: 'pointer', color: '#60a5fa', fontSize: 12 }}>
                        ✏️
                      </button>
                    )}
                    {podeExcluir && (
                      <button onClick={() => excluir(comunicado.id)}
                        style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, padding: '6px 10px', cursor: 'pointer', color: '#f87171', fontSize: 12 }}>
                        🗑️
                      </button>
                    )}
                  </div>
                </div>

                <p style={{ color: '#cbd5e1', fontSize: 14, lineHeight: 1.6, margin: '12px 0' }}>{comunicado.conteudo}</p>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {comunicado.perfis_destino?.map((p: string) => (
                      <span key={p} style={{ padding: '3px 8px', borderRadius: 6, background: 'rgba(59,130,246,0.15)', color: '#60a5fa', fontSize: 11, fontWeight: 500 }}>{p}</span>
                    ))}
                  </div>
                  {!ciente ? (
                    <button onClick={() => marcarCiente(comunicado.id)}
                      style={{ padding: '8px 16px', borderRadius: 10, border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 13, color: 'white', background: 'linear-gradient(135deg, #059669, #10b981)' }}>
                      ✅ Estou ciente
                    </button>
                  ) : (
                    <span style={{ padding: '8px 16px', borderRadius: 10, background: 'rgba(52,211,153,0.1)', color: '#34d399', fontSize: 13, fontWeight: 600 }}>
                      ✅ Ciente
                    </span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}