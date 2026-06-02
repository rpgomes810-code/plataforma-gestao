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

type Candidato = {
  id: string
  nome: string
  telefone: string
  data_nascimento: string
  comum: string
  cidade: string
  instrumento: string
  como_conheceu: string
  como_conheceu_indicacao: string
  como_conheceu_outros: string
  disponibilidade: string
  status: string
  criado_em: string
  aprovacoes_adm: any[]
  consulta_data: string
  consulta_contato: string
  consulta_adm: string
  contato_feito: boolean
  contato_data: string
  contato_adm: string
  reprovado_por: string
  motivo_reprovacao: string
}

const PERFIS = [
  'Músico/Vocal', 'Atendente', 'Organizador', 'Ancião',
  'Cooperador Jovens', 'Cooperador Oficial', 'Diácono',
  'Encarregado Local', 'Encarregado Regional', 'Administrador', 'Secretário',
]

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '9px 12px', borderRadius: 8,
  border: '1px solid #e2e8f0', background: '#f8fafc',
  fontSize: 13, color: '#1e293b', outline: 'none', boxSizing: 'border-box',
}

export default function Solicitacoes() {
  const [aba, setAba] = useState<'solicitacoes' | 'candidatos'>('solicitacoes')

  // Solicitações
  const [solicitacoes, setSolicitacoes] = useState<Solicitacao[]>([])
  const [loadingSolic, setLoadingSolic] = useState(true)
  const [filtroSolic, setFiltroSolic] = useState('pendente')
  const [processando, setProcessando] = useState<string | null>(null)
  const [modalAberto, setModalAberto] = useState<Solicitacao | null>(null)
  const [perfilSelecionado, setPerfilSelecionado] = useState('')

  // Candidatos
  const [candidatos, setCandidatos] = useState<Candidato[]>([])
  const [loadingCand, setLoadingCand] = useState(true)
  const [filtroCand, setFiltroCand] = useState('candidato')
  const [candidatoAberto, setCandidatoAberto] = useState<Candidato | null>(null)
  const [processandoCand, setProcessandoCand] = useState<string | null>(null)
  const [motivoReprovacao, setMotivoReprovacao] = useState('')
  const [modalCandidato, setModalCandidato] = useState<Candidato | null>(null)
  const [modalAcao, setModalAcao] = useState<'aprovar' | 'reprovar' | 'consulta' | 'contato' | null>(null)
  const [formConsulta, setFormConsulta] = useState({ consulta_data: '', consulta_contato: '', consulta_adm: '' })
  const [formContato, setFormContato] = useState({ contato_data: '', contato_adm: '' })

  const [usuarioNome, setUsuarioNome] = useState('Administrador')
  const [usuarioId, setUsuarioId] = useState('')

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    fetch('/api/membros/eu').then(res => res.json()).then(data => {
      if (data?.nome) setUsuarioNome(data.nome)
      if (data?.id) setUsuarioId(data.id)
    })
  }, [])

  const carregarSolicitacoes = () => {
    setLoadingSolic(true)
    supabase.from('solicitacoes').select('*').eq('status', filtroSolic)
      .order('created_at', { ascending: false })
      .then(({ data }) => { setSolicitacoes(data || []); setLoadingSolic(false) })
  }

  const carregarCandidatos = () => {
    setLoadingCand(true)
    fetch('/api/candidatos').then(r => r.json()).then(data => {
      if (Array.isArray(data)) {
        setCandidatos(data.filter((c: Candidato) => c.status === filtroCand))
      }
      setLoadingCand(false)
    })
  }

  useEffect(() => { carregarSolicitacoes() }, [filtroSolic])
  useEffect(() => { carregarCandidatos() }, [filtroCand])

  // --- SOLICITAÇÕES ---
  const abrirModalAprovar = (s: Solicitacao) => { setPerfilSelecionado(''); setModalAberto(s) }

  const confirmarAprovacao = async () => {
    if (!modalAberto || !perfilSelecionado) return
    setProcessando(modalAberto.id)
    setModalAberto(null)
    const res = await fetch('/api/aprovar-solicitacao', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: modalAberto.id, aprovadoPor: usuarioNome, perfil: perfilSelecionado }),
    })
    if (res.ok) carregarSolicitacoes()
    else { const data = await res.json(); alert('Erro ao aprovar: ' + data.error) }
    setProcessando(null)
  }

  const rejeitarSolicitacao = async (id: string) => {
    setProcessando(id)
    await supabase.from('solicitacoes').update({ status: 'rejeitado' }).eq('id', id)
    await fetch('/api/logs', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ usuario_nome: usuarioNome, acao: 'Rejeitou solicitação', tabela: 'solicitacoes', registro_id: id, dados_antes: { status: 'pendente' }, dados_depois: { status: 'rejeitado' } }),
    })
    carregarSolicitacoes()
    setProcessando(null)
  }

  // --- CANDIDATOS ---
  const aprovarCandidato = async () => {
    if (!modalCandidato) return
    setProcessandoCand(modalCandidato.id)
    await fetch('/api/candidatos', {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: modalCandidato.id, status: 'pendente' }),
    })
    setModalCandidato(null)
    setModalAcao(null)
    carregarCandidatos()
    setProcessandoCand(null)
  }

  const reprovarCandidato = async () => {
    if (!modalCandidato) return
    setProcessandoCand(modalCandidato.id)
    await fetch('/api/candidatos', {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: modalCandidato.id, status: 'reprovado',
        reprovado_por: usuarioNome, reprovado_em: new Date().toISOString(),
        motivo_reprovacao: motivoReprovacao,
      }),
    })
    setModalCandidato(null)
    setModalAcao(null)
    setMotivoReprovacao('')
    carregarCandidatos()
    setProcessandoCand(null)
  }

  const salvarConsulta = async () => {
    if (!modalCandidato) return
    await fetch('/api/candidatos', {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: modalCandidato.id, ...formConsulta }),
    })
    setModalCandidato(null)
    setModalAcao(null)
    carregarCandidatos()
  }

  const salvarContato = async () => {
    if (!modalCandidato) return
    await fetch('/api/candidatos', {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: modalCandidato.id, contato_feito: true, ...formContato }),
    })
    setModalCandidato(null)
    setModalAcao(null)
    carregarCandidatos()
  }

  const adicionarAprovacaoAdm = async (candidato: Candidato) => {
    const aprovacoes = candidato.aprovacoes_adm || []
    if (aprovacoes.some((a: any) => a.adm_id === usuarioId)) {
      alert('Você já aprovou este candidato!')
      return
    }
    const novasAprovacoes = [...aprovacoes, { adm_id: usuarioId, adm_nome: usuarioNome, data: new Date().toISOString() }]

    let novoStatus = candidato.status
    if (novasAprovacoes.length >= 2 && candidato.consulta_data && candidato.contato_feito) {
      novoStatus = 'aprovado'
    }

    await fetch('/api/candidatos', {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: candidato.id, aprovacoes_adm: novasAprovacoes, status: novoStatus }),
    })
    carregarCandidatos()
  }

  const verificarCompleto = (c: Candidato) => {
    const aprovacoes = c.aprovacoes_adm || []
    return aprovacoes.length >= 2 && c.consulta_data && c.contato_feito
  }

  const finalizarCandidato = async (candidato: Candidato) => {
    if (!verificarCompleto(candidato)) {
      alert('Ainda há pendências: aprovações de ADMs, consulta ministerial ou contato com o candidato.')
      return
    }
    await fetch('/api/candidatos', {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: candidato.id, status: 'aprovado' }),
    })
    carregarCandidatos()
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

  const labelDisponibilidade: Record<string, string> = {
    todos: 'Todos os sábados', alguns: 'Alguns sábados', nenhum: 'Nenhum sábado'
  }

  const labelComoConheceu: Record<string, string> = {
    indicacao: 'Indicação', ccb: 'Ouviu na CCB', ministerio: 'Ministério anunciou', outros: 'Outros'
  }

  const abaStyle = (a: string): React.CSSProperties => ({
    padding: '9px 18px', borderRadius: 8, cursor: 'pointer',
    fontSize: 13, fontWeight: 600, border: 'none',
    background: aba === a ? '#1e3a5f' : '#fff',
    color: aba === a ? '#fff' : '#475569',
    outline: aba === a ? 'none' : '1px solid #e2e8f0',
  })

  const filtroStyle = (f: string, atual: string): React.CSSProperties => ({
    padding: '7px 14px', borderRadius: 8, cursor: 'pointer',
    fontSize: 12, fontWeight: 600,
    background: atual === f ? '#1e3a5f' : '#fff',
    color: atual === f ? '#fff' : '#475569',
    border: atual === f ? '1px solid #1e3a5f' : '1px solid #e2e8f0',
  })

  return (
    <div style={{ background: '#f1f5f9', minHeight: '100vh', padding: '28px 40px' }} className="solic-wrap">
      <style>{`
        @media (max-width: 768px) {
          .solic-wrap { padding: 16px !important; }
          .solic-grid { grid-template-columns: 1fr 1fr !important; }
        }
        input:focus, select:focus, textarea:focus { border-color: #2563eb !important; background: #fff !important; }
      `}</style>

      {/* MODAL SOLICITAÇÕES — Perfil */}
      {modalAberto && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 16 }}>
          <div style={{ background: '#fff', borderRadius: 14, padding: 28, width: '100%', maxWidth: 420, boxShadow: '0 8px 32px rgba(0,0,0,0.18)' }}>
            <h2 style={{ fontSize: 17, fontWeight: 800, color: '#1e293b', margin: '0 0 4px' }}>Aprovar Solicitação</h2>
            <p style={{ fontSize: 13, color: '#64748b', margin: '0 0 20px' }}>Defina o perfil de <strong>{modalAberto.nome}</strong></p>
            <div style={{ position: 'relative' }}>
              <select value={perfilSelecionado} onChange={e => setPerfilSelecionado(e.target.value)}
                style={{ ...inputStyle, appearance: 'none' as const, paddingRight: 32 }}>
                <option value="">Selecione um perfil...</option>
                {PERFIS.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
              <svg style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
                width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 20 }}>
              <button onClick={() => setModalAberto(null)} style={{ flex: 1, padding: '9px 0', borderRadius: 8, border: '1px solid #e2e8f0', background: '#fff', color: '#475569', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Cancelar</button>
              <button onClick={confirmarAprovacao} disabled={!perfilSelecionado} style={{ flex: 1, padding: '9px 0', borderRadius: 8, border: 'none', background: perfilSelecionado ? '#16a34a' : '#e2e8f0', color: perfilSelecionado ? '#fff' : '#94a3b8', fontSize: 13, fontWeight: 600, cursor: perfilSelecionado ? 'pointer' : 'not-allowed' }}>
                ✅ Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL CANDIDATOS */}
      {modalCandidato && modalAcao && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 16 }}>
          <div style={{ background: '#fff', borderRadius: 14, padding: 28, width: '100%', maxWidth: 440, boxShadow: '0 8px 32px rgba(0,0,0,0.18)' }}>

            {modalAcao === 'aprovar' && (
              <>
                <h2 style={{ fontSize: 17, fontWeight: 800, color: '#1e293b', margin: '0 0 8px' }}>Aprovar Candidato</h2>
                <p style={{ fontSize: 13, color: '#64748b', margin: '0 0 20px' }}>
                  Confirma a aprovação de <strong>{modalCandidato.nome}</strong>?<br />
                  O candidato irá para a fila de pendências.
                </p>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => { setModalCandidato(null); setModalAcao(null) }} style={{ flex: 1, padding: '9px 0', borderRadius: 8, border: '1px solid #e2e8f0', background: '#fff', color: '#475569', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Cancelar</button>
                  <button onClick={aprovarCandidato} style={{ flex: 1, padding: '9px 0', borderRadius: 8, border: 'none', background: '#16a34a', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>✅ Confirmar</button>
                </div>
              </>
            )}

            {modalAcao === 'reprovar' && (
              <>
                <h2 style={{ fontSize: 17, fontWeight: 800, color: '#1e293b', margin: '0 0 8px' }}>Reprovar Candidato</h2>
                <p style={{ fontSize: 13, color: '#64748b', margin: '0 0 16px' }}>Informe o motivo da reprovação de <strong>{modalCandidato.nome}</strong>.</p>
                <textarea value={motivoReprovacao} onChange={e => setMotivoReprovacao(e.target.value)}
                  rows={3} placeholder="Motivo da reprovação..." style={{ ...inputStyle, resize: 'vertical', marginBottom: 16 }} />
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => { setModalCandidato(null); setModalAcao(null) }} style={{ flex: 1, padding: '9px 0', borderRadius: 8, border: '1px solid #e2e8f0', background: '#fff', color: '#475569', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Cancelar</button>
                  <button onClick={reprovarCandidato} style={{ flex: 1, padding: '9px 0', borderRadius: 8, border: 'none', background: '#dc2626', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>❌ Reprovar</button>
                </div>
              </>
            )}

            {modalAcao === 'consulta' && (
              <>
                <h2 style={{ fontSize: 17, fontWeight: 800, color: '#1e293b', margin: '0 0 8px' }}>Consulta Ministerial</h2>
                <p style={{ fontSize: 13, color: '#64748b', margin: '0 0 16px' }}>Registre os dados da consulta ministerial de <strong>{modalCandidato.nome}</strong>.</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#94a3b8', letterSpacing: 1, marginBottom: 5 }}>DATA DO CONTATO</label>
                    <input type="date" value={formConsulta.consulta_data} onChange={e => setFormConsulta(p => ({ ...p, consulta_data: e.target.value }))} style={inputStyle} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#94a3b8', letterSpacing: 1, marginBottom: 5 }}>NOME DO CONTATO</label>
                    <input type="text" value={formConsulta.consulta_contato} onChange={e => setFormConsulta(p => ({ ...p, consulta_contato: e.target.value }))} placeholder="Nome de quem foi consultado" style={inputStyle} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#94a3b8', letterSpacing: 1, marginBottom: 5 }}>ADM RESPONSÁVEL</label>
                    <input type="text" value={formConsulta.consulta_adm} onChange={e => setFormConsulta(p => ({ ...p, consulta_adm: e.target.value }))} placeholder="Nome do ADM" style={inputStyle} />
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
                  <button onClick={() => { setModalCandidato(null); setModalAcao(null) }} style={{ flex: 1, padding: '9px 0', borderRadius: 8, border: '1px solid #e2e8f0', background: '#fff', color: '#475569', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Cancelar</button>
                  <button onClick={salvarConsulta} style={{ flex: 1, padding: '9px 0', borderRadius: 8, border: 'none', background: '#2563eb', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>💾 Salvar</button>
                </div>
              </>
            )}

            {modalAcao === 'contato' && (
              <>
                <h2 style={{ fontSize: 17, fontWeight: 800, color: '#1e293b', margin: '0 0 8px' }}>Contato com Candidato</h2>
                <p style={{ fontSize: 13, color: '#64748b', margin: '0 0 16px' }}>Registre o contato realizado com <strong>{modalCandidato.nome}</strong>.</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#94a3b8', letterSpacing: 1, marginBottom: 5 }}>DATA DO CONTATO</label>
                    <input type="date" value={formContato.contato_data} onChange={e => setFormContato(p => ({ ...p, contato_data: e.target.value }))} style={inputStyle} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#94a3b8', letterSpacing: 1, marginBottom: 5 }}>ADM QUE FEZ O CONTATO</label>
                    <input type="text" value={formContato.contato_adm} onChange={e => setFormContato(p => ({ ...p, contato_adm: e.target.value }))} placeholder="Nome do ADM" style={inputStyle} />
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
                  <button onClick={() => { setModalCandidato(null); setModalAcao(null) }} style={{ flex: 1, padding: '9px 0', borderRadius: 8, border: '1px solid #e2e8f0', background: '#fff', color: '#475569', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Cancelar</button>
                  <button onClick={salvarContato} style={{ flex: 1, padding: '9px 0', borderRadius: 8, border: 'none', background: '#2563eb', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>💾 Salvar</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      <div style={{ maxWidth: 1280, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: '#1e293b', margin: 0 }}>Solicitações</h1>
          <p style={{ fontSize: 13, color: '#64748b', marginTop: 4, marginBottom: 0 }}>Gerencie solicitações de acesso e candidaturas</p>
        </div>

        {/* Abas principais */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
          <button style={abaStyle('solicitacoes')} onClick={() => setAba('solicitacoes')}>Solicitações de Acesso</button>
          <button style={abaStyle('candidatos')} onClick={() => setAba('candidatos')}>Candidatos</button>
        </div>

        {/* ABA SOLICITAÇÕES */}
        {aba === 'solicitacoes' && (
          <>
            <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
              {['pendente', 'aprovado', 'rejeitado'].map(f => (
                <button key={f} onClick={() => setFiltroSolic(f)} style={filtroStyle(f, filtroSolic)}>
                  {f === 'pendente' ? 'Pendentes' : f === 'aprovado' ? 'Aprovados' : 'Rejeitados'}
                </button>
              ))}
            </div>

            {loadingSolic ? (
              <div style={{ textAlign: 'center', padding: 48, color: '#64748b' }}>Carregando...</div>
            ) : solicitacoes.length === 0 ? (
              <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', padding: '48px 24px', textAlign: 'center' }}>
                <p style={{ fontSize: 36, marginBottom: 12 }}>📭</p>
                <p style={{ color: '#64748b', fontSize: 14 }}>Nenhuma solicitação {filtroSolic}</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {solicitacoes.map(s => (
                  <div key={s.id} style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', padding: 20 }}>
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
                          {[
                            { label: 'TELEFONE', valor: `📱 ${s.telefone || '—'}` },
                            { label: 'E-MAIL', valor: `✉️ ${s.email || '—'}` },
                            { label: 'NASCIMENTO', valor: `🎂 ${formatarData(s.data_nascimento)} — ${calcularIdade(s.data_nascimento)}` },
                            { label: 'COMUM', valor: `⛪ ${s.comum || '—'}` },
                            { label: 'CIDADE', valor: `📍 ${s.cidade || '—'}` },
                            { label: 'INSTRUMENTO', valor: `🎵 ${s.instrumento || '—'}` },
                          ].map(item => (
                            <div key={item.label}>
                              <p style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', letterSpacing: 1, margin: '0 0 4px' }}>{item.label}</p>
                              <p style={{ fontSize: 13, color: '#475569', margin: 0 }}>{item.valor}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                      {filtroSolic === 'pendente' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, justifyContent: 'center' }}>
                          <button onClick={() => abrirModalAprovar(s)} disabled={processando === s.id} style={{ padding: '9px 20px', borderRadius: 8, border: 'none', background: '#16a34a', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', opacity: processando === s.id ? 0.5 : 1 }}>
                            {processando === s.id ? 'Processando...' : '✅ Aprovar'}
                          </button>
                          <button onClick={() => rejeitarSolicitacao(s.id)} disabled={processando === s.id} style={{ padding: '9px 20px', borderRadius: 8, border: '1px solid #fecaca', background: '#fff', color: '#dc2626', fontSize: 13, fontWeight: 600, cursor: 'pointer', opacity: processando === s.id ? 0.5 : 1 }}>
                            ❌ Rejeitar
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* ABA CANDIDATOS */}
        {aba === 'candidatos' && (
          <>
            <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
              {[
                { value: 'candidato', label: 'Novos' },
                { value: 'pendente', label: 'Pendentes' },
                { value: 'aprovado', label: 'Aprovados' },
                { value: 'reprovado', label: 'Reprovados' },
              ].map(f => (
                <button key={f.value} onClick={() => setFiltroCand(f.value)} style={filtroStyle(f.value, filtroCand)}>
                  {f.label}
                </button>
              ))}
            </div>

            {loadingCand ? (
              <div style={{ textAlign: 'center', padding: 48, color: '#64748b' }}>Carregando...</div>
            ) : candidatos.length === 0 ? (
              <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', padding: '48px 24px', textAlign: 'center' }}>
                <p style={{ fontSize: 36, marginBottom: 12 }}>📭</p>
                <p style={{ color: '#64748b', fontSize: 14 }}>Nenhum candidato {filtroCand === 'candidato' ? 'novo' : filtroCand}</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {candidatos.map(c => {
                  const aprovacoes = c.aprovacoes_adm || []
                  const jaAproveiEsteAdm = aprovacoes.some((a: any) => a.adm_id === usuarioId)
                  const completo = verificarCompleto(c)

                  return (
                    <div key={c.id} style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', overflow: 'hidden' }}>

                      {/* Cabeçalho */}
                      <div style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#1e3a5f', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 16, flexShrink: 0 }}>
                            {c.nome.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p style={{ fontWeight: 700, color: '#1e293b', fontSize: 15, margin: 0 }}>{c.nome}</p>
                            <p style={{ fontSize: 11, color: '#94a3b8', margin: 0 }}>Candidatura em {formatarDataHora(c.criado_em)}</p>
                          </div>
                        </div>

                        {/* Ações por status */}
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                          {filtroCand === 'candidato' && (
                            <>
                              <button onClick={() => { setModalCandidato(c); setModalAcao('aprovar') }} style={{ padding: '7px 14px', borderRadius: 8, border: 'none', background: '#16a34a', color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                                ✅ Aprovar
                              </button>
                              <button onClick={() => { setModalCandidato(c); setModalAcao('reprovar'); setMotivoReprovacao('') }} style={{ padding: '7px 14px', borderRadius: 8, border: '1px solid #fecaca', background: '#fff', color: '#dc2626', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                                ❌ Reprovar
                              </button>
                            </>
                          )}
                          {filtroCand === 'pendente' && (
                            <>
                              <button onClick={() => adicionarAprovacaoAdm(c)} disabled={jaAproveiEsteAdm} style={{ padding: '7px 14px', borderRadius: 8, border: 'none', background: jaAproveiEsteAdm ? '#e2e8f0' : '#2563eb', color: jaAproveiEsteAdm ? '#94a3b8' : '#fff', fontSize: 12, fontWeight: 600, cursor: jaAproveiEsteAdm ? 'not-allowed' : 'pointer' }}>
                                {jaAproveiEsteAdm ? '✓ Já aprovei' : '👍 Aprovar como ADM'}
                              </button>
                              <button onClick={() => { setModalCandidato(c); setModalAcao('consulta'); setFormConsulta({ consulta_data: c.consulta_data || '', consulta_contato: c.consulta_contato || '', consulta_adm: c.consulta_adm || '' }) }} style={{ padding: '7px 14px', borderRadius: 8, border: '1px solid #e2e8f0', background: '#fff', color: '#475569', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                                ⛪ Consulta ministerial
                              </button>
                              <button onClick={() => { setModalCandidato(c); setModalAcao('contato'); setFormContato({ contato_data: c.contato_data || '', contato_adm: c.contato_adm || '' }) }} style={{ padding: '7px 14px', borderRadius: 8, border: '1px solid #e2e8f0', background: '#fff', color: '#475569', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                                📞 Registrar contato
                              </button>
                              {completo && (
                                <button onClick={() => finalizarCandidato(c)} style={{ padding: '7px 14px', borderRadius: 8, border: 'none', background: '#7c3aed', color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                                  🏁 Finalizar
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      </div>

                      {/* Dados */}
                      <div style={{ padding: '0 20px 16px' }}>
                        <div className="solic-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 12 }}>
                          <div>
                            <p style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', letterSpacing: 1, margin: '0 0 4px' }}>TELEFONE</p>
                            <p style={{ fontSize: 13, color: '#475569', margin: 0 }}>📱 {c.telefone || '—'}</p>
                          </div>
                          <div>
                            <p style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', letterSpacing: 1, margin: '0 0 4px' }}>NASCIMENTO</p>
                            <p style={{ fontSize: 13, color: '#475569', margin: 0 }}>🎂 {formatarData(c.data_nascimento)} — {calcularIdade(c.data_nascimento)}</p>
                          </div>
                          <div>
                            <p style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', letterSpacing: 1, margin: '0 0 4px' }}>COMUM</p>
                            <p style={{ fontSize: 13, color: '#475569', margin: 0 }}>⛪ {c.comum || '—'}</p>
                          </div>
                          <div>
                            <p style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', letterSpacing: 1, margin: '0 0 4px' }}>CIDADE</p>
                            <p style={{ fontSize: 13, color: '#475569', margin: 0 }}>📍 {c.cidade || '—'}</p>
                          </div>
                          <div>
                            <p style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', letterSpacing: 1, margin: '0 0 4px' }}>INSTRUMENTO</p>
                            <p style={{ fontSize: 13, color: '#475569', margin: 0 }}>🎵 {c.instrumento || '—'}</p>
                          </div>
                          <div>
                            <p style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', letterSpacing: 1, margin: '0 0 4px' }}>DISPONIBILIDADE</p>
                            <p style={{ fontSize: 13, color: '#475569', margin: 0 }}>📅 {labelDisponibilidade[c.disponibilidade] || '—'}</p>
                          </div>
                          <div>
                            <p style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', letterSpacing: 1, margin: '0 0 4px' }}>COMO CONHECEU</p>
                            <p style={{ fontSize: 13, color: '#475569', margin: 0 }}>
                              {labelComoConheceu[c.como_conheceu] || '—'}
                              {c.como_conheceu === 'indicacao' && c.como_conheceu_indicacao && ` — ${c.como_conheceu_indicacao}`}
                              {c.como_conheceu === 'outros' && c.como_conheceu_outros && `: ${c.como_conheceu_outros}`}
                            </p>
                          </div>
                        </div>

                        {/* Pendências (só no status pendente) */}
                        {filtroCand === 'pendente' && (
                          <div style={{ background: '#f8fafc', borderRadius: 10, padding: '12px 16px', border: '1px solid #e2e8f0' }}>
                            <p style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', letterSpacing: 1, margin: '0 0 10px' }}>PENDÊNCIAS</p>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <span style={{ fontSize: 14 }}>{aprovacoes.length >= 2 ? '✅' : '⏳'}</span>
                                <span style={{ fontSize: 13, color: '#475569' }}>
                                  Aprovações de ADMs: {aprovacoes.length}/2
                                  {aprovacoes.length > 0 && (
                                    <span style={{ fontSize: 11, color: '#94a3b8', marginLeft: 6 }}>
                                      ({aprovacoes.map((a: any) => a.adm_nome).join(', ')})
                                    </span>
                                  )}
                                </span>
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <span style={{ fontSize: 14 }}>{c.consulta_data ? '✅' : '⏳'}</span>
                                <span style={{ fontSize: 13, color: '#475569' }}>
                                  Consulta ministerial
                                  {c.consulta_data && <span style={{ fontSize: 11, color: '#94a3b8', marginLeft: 6 }}>({formatarData(c.consulta_data)} — {c.consulta_contato})</span>}
                                </span>
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <span style={{ fontSize: 14 }}>{c.contato_feito ? '✅' : '⏳'}</span>
                                <span style={{ fontSize: 13, color: '#475569' }}>
                                  Contato com candidato
                                  {c.contato_feito && <span style={{ fontSize: 11, color: '#94a3b8', marginLeft: 6 }}>({formatarData(c.contato_data)} — {c.contato_adm})</span>}
                                </span>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Reprovado */}
                        {filtroCand === 'reprovado' && c.motivo_reprovacao && (
                          <div style={{ background: '#fee2e2', borderRadius: 10, padding: '10px 14px', border: '1px solid #fecaca' }}>
                            <p style={{ fontSize: 11, fontWeight: 700, color: '#dc2626', margin: '0 0 4px' }}>MOTIVO DA REPROVAÇÃO</p>
                            <p style={{ fontSize: 13, color: '#7f1d1d', margin: 0 }}>{c.motivo_reprovacao}</p>
                            {c.reprovado_por && <p style={{ fontSize: 11, color: '#dc2626', margin: '4px 0 0' }}>Por: {c.reprovado_por}</p>}
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}