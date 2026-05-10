export default function NovoMembro() {
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
            <h2 className="text-xl font-bold text-gray-800">Novo Membro</h2>
            <p className="text-sm text-gray-500">Preencha os dados do novo membro</p>
          </div>
          <a href="/dashboard/membros" className="text-gray-500 hover:text-gray-700 text-sm">← Voltar</a>
        </header>

        <main className="p-8">
          <div className="bg-white rounded-2xl shadow p-8 max-w-2xl">
            <form action="/api/membros" method="POST" className="space-y-6">

              <div className="grid grid-cols-2 gap-6">

                {/* Nome */}
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nome completo *</label>
                  <input name="nome" type="text" required placeholder="Nome do membro"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"/>
                </div>

                {/* Telefone */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
                  <input name="telefone" type="text" placeholder="(11) 99999-0000"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"/>
                </div>

                {/* Data de Nascimento */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Data de Nascimento</label>
                  <input name="data_nascimento" type="date"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"/>
                </div>

                {/* Comum */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Comum </label>
                  <input name="comum" type="text" placeholder="Ex: Vila Arens, Jundiaí"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"/>
                </div>

                {/* Cidade */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cidade</label>
                  <input name="cidade" type="text" placeholder="Ex: Jundiaí"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"/>
                </div>

                {/* Tipo */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tipo *</label>
                  <select name="tipo" required className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="">Selecione...</option>
                    <option value="Músico">Músico</option>
                    <option value="Vocal">Vocal</option>
                    <option value="Atendente">Atendente</option>
                    <option value="Organizador">Organizador</option>
                  </select>
                </div>

                {/* Instrumento */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Instrumento</label>
                  <select name="instrumento" className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="">Nenhum</option>
                    <option value="Violino">Violino</option>
                    <option value="Viola">Viola</option>
                    <option value="Violoncelo">Violoncelo</option>
                    <option value="Voz">Voz</option>
                  </select>
                </div>

                {/* Grupo */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Grupo *</label>
                  <select name="grupo" required className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="">Selecione...</option>
                    <option value="Grupo 1">Grupo 1</option>
                    <option value="Grupo 2">Grupo 2</option>
                    <option value="Grupo 3">Grupo 3</option>
                    <option value="Grupo 4">Grupo 4</option>
                    <option value="Grupo 5">Grupo 5</option>
                  </select>
                </div>

                {/* Nível de acesso */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nível de acesso *</label>
                  <select name="nivel_acesso" required className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="Colaborador">Colaborador</option>
                    <option value="Auxiliar">Auxiliar</option>
                    <option value="Administrador">Administrador</option>
                    <option value="Ministério">Ministério</option>
                  </select>
                </div>

                {/* Cargo */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cargo</label>
                  <select name="cargo" className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="">Nenhum</option>
                    <option value="Ancião">Ancião</option>
                    <option value="Cooperador">Cooperador</option>
                    <option value="Diácono">Diácono</option>
                    <option value="Secretário">Secretário</option>
                    <option value="Gestor">Gestor</option>
                  </select>
                </div>

                {/* Observações */}
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Observações</label>
                  <textarea name="observacoes" rows={3} placeholder="Observações sobre o membro..."
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"/>
                </div>
              </div>

              <div className="flex gap-4 pt-2">
                <button type="submit"
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition">
                  Salvar Membro
                </button>
                <a href="/dashboard/membros"
                  className="bg-gray-100 text-gray-700 px-6 py-2 rounded-lg font-semibold hover:bg-gray-200 transition">
                  Cancelar
                </a>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  )
}