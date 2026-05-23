export const dynamic = 'force-dynamic'

import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import BotaoExcluir from './BotaoExcluir'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export default async function Membros() {
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

  const podeEditar = permissoes?.membros?.editar === true
  const podeExcluir = permissoes?.membros?.excluir === true

  const { data: membros } = await supabaseAdmin
    .from('membros')
    .select('*')
    .order('nome', { ascending: true })

  const grupos = [...new Set(membros?.map(m => m.grupo).filter(Boolean))].sort((a, b) => {
    const numA = parseInt(a.replace(/\D/g, '')) || 0
    const numB = parseInt(b.replace(/\D/g, '')) || 0
    return numA - numB
  })
  const semGrupo = membros?.filter(m => !m.grupo) || []

  const subtitulo = (membro: any) => {
    const perfil = membro.perfil || membro.tipo || ''
    const instrumento = membro.instrumento && membro.instrumento !== 'Nenhum' ? membro.instrumento : ''
    if (instrumento) return `${perfil} — ${instrumento}`
    return perfil
  }

  const CardMembro = ({ membro, avatarColor }: { membro: any, avatarColor: string }) => (
    <div style={{
      background: '#ffffff',
      borderRadius: 12,
      border: '1px solid #e2e8f0',
      boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
      padding: '16px',
      display: 'flex',
      flexDirection: 'column',
      gap: 12,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{
          width: 44,
          height: 44,
          borderRadius: '50%',
          background: avatarColor,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          fontWeight: 700,
          fontSize: 18,
          flexShrink: 0,
        }}>
          {membro.nome.charAt(0).toUpperCase()}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontWeight: 700, color: '#1e293b', fontSize: 14, margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {membro.nome}
          </p>
          <p style={{ fontSize: 12, color: '#64748b', margin: 0 }}>
            {subtitulo(membro)}
          </p>
        </div>
        <span style={{
          fontSize: 11,
          fontWeight: 600,
          padding: '3px 10px',
          borderRadius: 999,
          background: membro.status === 'Ativo' ? '#dcfce7' : '#f1f5f9',
          color: membro.status === 'Ativo' ? '#16a34a' : '#64748b',
          flexShrink: 0,
        }}>
          {membro.status || 'Pendente'}
        </span>
      </div>

      <div style={{
        borderTop: '1px solid #f1f5f9',
        paddingTop: 12,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <span style={{ fontSize: 13, color: '#64748b', display: 'flex', alignItems: 'center', gap: 5 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a19.79 19.79 0 01-3.07-8.63A2 2 0 012 .18h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/>
          </svg>
          {membro.telefone || '—'}
        </span>

        <div style={{ display: 'flex', gap: 6 }}>
          <a href={`/dashboard/membros/${membro.id}/estatisticas`}
            title="Estatísticas"
            style={{
              width: 32, height: 32, borderRadius: 8,
              background: '#f5f3ff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              textDecoration: 'none',
            }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="20" x2="18" y2="10"/>
              <line x1="12" y1="20" x2="12" y2="4"/>
              <line x1="6" y1="20" x2="6" y2="14"/>
            </svg>
          </a>

          {podeEditar && (
            <a href={`/dashboard/membros/${membro.id}/editar`}
              title="Editar"
              style={{
                width: 32, height: 32, borderRadius: 8,
                background: '#eff6ff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                textDecoration: 'none',
              }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
            </a>
          )}

          {podeExcluir && (
            <BotaoExcluir id={membro.id} nome={membro.nome} usuarioNome={membroLogado?.nome} />
          )}
        </div>
      </div>
    </div>
  )

  return (
    <div style={{ background: '#f1f5f9', minHeight: '100vh', padding: '32px 40px' }}
      className="mobile-padding">
      <style>{`
        @media (max-width: 768px) {
          .mobile-padding { padding: 16px !important; }
        }
      `}</style>

      <div style={{ maxWidth: 960, margin: '0 auto' }}>

        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: '#1e293b', margin: 0 }}>Membros</h1>
          <p style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>
            {membros?.length} membros cadastrados
          </p>
        </div>

        {grupos.map(grupo => (
          <div key={grupo} style={{ marginBottom: 32 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <span style={{ fontSize: 16 }}>🎻</span>
              <h2 style={{ fontSize: 15, fontWeight: 700, color: '#334155', margin: 0 }}>{grupo}</h2>
              <span style={{
                fontSize: 11, fontWeight: 600,
                background: '#e0e7ff', color: '#3730a3',
                borderRadius: 999, padding: '2px 8px',
              }}>
                {membros?.filter(m => m.grupo === grupo).length}
              </span>
            </div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: 12,
            }}>
              {membros?.filter(m => m.grupo === grupo).map(membro => (
                <CardMembro key={membro.id} membro={membro} avatarColor="#1e3a5f" />
              ))}
            </div>
          </div>
        ))}

        {semGrupo.length > 0 && (
          <div style={{ marginBottom: 32 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <span style={{ fontSize: 16 }}>⏳</span>
              <h2 style={{ fontSize: 15, fontWeight: 700, color: '#334155', margin: 0 }}>Sem grupo definido</h2>
              <span style={{
                fontSize: 11, fontWeight: 600,
                background: '#fef9c3', color: '#854d0e',
                borderRadius: 999, padding: '2px 8px',
              }}>
                {semGrupo.length}
              </span>
            </div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: 12,
            }}>
              {semGrupo.map(membro => (
                <CardMembro key={membro.id} membro={membro} avatarColor="#94a3b8" />
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  )
}