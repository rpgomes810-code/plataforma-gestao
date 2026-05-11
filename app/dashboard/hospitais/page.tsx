import { supabase } from '../../lib/supabase'

export default async function Hospitais() {
  const { data: hospitais } = await supabase
    .from('hospitais')
    .select('*')
    .order('nome', { ascending: true })

  return (
    <div className="p-4 md:p-6">

      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Hospitais</h2>
          <p className="text-sm text-gray-500">{hospitais?.length} hospitais cadastrados</p>
        </div>
        <a href="/dashboard/hospitais/novo"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition">
          + Novo Hospital
        </a>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {hospitais?.map((hospital) => (
          <div key={hospital.id} className="bg-white rounded-2xl shadow p-6 flex flex-col gap-3">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-bold text-gray-800 text-lg">{hospital.nome}</p>
                <p className="text-sm text-gray-500 mt-1">📍 {hospital.endereco || '—'}</p>
              </div>
              <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                hospital.ativo ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
              }`}>
                {hospital.ativo ? 'Ativo' : 'Inativo'}
              </span>
            </div>

            <div className="border-t pt-3 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Turno</span>
                <span className="font-medium text-gray-700">🕐 {hospital.turno || '—'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Contato</span>
                <span className="font-medium text-gray-700">📞 {hospital.contato || '—'}</span>
              </div>
              {hospital.observacoes && (
                <div className="text-sm text-gray-500 bg-gray-50 rounded-lg p-2 mt-2">
                  💬 {hospital.observacoes}
                </div>
              )}
            </div>

            <div className="flex gap-2 mt-2">
              <a href={`/dashboard/hospitais/${hospital.id}/editar`}
                className="flex-1 text-center text-sm text-blue-600 border border-blue-200 rounded-lg py-1.5 hover:bg-blue-50 transition">
                ✏️ Editar
              </a>
              <button className="flex-1 text-sm text-gray-600 border border-gray-200 rounded-lg py-1.5 hover:bg-gray-50 transition">
                📅 Ver Escalas
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}