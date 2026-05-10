import { supabase } from '../../lib/supabase'

export default async function Membros() {
  const { data: membros } = await supabase
    .from('membros')
    .select('*')
    .order('nome', { ascending: true })

  const tipos = ['Todos', 'Músico', 'Vocal', 'Atendente', 'Organizador']
  const grupos = [...new Set(membros?.map(m => m.grupo).filter(Boolean))]

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <aside className="w-64 bg-white shadow-md flex flex-col">
        <div className="px-6 py-5 border-b">
          <p className="text-xs text-gray-400 uppercase tracking-wider">DARPE</p>
          <h1 className="text-lg font-bold text-gray-800">Setor 4 — Hospitais</h1>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-1">
          <a href="/dashboard" className="flex items-center gap-3 px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-100">📊 Dashboard</a>
          <a href="/dashboard/membros" className="flex items-center gap-3 px-4 py-2 rounded-lg bg-blue-50 text-blue-700 font-medium">👥 Membros</a>
          <a href="/dashboard/hospitais" className="flex items-center gap-3 px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-100">🏥 Hospitais</a>
          <a href="/dashboard/escalas" className="flex items-center gap-3 px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-100">📅 Escalas</a>
          <a href="/dashboard/registros" className="flex items-center gap-3 px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-100">📋 Registros</a>
          <a href="/dashboard/relatorios" className="flex items-center gap-3 px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-100">📈 Relatórios</a>
        </nav>
        <div className="px-4 py-4 border-t">
          <a href="/" className="flex items-center gap-3 px-4 py-2 rounded-lg text-red-500 hover:bg-red-50">🚪 Sair</a>
        </div>
      </aside>

      <div className="flex-1 flex flex-col">
        <header className="bg-white shadow px-8 py-4 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-gray-800">Membros</h2>
            <p className="text-sm text-gray-500">{membros?.length} membros cadastrados</p>
          </div>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition">
            + Novo Membro
          </button>
        </header>

        <main className="p-8">
          {/* Cards por grupo */}
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
                    <div className="border-t pt-3 flex justify-between text-sm text-gray-500">
                      <span>📱 {membro.telefone || '—'}</span>
                      <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                        membro.nivel_acesso === 'Ministério' ? 'bg-purple-100 text-purple-700' :
                        membro.nivel_acesso === 'Administrador' ? 'bg-blue-100 text-blue-700' :
                        membro.nivel_acesso === 'Auxiliar' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {membro.nivel_acesso}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </main>
      </div>
    </div>
  )
}