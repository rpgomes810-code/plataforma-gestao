'use client'

import { useState, useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'

type Solicitacao = {
  id: string
  nome: string
  telefone: string
  email: string
  data_nascimento: string
  comum: string
  cidade: string
  instrumento: string
  status: string
  created_at: string
}

const PERFIS = [
  'Músico/Vocal', 'Atendente', 'Organizador', 'Ancião',
  'Cooperador Jovens', 'Cooperador Oficial', 'Diácono',
  'Encarregado Local', 'Encarregado Regional', 'Administrador', 'Secretário',
]

export default function Solicitacoes() {
  const [solicitacoes, setSolicitacoes] = useState<Solicitacao[]>([])
  const [loading, setLoading] = useState(true)
  const [filtro, setFiltro] = useState('pendente')
  const [processando, setProcessando] = useState<string | null>(null)
  const [usuarioNome, setUsuarioNome] = useState('Administrador')
  const [modalAberto, setModalAberto] = useState<Solicitacao | null>(null)
  const [perfilSelecionado, setPerfilSelecionado] = useState('')

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const carregar = () => {
    setLoading(true)
    supabase.from('solicitacoes').select('*').eq('status', filtro)
      .order('created_at', { ascending: false })
      .then(({ data }) => { setSolicitacoes(data || []); setLoading(false) })
  }

  useEffect(() => { carregar() }, [filtro])

  useEffect(() => {
    fetch('/api/membros/eu').then(res => res.json()).then(data => { if (data?.nome) setUsuarioNome(data.nome) })
  }, [])

  const abrirModalAprovar = (s: Solicitacao) => {
    setPerfilSelecionado('')
    setModalAberto(s)
  }

  const confirmarAprovacao = async () => {
    if (!modalAberto) return
    if (!perfilSelecionado) {
      alert('Selecione um perfil antes de aprovar!')
      return
    }
    setProcessando(modalAberto.id)
    setModalAberto(null)

    const res = await fetch('/api/aprovar-solicitacao', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: modalAberto.id, aprovadoPor: usuarioNome, perfil: perfilSelecionado }),
    })
    if (res.ok) carregar()
    else { const data = await res.json(); alert('Erro ao aprovar: ' + data.error) }
    setProcessando(null)
  }

  const rejeitar = async (id: string) => {
    setProcessando(id)
    await supabase.from('solicitacoes').update({ status: 'rejeitado' }).eq('id', id)
    await fetch('/api/logs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ usuario_nome: usuarioNome, acao: `Rejeitou solicitação`, tabela: 'solicitacoes', registro_id: id, dados_antes: { status: 'pendente' }, dados_depois: { status: 'rejeitado' } }),
    })
    carregar()
    setProcessando(null)
  }

  const calcularIdade = (dataNascimento: string) => {
    if (!dataNascimento) return '—'
    const hoje = new Date()
    const nascimento = new Date(dataNascimento + 'T12:00:00')
    let idade = hoje.getFullYear() - nascimento.getFullYear()
    const mes = hoje.getMonth() - nascimento.getMonth()
    if (mes < 0 || (mes === 0 && hoje.getDate() < nascimento.getDate())) idade--
    return `${idade} anos`
  }

  const formatarData = (data: string) => {
    if (!data) return '—'
    return new Date(data + 'T12:00:00').toLocaleDateString('pt-BR')
  }

  const formatarDataHora = (data: string) => new Date(data).toLocaleDateString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
  })

  return (
    <div style={{ background: '#f1f5f9', minHeight: '100vh', padding: '28px 40px' }} className="solic-wrap">
      <style>{`@media (max-width: 768px) { .solic-wrap { padding: 16px !important; } .solic-grid { grid-template-columns: 1fr 1fr !important; } }`}</style>

      {/* MODAL PERFIL */}
      {modalAberto && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, padding: 16,
        }}>
          <div style={{
            background: '#fff', borderRadius: 14, padding: 28,
            width: '100%', maxWidth: 420,
            boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
          }}>
            <h2 style={{ fontSize: 17, fontWeight: 800, color: '#1e293b', margin: '0 0 4px' }}>Aprovar Solicitação</h2>
            <p style={{ fontSize: 13, color: '#64748b', margin: '0 0 20px' }}>
              Defina o perfil de <strong>{modalAberto.nome}</strong> antes de liberar o acesso.
            </p>

            <label style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', letterSpacing: 1, display: 'block', marginBottom: 6 }}>
              PERFIL DO MEMBRO
            </label>
            <div style={{ position: 'relative' }}>
              <select
                value={perfilSelecionado}
                onChange={e => setPerfilSelecionado(e.target.value)}
                style={{
                  width: '100%', padding: '9px 32px 9px 12px', borderRadius: 8,
                  border: '1px solid #e2e8f0', background: '#f8fafc',
                  fontSize: 13, color: '#334155', outline: 'none',
                  appearance: 'none', WebkitAppearance: 'none', cursor: 'pointer',
                }}
              >
                <option value="">Selecione um perfil...</option>
                {PERFIS.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
              <svg style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
                width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </div>

            <div style={{ display: 'flex', gap: 8, marginTop: 20 }}>
              <button
                onClick={() => setModalAberto(null)}
                style={{
                  flex: 1, padding: '9px 0', borderRadius: 8,
                  border: '1px solid #e2e8f0', background: '#fff',
                  color: '#475569', fontSize: 13, fontWeight: 600, cursor: 'pointer',
                }}
              >
                Cancelar
              </button>
              <button
                onClick={confirmarAprovacao}
                disabled={!perfilSelecionado}
                style={{
                  flex: 1, padding: '9px 0', borderRadius: 8, border: 'none',
                  background: perfilSelecionado ? '#16a34a' : '#e2e8f0',
                  color: perfilSelecionado ? '#fff' : '#94a3b8',
                  fontSize: 13, fontWeight: 600,
                  cursor: perfilSelecionado ? 'pointer' : 'not-allowed',
                  transition: 'background 0.15s',
                }}
              >
                ✅ Confirmar Aprovação
              </button>
            </div>
          </div>
        </div>
      )}

      <div style={{ maxWidth: 1280, margin: '0 auto' }}>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, gap: 16, flexWrap: 'wrap' }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: '#1e293b', margin: 0 }}>Solicitações de Acesso</h1>
            <p style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>{solicitacoes.length} solicitações {filtro}s</p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {['pendente', 'aprovado', 'rejeitado'].map(f => (
              <button key={f} onClick={() => setFiltro(f)} style={{
                padding: '8px 16px', borderRadius: 8, cursor: 'pointer',
                fontSize: 13, fontWeight: 600,
                background: filtro === f ? '#1e3a5f' : '#fff',
                color: filtro === f ? '#fff' : '#475569',
                border: filtro === f ? '1px solid #1e3a5f' : '1px solid #e2e8f0',
              }}>
                {f === 'pendente' ? 'Pendentes' : f === 'aprovado' ? 'Aprovados' : 'Rejeitados'}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 48, color: '#64748b' }}>Carregando...</div>
        ) : solicitacoes.length === 0 ? (
          <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', padding: '48px 24px', textAlign: 'center' }}>
            <p style={{ fontSize: 36, marginBottom: 12 }}>📭</p>
            <p style={{ color: '#64748b', fontSize: 14 }}>Nenhuma solicitação {filtro}</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {solicitacoes.map(s => (
              <div key={s.id} style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                      <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#1e3a5f', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 16, flexShrink: 0 }}>
                        {s.nome.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p style={{ fontWeight: 700, color: '#1e293b', fontSize: 15, margin: 0 }}>{s.nome}</p>
                        <p style={{ fontSize: 11, color: '#94a3b8', margin: 0 }}>Solicitado em {formatarDataHora(s.created_at)}</p>
                      </div>
                    </div>

                    <div className="solic-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
                      <div>
                        <p style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', letterSpacing: 1, margin: '0 0 4px' }}>TELEFONE</p>
                        <p style={{ fontSize: 13, color: '#475569', margin: 0 }}>📱 {s.telefone || '—'}</p>
                      </div>
                      <div>
                        <p style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', letterSpacing: 1, margin: '0 0 4px' }}>E-MAIL</p>
                        <p style={{ fontSize: 13, color: '#475569', margin: 0 }}>✉️ {s.email || '—'}</p>
                      </div>
                      <div>
                        <p style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', letterSpacing: 1, margin: '0 0 4px' }}>NASCIMENTO</p>
                        <p style={{ fontSize: 13, color: '#475569', margin: 0 }}>🎂 {formatarData(s.data_nascimento)} — {calcularIdade(s.data_nascimento)}</p>
                      </div>
                      <div>
                        <p style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', letterSpacing: 1, margin: '0 0 4px' }}>COMUM</p>
                        <p style={{ fontSize: 13, color: '#475569', margin: 0 }}>⛪ {s.comum || '—'}</p>
                      </div>
                      <div>
                        <p style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', letterSpacing: 1, margin: '0 0 4px' }}>CIDADE</p>
                        <p style={{ fontSize: 13, color: '#475569', margin: 0 }}>📍 {s.cidade || '—'}</p>
                      </div>
                      <div>
                        <p style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', letterSpacing: 1, margin: '0 0 4px' }}>INSTRUMENTO</p>
                        <p style={{ fontSize: 13, color: '#475569', margin: 0 }}>🎵 {s.instrumento || '—'}</p>
                      </div>
                    </div>
                  </div>

                  {filtro === 'pendente' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, justifyContent: 'center' }}>
                      <button onClick={() => abrirModalAprovar(s)} disabled={processando === s.id} style={{
                        padding: '9px 20px', borderRadius: 8, border: 'none',
                        background: '#16a34a', color: '#fff', fontSize: 13, fontWeight: 600,
                        cursor: processando === s.id ? 'not-allowed' : 'pointer',
                        opacity: processando === s.id ? 0.5 : 1,
                      }}>
                        {processando === s.id ? 'Processando...' : '✅ Aprovar'}
                      </button>
                      <button onClick={() => rejeitar(s.id)} disabled={processando === s.id} style={{
                        padding: '9px 20px', borderRadius: 8, border: '1px solid #fecaca',
                        background: '#fff', color: '#dc2626', fontSize: 13, fontWeight: 600,
                        cursor: processando === s.id ? 'not-allowed' : 'pointer',
                        opacity: processando === s.id ? 0.5 : 1,
                      }}>
                        ❌ Rejeitar
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}