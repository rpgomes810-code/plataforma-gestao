import { supabase } from '../../lib/supabase'

export default async function Equipe() {
  const { data: membros } = await supabase
    .from('equipe')
    .select('*')
    .order('criado_em', { ascending: true })

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <aside className="w-64 bg-white shadow-md flex flex-col">
        <div className="px-6 py-5 border-b">
          <h1 className="text-lg font-bold text-gray-800">Plataforma de Gestão</h1>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-1">
          <a href="/dashboard" className="flex items-center gap-3 px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-100">📊 Dashboard</a>
          <a href="/dashboard/tarefas" className="flex items-center gap-3 px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-100">✅ Tarefas</a>
          <a href="/dashboard/equipe" className="flex items-center gap-3 px-4 py-2 rounded-lg bg-blue-50 text-blue-700 font-medium">👥 Equipe</a>
          <a href="/dashboard/relatorios" className="flex items-center gap-3 px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-100">📈 Relatórios</a>
        </nav>
        <div className="px-4 py-4 border-t">
          <a href="/" className="flex items-center gap-3 px-4 py-2 rounded-lg text-red-500 hover:bg-red-50">🚪 Sair</a>
        </div>
      </aside>

      <div className="flex-1 flex flex-col">
        <header className="bg-white shadow px-8 py-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800">Equipe</h2>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition">
            + Novo Membro
          </button>
        </header>

        <main className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {membros?.map((membro) => (
              <div key={membro.id} className="bg-white rounded-2xl shadow p-6 flex flex-col gap-3">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-lg">
                    {membro.nome.charAt(0)}
                  </div>
                  <div>
                    <p className="font-bold text-gray-800">{membro.nome}</p>
                    <p className="text-sm text-gray-500">{membro.cargo}</p>
                  </div>
                  <span className={`ml-auto text-xs font-semibold px-2 py-1 rounded-full ${membro.status === 'Online' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {membro.status}
                  </span>
                </div>
                <div className="border-t pt-3 text-sm text-gray-500">
                  📧 {membro.email}
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  )
}