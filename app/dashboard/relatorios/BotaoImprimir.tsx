'use client'

import { useState } from 'react'

const CARDS = [
  { id: 'resumo', label: '🏥 Resumo dos atendimentos', desc: 'Hospital, data, horário, hinos, oração, atendente' },
  { id: 'presenca', label: '✅ Presença', desc: 'Confirmou mas não foi, não confirmou mas foi, faltou' },
  { id: 'grupos', label: '🎻 Status dos grupos', desc: 'Situação de cada grupo' },
  { id: 'hospitais', label: '🏥 Atendimentos por hospital', desc: 'Ranking de atendimentos' },
  { id: 'novos', label: '🆕 Novos membros', desc: 'Membros adicionados no período' },
  { id: 'mais_presentes', label: '⭐ Mais presentes', desc: 'Top 5 membros mais frequentes' },
  { id: 'menos_presentes', label: '⚠️ Menos frequentes', desc: 'Top 5 membros menos frequentes' },
  { id: 'membros', label: '👥 Membros por grupo/perfil/instrumento', desc: 'Distribuição dos membros' },
]

interface Props {
  dados: any
  dataInicio: string
  dataFim: string
}

export default function BotaoImprimir({ dados, dataInicio, dataFim }: Props) {
  const [modalAberto, setModalAberto] = useState(false)
  const [selecionados, setSelecionados] = useState<string[]>(['resumo'])

  const toggle = (id: string) => {
    setSelecionados(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  const imprimir = () => {
    const janela = window.open('', '_blank')
    if (!janela) return
    janela.document.write(gerarHTML(dados, selecionados, dataInicio, dataFim))
    janela.document.close()
    janela.focus()
    setTimeout(() => janela.print(), 500)
    setModalAberto(false)
  }

  return (
    <>
      <button onClick={() => setModalAberto(true)} style={{
        padding: '9px 18px', borderRadius: 8, border: '1px solid #2563eb',
        background: '#fff', color: '#2563eb', fontSize: 13, fontWeight: 600,
        cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
      }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="6 9 6 2 18 2 18 9"/>
          <path d="M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2"/>
          <rect x="6" y="14" width="12" height="8"/>
        </svg>
        Imprimir
      </button>

      {modalAberto && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div style={{ background: '#fff', borderRadius: 16, width: '100%', maxWidth: 500, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
            <div style={{ background: '#1e3a5f', padding: '16px 24px', borderRadius: '16px 16px 0 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ color: '#fff', fontWeight: 700, fontSize: 15, margin: 0 }}>Selecionar o que imprimir</h3>
              <button onClick={() => setModalAberto(false)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.7)', cursor: 'pointer', fontSize: 18 }}>✕</button>
            </div>

            <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 10 }}>
              <p style={{ fontSize: 12, color: '#94a3b8', margin: '0 0 4px' }}>Período: {dataInicio} até {dataFim}</p>

              {CARDS.map(card => (
                <label key={card.id} style={{
                  display: 'flex', alignItems: 'flex-start', gap: 12, cursor: 'pointer',
                  padding: '10px 14px', borderRadius: 10, border: '1px solid',
                  borderColor: selecionados.includes(card.id) ? '#2563eb' : '#e2e8f0',
                  background: selecionados.includes(card.id) ? '#eff6ff' : '#f8fafc',
                }}>
                  <input
                    type="checkbox"
                    checked={selecionados.includes(card.id)}
                    onChange={() => toggle(card.id)}
                    style={{ marginTop: 2, accentColor: '#2563eb', width: 16, height: 16 }}
                  />
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 700, color: '#1e293b', margin: 0 }}>{card.label}</p>
                    <p style={{ fontSize: 11, color: '#94a3b8', margin: 0 }}>{card.desc}</p>
                  </div>
                </label>
              ))}

              <div style={{ display: 'flex', gap: 8, paddingTop: 8 }}>
                <button onClick={imprimir} disabled={selecionados.length === 0} style={{
                  flex: 1, padding: '10px', borderRadius: 8, border: 'none',
                  background: selecionados.length === 0 ? '#cbd5e1' : '#2563eb',
                  color: '#fff', fontSize: 13, fontWeight: 700,
                  cursor: selecionados.length === 0 ? 'not-allowed' : 'pointer',
                }}>
                  🖨️ Imprimir selecionados
                </button>
                <button onClick={() => setModalAberto(false)} style={{
                  flex: 1, padding: '10px', borderRadius: 8,
                  border: '1px solid #e2e8f0', background: '#fff',
                  color: '#475569', fontSize: 13, fontWeight: 600, cursor: 'pointer',
                }}>
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

function gerarHTML(dados: any, selecionados: string[], dataInicio: string, dataFim: string): string {
  const {
    registros, confirmouMasNaoFoi, naoConfirmouMasFoi, faltou,
    statusGrupos, hospitalOrdenado, novosNoPeriodo,
    maisPresentes, menosPresentes, porGrupo, porPerfil,
    instrumentosOrdenados, totalInstrumentos
  } = dados

  const estilos = `
    body { font-family: Arial, sans-serif; padding: 24px; color: #1e293b; font-size: 13px; }
    h1 { font-size: 20px; font-weight: 800; margin-bottom: 4px; color: #1e3a5f; }
    h2 { font-size: 14px; font-weight: 700; margin: 24px 0 10px; color: #1e3a5f; border-bottom: 2px solid #1e3a5f; padding-bottom: 6px; }
    p.sub { font-size: 12px; color: #64748b; margin: 0 0 16px; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 12px; }
    th { background: #1e3a5f; color: #fff; padding: 8px 10px; text-align: left; font-size: 11px; letter-spacing: 0.5px; }
    td { padding: 8px 10px; border-bottom: 1px solid #e2e8f0; vertical-align: top; }
    tr:nth-child(even) td { background: #f8fafc; }
    .sim { color: #16a34a; font-weight: 700; }
    .nao { color: #dc2626; font-weight: 700; }
    .badge { display: inline-block; padding: 2px 8px; border-radius: 999px; font-size: 11px; font-weight: 700; }
    @media print { body { padding: 0; } }
  `

  let conteudo = `
    <h1>Relatório DARPE — Setor 4 Hospitais</h1>
    <p class="sub">Período: ${dataInicio} até ${dataFim} · Gerado em: ${new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
  `

  if (selecionados.includes('resumo')) {
    conteudo += `<h2>🏥 Resumo dos Atendimentos</h2>`
    if (!registros || registros.length === 0) {
      conteudo += `<p>Nenhum atendimento no período.</p>`
    } else {
      conteudo += `<table><thead><tr>
        <th>Hospital</th><th>Data</th><th>Início</th><th>Término</th>
        <th>Atendente</th><th>Hinos</th><th>Oração</th><th>Participantes</th>
      </tr></thead><tbody>`
      registros.forEach((r: any) => {
        const data = new Date(r.data + 'T12:00:00').toLocaleDateString('pt-BR')
        conteudo += `<tr>
          <td>${r.hospitais?.nome || '—'}</td>
          <td>${data}</td>
          <td>${r.hora_inicio || '—'}</td>
          <td>${r.hora_termino || '—'}</td>
          <td>${r.criado_por || '—'}</td>
          <td>${r.hinos_executados || 0}</td>
          <td class="${r.teve_oracao ? 'sim' : 'nao'}">${r.teve_oracao ? 'Sim' : 'Não'}</td>
          <td>${r.quantidade_participantes || 0}</td>
        </tr>`
      })
      conteudo += `</tbody></table>`
    }
  }

  if (selecionados.includes('presenca')) {
    conteudo += `<h2>✅ Presença</h2>`
    if (confirmouMasNaoFoi?.length > 0) {
      conteudo += `<p><strong>Confirmou mas não foi (${confirmouMasNaoFoi.length})</strong></p>
      <table><thead><tr><th>Membro</th><th>Grupo</th><th>Escala</th><th>Data</th></tr></thead><tbody>`
      confirmouMasNaoFoi.forEach((m: any) => {
        conteudo += `<tr><td>${m.nome}</td><td>${m.grupo}</td><td>${m.escala}</td><td>${new Date(m.data + 'T12:00:00').toLocaleDateString('pt-BR')}</td></tr>`
      })
      conteudo += `</tbody></table>`
    }
    if (naoConfirmouMasFoi?.length > 0) {
      conteudo += `<p><strong>Não confirmou mas foi (${naoConfirmouMasFoi.length})</strong></p>
      <table><thead><tr><th>Membro</th><th>Grupo</th><th>Escala</th><th>Data</th></tr></thead><tbody>`
      naoConfirmouMasFoi.forEach((m: any) => {
        conteudo += `<tr><td>${m.nome}</td><td>${m.grupo}</td><td>${m.escala}</td><td>${new Date(m.data + 'T12:00:00').toLocaleDateString('pt-BR')}</td></tr>`
      })
      conteudo += `</tbody></table>`
    }
    if (faltou?.length > 0) {
      conteudo += `<p><strong>Não confirmou e não foi (${faltou.length})</strong></p>
      <table><thead><tr><th>Membro</th><th>Grupo</th><th>Escala</th><th>Data</th></tr></thead><tbody>`
      faltou.forEach((m: any) => {
        conteudo += `<tr><td>${m.nome}</td><td>${m.grupo}</td><td>${m.escala}</td><td>${new Date(m.data + 'T12:00:00').toLocaleDateString('pt-BR')}</td></tr>`
      })
      conteudo += `</tbody></table>`
    }
    if (!confirmouMasNaoFoi?.length && !naoConfirmouMasFoi?.length && !faltou?.length) {
      conteudo += `<p>Nenhuma inconsistência de presença no período.</p>`
    }
  }

  if (selecionados.includes('grupos')) {
    conteudo += `<h2>🎻 Status dos Grupos</h2>`
    if (!statusGrupos || statusGrupos.length === 0) {
      conteudo += `<p>Nenhum grupo monitorado.</p>`
    } else {
      conteudo += `<table><thead><tr>
        <th>Grupo</th><th>Status</th><th>Violino</th><th>Viola</th><th>Violoncelo</th><th>Vocal</th><th>Organizador</th>
      </tr></thead><tbody>`
      statusGrupos.forEach((g: any) => {
        conteudo += `<tr>
          <td>${g.grupo}</td>
          <td>${g.label}</td>
          <td>${g.violinos}</td>
          <td>${g.violas}</td>
          <td>${g.violoncelos}</td>
          <td>${g.vocais}</td>
          <td class="${g.temOrganizador ? 'sim' : 'nao'}">${g.temOrganizador ? 'Sim' : 'Não'}</td>
        </tr>`
      })
      conteudo += `</tbody></table>`
    }
  }

  if (selecionados.includes('hospitais')) {
    conteudo += `<h2>🏥 Atendimentos por Hospital</h2>`
    if (!hospitalOrdenado || hospitalOrdenado.length === 0) {
      conteudo += `<p>Nenhum atendimento no período.</p>`
    } else {
      conteudo += `<table><thead><tr><th>Hospital</th><th>Atendimentos</th></tr></thead><tbody>`
      hospitalOrdenado.forEach(([nome, total]: any) => {
        conteudo += `<tr><td>${nome}</td><td>${total}</td></tr>`
      })
      conteudo += `</tbody></table>`
    }
  }

  if (selecionados.includes('novos')) {
    conteudo += `<h2>🆕 Novos Membros no Período</h2>`
    if (!novosNoPeriodo || novosNoPeriodo.length === 0) {
      conteudo += `<p>Nenhum membro adicionado no período.</p>`
    } else {
      conteudo += `<table><thead><tr><th>Nome</th><th>Grupo</th><th>Instrumento</th><th>Data de entrada</th></tr></thead><tbody>`
      novosNoPeriodo.forEach((m: any) => {
        conteudo += `<tr>
          <td>${m.nome}</td>
          <td>${m.grupo || '—'}</td>
          <td>${m.instrumento || '—'}</td>
          <td>${m.criado_em ? new Date(m.criado_em).toLocaleDateString('pt-BR') : '—'}</td>
        </tr>`
      })
      conteudo += `</tbody></table>`
    }
  }

  if (selecionados.includes('mais_presentes')) {
    conteudo += `<h2>⭐ Mais Presentes</h2>`
    if (!maisPresentes || maisPresentes.length === 0) {
      conteudo += `<p>Nenhum atendimento no período.</p>`
    } else {
      conteudo += `<table><thead><tr><th>Membro</th><th>Presenças</th></tr></thead><tbody>`
      maisPresentes.forEach(([nome, total]: any) => {
        conteudo += `<tr><td>${nome}</td><td>${total}x</td></tr>`
      })
      conteudo += `</tbody></table>`
    }
  }

  if (selecionados.includes('menos_presentes')) {
    conteudo += `<h2>⚠️ Menos Frequentes</h2>`
    if (!menosPresentes || menosPresentes.length === 0) {
      conteudo += `<p>Nenhum atendimento no período.</p>`
    } else {
      conteudo += `<table><thead><tr><th>Membro</th><th>Presenças</th></tr></thead><tbody>`
      menosPresentes.forEach(([nome, total]: any) => {
        conteudo += `<tr><td>${nome}</td><td>${total}x</td></tr>`
      })
      conteudo += `</tbody></table>`
    }
  }

  if (selecionados.includes('membros')) {
    conteudo += `<h2>👥 Membros por Grupo</h2>`
    conteudo += `<table><thead><tr><th>Grupo</th><th>Total</th></tr></thead><tbody>`
    Object.entries(porGrupo || {}).forEach(([grupo, total]) => {
      conteudo += `<tr><td>${grupo}</td><td>${total}</td></tr>`
    })
    conteudo += `</tbody></table>`

    conteudo += `<h2>👥 Membros por Perfil</h2>`
    conteudo += `<table><thead><tr><th>Perfil</th><th>Total</th></tr></thead><tbody>`
    Object.entries(porPerfil || {}).forEach(([perfil, total]) => {
      conteudo += `<tr><td>${perfil}</td><td>${total}</td></tr>`
    })
    conteudo += `</tbody></table>`

    conteudo += `<h2>🎼 Por Instrumento</h2>`
    conteudo += `<table><thead><tr><th>Instrumento</th><th>Total</th><th>%</th></tr></thead><tbody>`
    ;(instrumentosOrdenados || []).forEach(([inst, total]: any) => {
      conteudo += `<tr><td>${inst}</td><td>${total}</td><td>${Math.round((total / totalInstrumentos) * 100)}%</td></tr>`
    })
    conteudo += `</tbody></table>`
  }

  return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Relatório DARPE</title><style>${estilos}</style></head><body>${conteudo}</body></html>`
}