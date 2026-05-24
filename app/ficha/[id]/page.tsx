export const dynamic = 'force-dynamic'

import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import BotaoImprimir from './BotaoImprimir'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export default async function FichaSIGA({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll() { return cookieStore.getAll() }, setAll() {} } }
  )

  const { data: { user } } = await supabase.auth.getUser()

  const { data: membroLogado } = await supabaseAdmin
    .from('membros').select('perfil').eq('user_id', user?.id).single()

  const { data: permissoes } = await supabaseAdmin
    .from('permissoes').select('paginas').eq('perfil', membroLogado?.perfil).single()

  const podeVer = permissoes?.paginas?.ficha_siga?.ver === true
  if (!podeVer) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#f1f5f9' }}>
      <p style={{ color: '#64748b' }}>Você não tem permissão para ver esta ficha.</p>
    </div>
  )

  const { data: m } = await supabaseAdmin.from('membros').select('*').eq('id', id).single()
  if (!m) return <div>Membro não encontrado</div>

  const hoje = new Date()
  const dia = hoje.getDate().toString().padStart(2, '0')
  const mes = hoje.toLocaleString('pt-BR', { month: 'long' })
  const ano = hoje.getFullYear()

  const campo = (valor: string | null | undefined) => valor || ''

  const estiloLabel: React.CSSProperties = { fontSize: 10, fontWeight: 700, color: '#333', textTransform: 'uppercase', marginBottom: 2, display: 'block' }
  const estiloBox: React.CSSProperties = { border: '1px solid #333', minHeight: 28, padding: '4px 8px', fontSize: 13, marginBottom: 12, background: '#fafafa' }
  const estiloGrid = (cols: string): React.CSSProperties => ({ display: 'grid', gridTemplateColumns: cols, gap: 12, marginBottom: 4 })

  return (
    <div style={{ background: '#fff', minHeight: '100vh' }}>
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { margin: 0; }
        }
        body { font-family: Arial, sans-serif; }
      `}</style>

      {/* Barra superior */}
      <div className="no-print" style={{
        padding: '16px 32px', background: '#f1f5f9',
        borderBottom: '1px solid #e2e8f0',
        display: 'flex', gap: 12,
      }}>
        <BotaoImprimir />
        <a href="/dashboard/membros" style={{
          padding: '9px 20px', borderRadius: 8, border: '1px solid #e2e8f0',
          background: '#fff', color: '#475569', fontSize: 13, fontWeight: 600, textDecoration: 'none',
          display: 'flex', alignItems: 'center', gap: 6,
        }}>
          ← Voltar
        </a>
      </div>

      {/* Ficha */}
      <div style={{ maxWidth: 800, margin: '32px auto', padding: '0 32px 40px' }}>

        {/* Cabeçalho */}
        <div style={{ textAlign: 'center', marginBottom: 24, borderBottom: '2px solid #000', paddingBottom: 12 }}>
          <p style={{ fontWeight: 700, fontSize: 14, margin: 0, letterSpacing: 1 }}>CONGREGAÇÃO CRISTÃ NO BRASIL</p>
          <p style={{ fontSize: 12, margin: '4px 0 0', color: '#333' }}>Departamento de Assistência Religiosa para Evangelização - DARPE</p>
          <p style={{ fontSize: 12, margin: '8px 0 0', fontWeight: 600 }}>04-Setor Hospital</p>
        </div>

        <h2 style={{ textAlign: 'center', fontSize: 20, fontWeight: 700, margin: '0 0 24px', letterSpacing: 1 }}>Ficha Cadastral</h2>

        <div style={estiloGrid('180px 1fr')}>
          <div><span style={estiloLabel}>CPF</span><div style={estiloBox}>{campo(m.cpf)}</div></div>
          <div><span style={estiloLabel}>Nome</span><div style={estiloBox}>{campo(m.nome)}</div></div>
        </div>

        <div style={estiloGrid('180px 1fr 120px')}>
          <div><span style={estiloLabel}>RG</span><div style={estiloBox}>{campo(m.rg)}</div></div>
          <div><span style={estiloLabel}>Data de Nascimento</span><div style={estiloBox}>{m.data_nascimento ? new Date(m.data_nascimento + 'T12:00:00').toLocaleDateString('pt-BR') : ''}</div></div>
          <div><span style={estiloLabel}>Sexo</span><div style={estiloBox}>{campo(m.sexo)}</div></div>
        </div>

        <div style={estiloGrid('1fr 1fr 1fr')}>
          <div><span style={estiloLabel}>Estado Civil</span><div style={estiloBox}>{campo(m.estado_civil)}</div></div>
          <div><span style={estiloLabel}>Comum / Congregação</span><div style={estiloBox}>{campo(m.comum)}</div></div>
          <div><span style={estiloLabel}>Data Batismo</span><div style={estiloBox}>{m.data_batismo ? new Date(m.data_batismo + 'T12:00:00').toLocaleDateString('pt-BR') : ''}</div></div>
        </div>

        <div style={estiloGrid('1fr 80px 1fr')}>
          <div><span style={estiloLabel}>Logradouro</span><div style={estiloBox}>{campo(m.logradouro)}</div></div>
          <div><span style={estiloLabel}>Número</span><div style={estiloBox}>{campo(m.numero_endereco)}</div></div>
          <div><span style={estiloLabel}>Complemento</span><div style={estiloBox}>{campo(m.complemento)}</div></div>
        </div>

        <div style={estiloGrid('1fr 1fr 80px')}>
          <div><span style={estiloLabel}>Bairro</span><div style={estiloBox}>{campo(m.bairro)}</div></div>
          <div><span style={estiloLabel}>Cidade</span><div style={estiloBox}>{campo(m.cidade)}</div></div>
          <div><span style={estiloLabel}>Estado</span><div style={estiloBox}>{campo(m.estado)}</div></div>
        </div>

        <div style={estiloGrid('180px 1fr')}>
          <div><span style={estiloLabel}>CEP</span><div style={estiloBox}>{campo(m.cep)}</div></div>
          <div><span style={estiloLabel}>Telefone</span><div style={estiloBox}>{campo(m.telefone)}</div></div>
        </div>

        {/* Função */}
        <div style={{ marginBottom: 20, marginTop: 8 }}>
          <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', marginBottom: 10 }}>Função dos Atendimentos do DARPE</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
            {['Ministério', 'Atendente', 'Colaborador', 'Encarregado', 'Músico/Organista', 'Grupo de Canto'].map(f => (
              <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{
                  width: 14, height: 14, border: '1px solid #333',
                  background: m.funcao_darpe === f ? '#333' : 'transparent',
                  flexShrink: 0,
                }} />
                <span style={{ fontSize: 12 }}>{f}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Declaração */}
        <div style={{ border: '1px solid #333', padding: '10px 12px', marginBottom: 24, fontSize: 11, lineHeight: 1.5 }}>
          <p style={{ fontWeight: 700, marginBottom: 6, fontSize: 11 }}>DECLARAÇÃO DE VOLUNTARIADO</p>
          <p style={{ margin: 0 }}>
            DECLARO ser de minha livre e espontânea vontade o propósito colaborar na realização das reuniões de evangelização promovidas pela Congregação Cristã no Brasil em estabelecimentos atendidos pelo DARPE. DECLARO ainda estar ciente dos riscos inerentes ao exercício destas atividades, não havendo objeção por parte de meus familiares.
          </p>
        </div>

        {/* Data */}
        <p style={{ textAlign: 'center', fontSize: 13, marginBottom: 40 }}>
          {m.cidade || 'Jundiaí'} - {m.estado || 'SP'}, {dia} DE {mes.toUpperCase()} DE {ano}
        </p>

        {/* Assinaturas */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 24, marginTop: 40 }}>
          {['Ministério', 'Encarregado de Orquestra', 'Voluntário'].map(cargo => (
            <div key={cargo} style={{ textAlign: 'center' }}>
              <div style={{ borderTop: '1px solid #333', paddingTop: 6 }}>
                <p style={{ fontSize: 11, margin: 0, fontWeight: 600 }}>{cargo}</p>
                <p style={{ fontSize: 11, margin: '4px 0 0' }}>Nome: _______________________</p>
              </div>
            </div>
          ))}
        </div>

        {/* Rodapé */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 40, borderTop: '1px solid #333', paddingTop: 8 }}>
          <span style={{ fontSize: 10, color: '#666' }}>SIGA - DARPE</span>
          <span style={{ fontSize: 10, color: '#666' }}>Folha 1 / 1</span>
        </div>

      </div>
    </div>
  )
}