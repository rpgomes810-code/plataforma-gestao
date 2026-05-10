export default function Relatorios() {
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
          <a href="/dashboard/tarefas" className="flex items-center gap-3 px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-100">
            ✅ Tarefas
          </a>
          <a href="/dashboard/equipe" className="flex items-center gap-3 px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-100">
            👥 Equipe
          </a>
          <a href="/dashboard/relatorios" className="flex items-center gap-3 px-4 py-2 rounded-lg bg-blue-50 text-blue-700 font-medium">
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
          <h2 className="text-xl font-bold text-gray-800">Relatórios</h2>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition">
            Exportar PDF
          </button>
        </header>

        <main className="p-8 space-y-6">

          {/* Resumo geral */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Tarefas criadas", valor: "24", cor: "text-blue-600" },
              { label: "Concluídas", valor: "17", cor: "text-green-600" },
              { label: "Em andamento", valor: "5", cor: "text-yellow-600" },
              { label: "Pendentes", valor: "2", cor: "text-red-600" },
            ].map((item, i) => (
              <div key={i} className="bg-white rounded-2xl shadow p-5 text-center">
                <p className={`text-3xl font-bold ${item.cor}`}>{item.valor}</p>
                <p className="text-sm text-gray-500 mt-1">{item.label}</p>
              </div>
            ))}
          </div>

          {/* Desempenho por membro */}
          <div className="bg-white rounded-2xl shadow p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Desempenho por membro</h3>
            <div className="space-y-4">
              {[
                { nome: "Rene", concluidas: 8, total: 10 },
                { nome: "Ana Silva", concluidas: 5, total: 7 },
                { nome: "Carlos Souza", concluidas: 3, total: 8 },
                { nome: "Juliana Lima", concluidas: 4, total: 5 },
                { nome: "Pedro Costa", concluidas: 6, total: 7 },
              ].map((membro, i) => {
                const pct = Math.round((membro.concluidas / membro.total) * 100);
                return (
                  <div key={i}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium text-gray-700">{membro.nome}</span>
                      <span className="text-gray-500">{membro.concluidas}/{membro.total} tarefas · {pct}%</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2.5">
                      <div
                        className="bg-blue-600 h-2.5 rounded-full"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Tarefas por status */}
          <div className="bg-white rounded-2xl shadow p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Tarefas por status este mês</h3>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="bg-green-50 rounded-xl p-4">
                <p className="text-2xl font-bold text-green-600">17</p>
                <p className="text-sm text-green-700 mt-1">✅ Concluídas</p>
              </div>
              <div className="bg-yellow-50 rounded-xl p-4">
                <p className="text-2xl font-bold text-yellow-600">5</p>
                <p className="text-sm text-yellow-700 mt-1">⏳ Em andamento</p>
              </div>
              <div className="bg-red-50 rounded-xl p-4">
                <p className="text-2xl font-bold text-red-600">2</p>
                <p className="text-sm text-red-700 mt-1">🔴 Pendentes</p>
              </div>
            </div>
          </div>

        </main>
      </div>
    </div>
  );
}