export const dynamic = 'force-dynamic'

import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import BotaoExcluirRegistro from './BotaoExcluirRegistro'

export default async function Registros() {
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
    .select('nivel_acesso')
    .eq('user_id', user?.id)
    .single()

  const isAdmin = usuarioLogado?.nivel_acesso === 'Administrador'

  const { data: registros } = await supabase
    .from('registros')
    .select('*, hospitais(nome)')
    .order('data', { ascending: false })

  const formatarData = (data: string) => {
    return new Date(data + 'T12:00:00').toLocaleDateString('pt-BR')
  }

  return (
    <div className="p-4 md:p-6">

      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Registros de Atendimento</h2>
          <p className="text-sm text-gray-500">{registros?.length} registros cadastrados</p>
        </div>
        <a href="/dashboard/registros/novo"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition">
          + Novo Registro
        </a>
      </div>

      {registros?.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl shadow">
          <p className="text-4xl mb-3">📋</p>
          <p className="text-gray-500">Nenhum registro cadastrado ainda</p>
        </div>
      ) : (
        <div className="space-y-4">
          {registros?.map(registro => (
            <div key={registro.id} className="bg-white rounded-2xl shadow p-5">
              <div className="flex flex-col md:flex-row justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white text-lg">
                        🏥
                      </div>
                      <div>
                        <p className="font-bold text-gray-800">{registro.hospitais?.nome || '—'}</p>
                        <p className="text-xs text-gray-400">{formatarData(registro.data)} · {registro.hora_inicio} às {registro.hora_termino}</p>
                      </div>
                    </div>
                    {isAdmin && (
                      <BotaoExcluirRegistro
                        id={registro.id}
                        hospital={registro.hospitais?.nome || '—'}
                      />
                    )}
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                    <div>
                      <p className="text-gray-400 text-xs">Autorizou entrada</p>
                      <p className="text-gray-700 font-medium">👤 {registro.quem_autorizou || '—'}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-xs">Membros presentes</p>
                      <p className="text-gray-700 font-medium">👥 {registro.membros_presentes || '—'}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-xs">Hinos executados</p>
                      <p className="text-gray-700 font-medium">🎵 {registro.hinos_executados}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-xs">Oração</p>
                      <p className="text-gray-700 font-medium">{registro.teve_oracao ? '✅ Sim' : '❌ Não'}</p>
                    </div>
                  </div>
                  {registro.observacoes && (
                    <div className="mt-3 text-sm text-gray-500 bg-gray-50 rounded-lg p-2">
                      💬 {registro.observacoes}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  )
}