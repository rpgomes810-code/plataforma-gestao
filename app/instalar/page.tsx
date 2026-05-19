export default function Instalar() {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-2xl">

        <div className="text-center mb-8">
          <div className="w-20 h-20 rounded-2xl bg-blue-600 flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-2xl">D</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-800">DARPE CCB</h1>
          <p className="text-sm text-gray-500 mt-1">Setor 4 — Hospitais</p>
        </div>

        {/* Android */}
        <div className="bg-white rounded-2xl shadow p-6 mb-6">
          <h3 className="text-base font-bold text-gray-800 mb-4">🤖 Android (Chrome)</h3>
          <ol className="space-y-4">
            {[
              'Abra o site no navegador Chrome',
              'Toque nos 3 pontinhos (⋮) no canto superior direito',
              'Toque em "Adicionar à tela inicial"',
              'Confirme tocando em "Adicionar"',
              'O ícone do DARPE CCB aparecerá na sua tela inicial',
            ].map((passo, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="w-7 h-7 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center shrink-0">{i + 1}</span>
                <p className="text-sm text-gray-700 mt-1">{passo}</p>
              </li>
            ))}
          </ol>
        </div>

        {/* iPhone */}
        <div className="bg-white rounded-2xl shadow p-6 mb-6">
          <h3 className="text-base font-bold text-gray-800 mb-4">🍎 iPhone (Safari)</h3>
          <ol className="space-y-4">
            {[
              'Abra o site no navegador Safari',
              'Toque no ícone de compartilhar (□↑) na barra inferior',
              'Role a lista e toque em "Adicionar à Tela de Início"',
              'Confirme tocando em "Adicionar"',
              'O ícone do DARPE CCB aparecerá na sua tela inicial',
            ].map((passo, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="w-7 h-7 rounded-full bg-gray-800 text-white text-xs font-bold flex items-center justify-center shrink-0">{i + 1}</span>
                <p className="text-sm text-gray-700 mt-1">{passo}</p>
              </li>
            ))}
          </ol>
        </div>

        <div className="bg-blue-50 rounded-2xl p-4 text-sm text-blue-700 mb-6">
          💡 Após instalar, acesse o app e ative as notificações na página de Confirmações.
        </div>

        <div className="text-center">
          <a href="/" className="text-sm text-blue-600 hover:underline">← Voltar para o login</a>
        </div>

      </div>
    </div>
  )
}