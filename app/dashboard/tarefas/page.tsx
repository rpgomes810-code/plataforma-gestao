import { supabase } from '../../lib/supabase'

export default async function Tarefas() {
  const { data: tarefas } = await supabase
    .from('tarefas')
    .select('*')
    .order('criado_em', { ascending: false })

  return (
    <div className="min-h-screen bg-gray-100 flex">

      {/* Menu lateral */}
      <aside className="w-64 bg-white shadow-md flex flex-col">
        <div className="px-6 py-5 border-b">
          <h1 className="text-lg font-bold text-gray-800">Plataforma de Gestão</h1>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-1">
          <a href="/dashboard" className="flex items-center gap-3 px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-100">
            📊 Dashboard
          </a>
          <a href="/dashboard/tarefas" className="flex items-center gap-3 px-4 py-2 rounded-lg bg-blue-50 text-blue-700 font-medium">
            ✅ Tarefas
          </a>
          <a href="/dashboard/equipe" className="flex items-center gap-3 px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-100">
            👥 Equipe
          </a>
          <a href="/dashboard/relatorios" className="flex items-center gap-3 px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-100">
            📈 Relatórios
          </a>
        </nav>
        <div className="px-4 py-4 border-t">
          <a href="/" className="flex items-center gap-3 px-4 py-2 rounded-lg text-red-500 hover:bg-red-50">
            🚪 Sair
          </a>
        </div>
      </aside>

      {/* Conteúdo */}
      <div className="flex-1 flex flex-col">
        <header className="bg-white shadow px-8 py-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800">Tarefas</h2>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition">
            + Nova Tarefa
          </button>
        </header>

        <main className="p-8 space-y-4">
          {tarefas?.map((tarefa) => {
            const cores: Record<string, string> = {
              'Concluída': 'bg-green-100 text-green-700',
              'Em andamento': 'bg-yellow-100 text-yellow-700',
              'Pendente': 'bg-red-100 text-red-700',
            }
            return (
              <div key={tarefa.id} className="bg-white rounded-2xl shadow px-6 py-4 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-gray-800">{tarefa.nome}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    👤 {tarefa.responsavel} · 📅 {new Date(tarefa.prazo).toLocaleDateString('pt-BR')}
                  </p>
                </div>
                <span className={`text-xs font-semibold px-3 py-1 rounded-full ${cores[tarefa.status] || 'bg-gray-100 text-gray-700'}`}>
                  {tarefa.status}
                </span>
              </div>
            )
          })}
        </main>
      </div>
    </div>
  )
}