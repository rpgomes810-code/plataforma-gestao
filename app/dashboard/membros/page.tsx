export const dynamic = 'force-dynamic'

import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import BotaoExcluir from './BotaoExcluir'

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

  const { data: usuarioLogado } = await supabase
    .from('membros')
    .select('nivel_acesso, nome')
    .eq('user_id', user?.id)
    .single()

  const isAdmin = usuarioLogado?.nivel_acesso === 'Administrador'

  const { data: membros } = await supabase
    .from('membros')
    .select('*')
    .order('nome', { ascending: true })

  const grupos = [...new Set(membros?.map(m => m.grupo).filter(Boolean))].sort((a, b) => {
  const numA = parseInt(a.replace(/\D/g, '')) || 0
  const numB = parseInt(b.replace(/\D/g, '')) || 0
  return numA - numB
})
  const semGrupo = membros?.filter(m => !m.grupo) || []

  return (
    <div className="p-4 md:p-6">

      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Membros</h2>
          <p className="text-sm text-gray-500">{membros?.length} membros cadastrados</p>
        </div>
        <a href="/dashboard/membros/novo"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition">
          + Novo Membro
        </a>
      </div>

      {grupos.map(grupo => (
        <div key={grupo} className="mb-8">
          <h3 className="text-lg font-bold text-gray-700 mb-4">🎻 {grupo}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {membros?.filter(m => m.grupo === grupo).map(membro => (
              <div key={membro.id} className="bg-white rounded-2xl shadow p-5 flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-lg">
                    {membro.nome.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-gray-800">{membro.nome}</p>
                    <p className="text-sm text-gray-500">{membro.tipo}{membro.instrumento ? ` — ${membro.instrumento}` : ''}</p>
                  </div>
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                    membro.status === 'Ativo' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                  }`}>
                    {membro.status}
                  </span>
                </div>
                <div className="border-t pt-3 flex justify-between items-center text-sm text-gray-500">
                  <span>📱 {membro.telefone || '—'}</span>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                      membro.nivel_acesso === 'Ministério' ? 'bg-purple-100 text-purple-700' :
                      membro.nivel_acesso === 'Administrador' ? 'bg-blue-100 text-blue-700' :
                      membro.nivel_acesso === 'Auxiliar' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {membro.nivel_acesso || '—'}
                    </span>
                    <a href={`/dashboard/membros/${membro.id}/editar`}
                      className="text-xs font-semibold px-3 py-1 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100 transition">
                      Editar
                    </a>
                    {isAdmin && <BotaoExcluir id={membro.id} nome={membro.nome} usuarioNome={usuarioLogado?.nome} />}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {semGrupo.length > 0 && (
        <div className="mb-8">
          <h3 className="text-lg font-bold text-gray-700 mb-4">⏳ Sem grupo definido</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {semGrupo.map(membro => (
              <div key={membro.id} className="bg-white rounded-2xl shadow p-5 flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-gray-400 flex items-center justify-center text-white font-bold text-lg">
                    {membro.nome.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-gray-800">{membro.nome}</p>
                    <p className="text-sm text-gray-500">{membro.instrumento || 'Sem instrumento'}</p>
                  </div>
                  <span className="text-xs font-semibold px-2 py-1 rounded-full bg-yellow-100 text-yellow-700">
                    Pendente
                  </span>
                </div>
                <div className="border-t pt-3 flex justify-between items-center text-sm text-gray-500">
                  <span>📱 {membro.telefone || '—'}</span>
                  <div className="flex items-center gap-2">
                    <span>📍 {membro.cidade || '—'}</span>
                    <a href={`/dashboard/membros/${membro.id}/editar`}
                      className="text-xs font-semibold px-3 py-1 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100 transition">
                      Editar
                    </a>
                    {isAdmin && <BotaoExcluir id={membro.id} nome={membro.nome} usuarioNome={usuarioLogado?.nome} />}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  )
}