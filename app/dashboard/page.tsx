export default function Dashboard() {
  return (
    <div className="p-4 md:p-8">

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-800">Dashboard</h2>
        <div className="flex items-center gap-3">
          <span className="text-gray-600 text-sm">Olá, Rene!</span>
          <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
            R
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-2xl shadow p-6">
          <p className="text-sm text-gray-500">Total de Tarefas</p>
          <p className="text-3xl font-bold text-gray-800 mt-1">24</p>
          <p className="text-green-500 text-sm mt-1">↑ 4 novas hoje</p>
        </div>
        <div className="bg-white rounded-2xl shadow p-6">
          <p className="text-sm text-gray-500">Membros da Equipe</p>
          <p className="text-3xl font-bold text-gray-800 mt-1">8</p>
          <p className="text-blue-500 text-sm mt-1">2 online agora</p>
        </div>
        <div className="bg-white rounded-2xl shadow p-6">
          <p className="text-sm text-gray-500">Concluídas</p>
          <p className="text-3xl font-bold text-gray-800 mt-1">17</p>
          <p className="text-purple-500 text-sm mt-1">71% do total</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow p-6">
        <h2 className="text-lg font-bold text-gray-800 mb-4">Tarefas Recentes</h2>
        <div className="space-y-3">
          {[
            { nome: "Reunião com equipe de vendas", status: "Em andamento", cor: "bg-yellow-100 text-yellow-700" },
            { nome: "Revisar relatório mensal", status: "Pendente", cor: "bg-red-100 text-red-700" },
            { nome: "Atualizar cadastro de clientes", status: "Concluída", cor: "bg-green-100 text-green-700" },
            { nome: "Treinamento novo colaborador", status: "Em andamento", cor: "bg-yellow-100 text-yellow-700" },
          ].map((tarefa, i) => (
            <div key={i} className="flex justify-between items-center border-b pb-3 last:border-0 last:pb-0">
              <span className="text-gray-700 text-sm">{tarefa.nome}</span>
              <span className={`text-xs font-semibold px-3 py-1 rounded-full ${tarefa.cor}`}>
                {tarefa.status}
              </span>
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}