export const dynamic = 'force-dynamic'

import { createClient } from '@supabase/supabase-js'
import BotaoReverter from './BotaoReverter'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const CAMPOS_IGNORAR = ['id', 'user_id', 'aprovado', 'criado_em', 'escala_id', 'criado_por', 'data_registro', 'ativo', 'logo_url', 'created_at', 'registrada', 'confirmacao_aberta', 'hospital_id']

function formatarValor(valor: any): string {
  if (valor === null || valor === undefined) return '—'
  if (typeof valor === 'object') return JSON.stringify(valor, null, 2)
  return String(valor)
}

function DiffView({ antes, depois }: { antes: any, depois: any }) {
  if (!antes || !depois) return null
  const campos = new Set([...Object.keys(antes), ...Object.keys(depois)])
  const alterados = Array.from(campos).filter(campo => {
    if (CAMPOS_IGNORAR.includes(campo)) return false
    return JSON.stringify(antes[campo]) !== JSON.stringify(depois[campo])
  })
  if (alterados.length === 0) return <p style={{ fontSize: 11, color: '#94a3b8', margin: 0 }}>Nenhuma alteração detectada</p>
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 8 }}>
      {alterados.map(campo => (
        <div key={campo} style={{ borderRadius: 6, overflow: 'hidden', border: '1px solid #f1f5f9', fontSize: 11 }}>
          <div style={{ background: '#f8fafc', padding: '3px 8px', fontWeight: 700, color: '#475569' }}>{campo}</div>
          <div style={{ background: '#fee2e2', padding: '3px 8px', color: '#dc2626', whiteSpace: 'pre-wrap' }}>— {formatarValor(antes[campo])}</div>
          <div style={{ background: '#dcfce7', padding: '3px 8px', color: '#16a34a', whiteSpace: 'pre-wrap' }}>+ {formatarValor(depois[campo])}</div>
        </div>
      ))}
    </div>
  )
}

export default async function Logs() {
  const { data: logs } = await supabase
    .from('logs').select('*')
    .order('criado_em', { ascending: false })
    .limit(200)

  const formatarDataHora = (data: string) => new Date(data).toLocaleDateString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
    timeZone: 'America/Sao_Paulo'
  })

  const badgeAcao = (acao: string) => {
    let bg = '#f1f5f9', color = '#475569'
    if (acao.includes('[REVERTIDO]')) { bg = '#fff7ed'; color = '#d97706' }
    else if (acao.includes('Excluiu')) { bg = '#fee2e2'; color = '#dc2626' }
    else if (acao.includes('Criou') || acao.includes('Aprovou') || acao.includes('Registrou') || acao.includes('Gerou') || acao.includes('Liberou')) { bg = '#dcfce7'; color = '#16a34a' }
    else if (acao.includes('Editou') || acao.includes('Atualizou') || acao.includes('Alterou')) { bg = '#fef9c3'; color = '#854d0e' }
    return { bg, color }
  }

  const podeReverter = (log: any) =>
    log.acao.includes('Excluiu membro') && !log.acao.includes('[REVERTIDO]') && log.dados_antes && log.tabela === 'membros'

  return (
    <div style={{ background: '#f1f5f9', minHeight: '100vh', padding: '28px 40px' }} className="logs-wrap">
      <style>{`@media (max-width: 768px) { .logs-wrap { padding: 16px !important; } .col-alteracoes { display: none !important; } }`}</style>

      <div style={{ maxWidth: 1280, margin: '0 auto' }}>

        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: '#1e293b', margin: 0 }}>Log de Auditoria</h1>
          <p style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>{logs?.length} registros — últimas 200 ações</p>
        </div>

        {!logs?.length ? (
          <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', padding: '48px 24px', textAlign: 'center' }}>
            <p style={{ fontSize: 36, marginBottom: 12 }}>📋</p>
            <p style={{ color: '#64748b', fontSize: 14 }}>Nenhuma ação registrada ainda</p>
          </div>
        ) : (
          <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '160px 160px 1fr 100px 1fr 80px', padding: '10px 20px', background: '#f8fafc', borderBottom: '1px solid #f1f5f9' }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', letterSpacing: 1 }}>DATA/HORA</span>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', letterSpacing: 1 }}>USUÁRIO</span>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', letterSpacing: 1 }}>AÇÃO</span>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', letterSpacing: 1 }}>TABELA</span>
              <span className="col-alteracoes" style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', letterSpacing: 1 }}>ALTERAÇÕES</span>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', letterSpacing: 1 }}></span>
            </div>

            {logs?.map((log, idx) => {
              const { bg, color } = badgeAcao(log.acao)
              return (
                <div key={log.id} style={{
                  display: 'grid', gridTemplateColumns: '160px 160px 1fr 100px 1fr 80px',
                  padding: '12px 20px', borderBottom: idx < logs.length - 1 ? '1px solid #f1f5f9' : 'none',
                  alignItems: 'start',
                }}>
                  <span style={{ fontSize: 11, color: '#94a3b8' }}>{formatarDataHora(log.criado_em)}</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#1e293b' }}>{log.usuario_nome || '—'}</span>
                  <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 999, background: bg, color, display: 'inline-block', width: 'fit-content' }}>
                    {log.acao}
                  </span>
                  <span style={{ fontSize: 12, color: '#64748b' }}>{log.tabela || '—'}</span>
                  <div className="col-alteracoes">
                    {log.dados_antes && log.dados_depois && !log.dados_depois.excluido ? (
                      <details>
                        <summary style={{ cursor: 'pointer', color: '#2563eb', fontSize: 12, fontWeight: 600 }}>Ver o que mudou</summary>
                        <DiffView antes={log.dados_antes} depois={log.dados_depois} />
                      </details>
                    ) : log.dados_antes && (
                      <details>
                        <summary style={{ cursor: 'pointer', color: '#2563eb', fontSize: 12, fontWeight: 600 }}>Ver dados</summary>
                        <div style={{ marginTop: 8, background: '#fee2e2', borderRadius: 6, padding: 8 }}>
                          <pre style={{ fontSize: 11, color: '#dc2626', whiteSpace: 'pre-wrap', margin: 0 }}>{JSON.stringify(log.dados_antes, null, 2)}</pre>
                        </div>
                      </details>
                    )}
                  </div>
                  <div>
                    {podeReverter(log) && <BotaoReverter logId={log.id} tabela={log.tabela} dadosAntes={log.dados_antes} />}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}