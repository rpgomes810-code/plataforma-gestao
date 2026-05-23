export const dynamic = 'force-dynamic'

import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import BotaoExcluirHospital from './BotaoExcluirHospital'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export default async function Hospitais() {
  const cookieStore = await cookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll() {},
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  const { data: membroLogado } = await supabaseAdmin
    .from('membros')
    .select('id, nome, perfil')
    .eq('user_id', user?.id)
    .single()

  let permissoes: any = {}
  if (membroLogado?.perfil) {
    const { data } = await supabaseAdmin
      .from('permissoes')
      .select('paginas')
      .eq('perfil', membroLogado.perfil)
      .single()
    permissoes = data?.paginas || {}
  }

  const podeCriar = permissoes?.hospitais?.criar === true
  const podeEditar = permissoes?.hospitais?.editar === true
  const podeExcluir = permissoes?.hospitais?.excluir === true

  const { data: hospitais } = await supabaseAdmin
    .from('hospitais')
    .select('*')
    .order('nome', { ascending: true })

  return (
    <div style={{ background: '#f1f5f9', minHeight: '100vh', padding: '28px 40px' }}
      className="hospitais-wrap">
      <style>{`
        @media (max-width: 768px) {
          .hospitais-wrap { padding: 16px !important; }
          .tabela-header { display: none !important; }
        }
      `}</style>

      <div style={{ maxWidth: 1280, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: '#1e293b', margin: 0 }}>Hospitais</h1>
            <p style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>
              {hospitais?.length} hospitais cadastrados
            </p>
          </div>
          {podeCriar && (
            <a href="/dashboard/hospitais/novo" style={{
              padding: '9px 18px',
              borderRadius: 8,
              background: '#2563eb',
              color: '#fff',
              fontSize: 13,
              fontWeight: 600,
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              Novo Hospital
            </a>
          )}
        </div>

        {/* Tabela */}
        <div style={{
          background: '#fff',
          border: '1px solid #e2e8f0',
          borderRadius: 12,
          boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
          overflow: 'hidden',
        }}>
          {/* Cabeçalho */}
          <div className="tabela-header" style={{
            display: 'grid',
            gridTemplateColumns: '1fr 200px 160px 120px 100px',
            padding: '10px 20px',
            borderBottom: '1px solid #f1f5f9',
            background: '#f8fafc',
          }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', letterSpacing: 1 }}>HOSPITAL</span>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', letterSpacing: 1 }}>ENDEREÇO</span>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', letterSpacing: 1 }}>TURNO</span>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', letterSpacing: 1 }}>STATUS</span>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', letterSpacing: 1, textAlign: 'right' }}>AÇÕES</span>
          </div>

          {/* Linhas */}
          {!hospitais?.length ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8', fontSize: 14 }}>
              Nenhum hospital cadastrado
            </div>
          ) : (
            hospitais.map((hospital, index) => (
              <div key={hospital.id}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 200px 160px 120px 100px',
                  padding: '14px 20px',
                  borderBottom: index < hospitais.length - 1 ? '1px solid #f1f5f9' : 'none',
                  alignItems: 'center',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = '#f8fafc')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                {/* Nome */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{
                    width: 38, height: 38, borderRadius: '50%',
                    background: hospital.ativo ? '#1e3a5f' : '#94a3b8',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#fff', fontWeight: 700, fontSize: 15, flexShrink: 0,
                  }}>
                    {hospital.nome?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p style={{ fontWeight: 700, color: '#0f172a', fontSize: 14, margin: 0, textTransform: 'uppercase', letterSpacing: 0.4 }}>
                      {hospital.nome}
                    </p>
                    {hospital.contato && (
                      <p style={{ fontSize: 12, color: '#94a3b8', margin: 0 }}>{hospital.contato}</p>
                    )}
                  </div>
                </div>

                {/* Endereço */}
                <span style={{ fontSize: 13, color: '#475569' }}>
                  {hospital.endereco || <span style={{ color: '#cbd5e1' }}>—</span>}
                </span>

                {/* Turno */}
                <span style={{ fontSize: 13, color: '#475569' }}>
                  {hospital.turno || <span style={{ color: '#cbd5e1' }}>—</span>}
                </span>

                {/* Status */}
                <span style={{
                  fontSize: 11, fontWeight: 600,
                  padding: '3px 10px', borderRadius: 999,
                  background: hospital.ativo ? '#dcfce7' : '#f1f5f9',
                  color: hospital.ativo ? '#16a34a' : '#64748b',
                  display: 'inline-block',
                }}>
                  {hospital.ativo ? 'Ativo' : 'Inativo'}
                </span>

                {/* Ações */}
                <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                  {podeEditar && (
                    <a href={`/dashboard/hospitais/${hospital.id}/editar`} title="Editar"
                      style={{
                        width: 30, height: 30, borderRadius: 7, background: '#eff6ff',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        textDecoration: 'none',
                      }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                        <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                      </svg>
                    </a>
                  )}
                  {podeExcluir && (
                    <BotaoExcluirHospital id={hospital.id} nome={hospital.nome} usuarioNome={membroLogado?.nome} />
                  )}
                </div>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  )
}