'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'

type Hospital = { id: string; nome: string }
type Grupo = { id: string; nome: string }
type Membro = { id: string; nome: string }

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '10px 14px', borderRadius: 8,
  border: '1px solid #e2e8f0', background: '#f8fafc',
  fontSize: 14, color: '#1e293b', outline: 'none', boxSizing: 'border-box',
}

const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: 12, fontWeight: 600, color: '#64748b', marginBottom: 6,
}

export default function EditarEscala() {
  const router = useRouter()
  const params = useParams()
  const [loading, setLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(true)
  const [hospitais, setHospitais] = useState<Hospital[]>([])
  const [grupos, setGrupos] = useState<Grupo[]>([])
  const [atendentes, setAtendentes] = useState<Membro[]>([])
  const [form, setForm] = useState({
    data: '', grupo: '', hospital_id: '', local_texto: '',
    hora_inicio: '', atendentes: '', observacoes: '',
  })

  useEffect(() => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    supabase.from('hospitais').select('id, nome').order('nome').then(({ data }) => setHospitais(data || []))
    supabase.from('membros').select('id, nome').eq('perfil', 'Atendente').eq('status', 'Ativo').order('nome').then(({ data }) => setAtendentes(data || []))
    fetch('/api/grupos').then(r => r.json()).then(data => { if (Array.isArray(data)) setGrupos(data) })

    supabase.from('escalas').select('*').eq('id', params.id).single().then(({ data }) => {
      if (data) setForm({
        data: data.data || '', grupo: data.grupo || '',
        hospital_id: data.hospital_id || '', local_texto: data.local_texto || '',
        hora_inicio: data.hora_inicio || '', atendentes: data.atendentes || '',
        observacoes: data.observacoes || '',
      })
      setLoadingData(false)
    })
  }, [params.id])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    if (name === 'hospital_id') {
      const hospital = hospitais.find(h => h.id === value)
      setForm({ ...form, hospital_id: value, local_texto: hospital?.nome || '' })
    } else {
      setForm({ ...form, [name]: value })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const res = await fetch(`/api/escalas/${params.id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    if (res.ok) router.push('/dashboard/escalas')
    else { alert('Erro ao atualizar escala'); setLoading(false) }
  }

  const handleDelete = async () => {
    if (!confirm('Excluir esta escala?')) return
    const res = await fetch(`/api/escalas/${params.id}`, { method: 'DELETE' })
    if (res.ok) router.push('/dashboard/escalas')
    else alert('Erro ao excluir escala')
  }

  if (loadingData) return (
    <div style={{ background: '#f1f5f9', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: '#64748b', fontSize: 14 }}>Carregando...</p>
    </div>
  )

  return (
    <div style={{ background: '#f1f5f9', minHeight: '100vh', padding: '28px 40px' }} className="editar-wrap">
      <style>{`
        @media (max-width: 768px) { .editar-wrap { padding: 16px !important; } .grid-3 { grid-template-columns: 1fr !important; } .grid-2 { grid-template-columns: 1fr !important; } }
        input:focus, select:focus, textarea:focus { border-color: #2563eb !important; background: #fff !important; }
      `}</style>

      <div style={{ maxWidth: 900, margin: '0 auto' }}>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: '#1e293b', margin: 0 }}>Editar Escala</h1>
            <p style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>Atualize as informações da escala</p>
          </div>
          <a href="/dashboard/escalas" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: '#64748b', textDecoration: 'none' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
            </svg>
            Voltar
          </a>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', overflow: 'hidden' }}>

            <div style={{ padding: '24px 28px', borderBottom: '1px solid #f1f5f9' }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', letterSpacing: 1, marginBottom: 16 }}>INFORMAÇÕES BÁSICAS</p>
              <div className="grid-3" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
                <div>
                  <label style={labelStyle}>Data *</label>
                  <input name="data" type="date" required value={form.data} onChange={handleChange} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Grupo *</label>
                  <div style={{ position: 'relative' }}>
                    <select name="grupo" required value={form.grupo} onChange={handleChange} style={{ ...inputStyle, appearance: 'none', WebkitAppearance: 'none', paddingRight: 32 }}>
                      <option value="">Selecione...</option>
                      {grupos.map(g => <option key={g.id} value={g.nome}>{g.nome}</option>)}
                    </select>
                    <svg style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
                      width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="6 9 12 15 18 9"/>
                    </svg>
                  </div>
                </div>
                <div>
                  <label style={labelStyle}>Hora de início *</label>
                  <input name="hora_inicio" type="time" required value={form.hora_inicio} onChange={handleChange} style={inputStyle} />
                </div>
              </div>
            </div>

            <div style={{ padding: '24px 28px', borderBottom: '1px solid #f1f5f9' }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', letterSpacing: 1, marginBottom: 16 }}>LOCAL</p>
              <div className="grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label style={labelStyle}>Hospital</label>
                  <div style={{ position: 'relative' }}>
                    <select name="hospital_id" value={form.hospital_id} onChange={handleChange} style={{ ...inputStyle, appearance: 'none', WebkitAppearance: 'none', paddingRight: 32 }}>
                      <option value="">Selecione...</option>
                      {hospitais.map(h => <option key={h.id} value={h.id}>{h.nome}</option>)}
                    </select>
                    <svg style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
                      width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="6 9 12 15 18 9"/>
                    </svg>
                  </div>
                </div>
                <div>
                  <label style={labelStyle}>Local (texto livre)</label>
                  <input name="local_texto" type="text" value={form.local_texto} onChange={handleChange} style={inputStyle} />
                </div>
              </div>
            </div>

            <div style={{ padding: '24px 28px', borderBottom: '1px solid #f1f5f9' }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', letterSpacing: 1, marginBottom: 16 }}>ATENDENTE</p>
              <div style={{ position: 'relative' }}>
                <select name="atendentes" value={form.atendentes} onChange={handleChange} style={{ ...inputStyle, appearance: 'none', WebkitAppearance: 'none', paddingRight: 32 }}>
                  <option value="">Selecione o atendente...</option>
                  {atendentes.map(a => <option key={a.id} value={a.nome}>{a.nome}</option>)}
                </select>
                <svg style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
                  width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="6 9 12 15 18 9"/>
                </svg>
              </div>
            </div>

            <div style={{ padding: '24px 28px', borderBottom: '1px solid #f1f5f9' }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', letterSpacing: 1, marginBottom: 16 }}>OBSERVAÇÕES</p>
              <textarea name="observacoes" rows={3} value={form.observacoes} onChange={handleChange}
                style={{ ...inputStyle, resize: 'vertical' }} />
            </div>

            <div style={{ padding: '20px 28px', display: 'flex', gap: 10, justifyContent: 'space-between', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', gap: 10 }}>
                <button type="submit" disabled={loading} style={{
                  padding: '10px 24px', borderRadius: 8, border: 'none',
                  background: loading ? '#93c5fd' : '#2563eb',
                  color: '#fff', fontSize: 14, fontWeight: 600,
                  cursor: loading ? 'not-allowed' : 'pointer',
                }}>
                  {loading ? 'Salvando...' : 'Salvar Alterações'}
                </button>
                <a href="/dashboard/escalas" style={{
                  padding: '10px 24px', borderRadius: 8, background: '#f1f5f9',
                  color: '#475569', fontSize: 14, fontWeight: 600,
                  textDecoration: 'none', display: 'inline-flex', alignItems: 'center',
                }}>
                  Cancelar
                </a>
              </div>
              <button type="button" onClick={handleDelete} style={{
                padding: '10px 20px', borderRadius: 8, border: 'none',
                background: '#fff1f2', color: '#dc2626',
                fontSize: 14, fontWeight: 600, cursor: 'pointer',
              }}>
                Excluir escala
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}