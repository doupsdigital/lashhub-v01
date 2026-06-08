export default function Dashboard() {
  return (
    <div className="p-6 bg-surface border rounded-[14px]">
      <h2 className="text-3xl font-title font-semibold text-text-primary mb-2">Dashboard</h2>
      <p className="text-text-secondary">Visão geral com KPIs e gráficos do negócio (Em Breve).</p>
      
      {/* Exemplo de card KPI estático para validar o design */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        <div className="bg-surface border rounded-[14px] p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-text-secondary mb-2">
            <span className="text-xs font-semibold tracking-wider uppercase">Clientes Cadastrados</span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 flex items-center justify-center text-rose-600">
              👤
            </div>
          </div>
          <span className="text-3xl font-title text-text-primary">128</span>
          <div className="mt-2 flex items-center">
            <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full font-medium">+12% este mês</span>
          </div>
        </div>

        <div className="bg-surface border rounded-[14px] p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-text-secondary mb-2">
            <span className="text-xs font-semibold tracking-wider uppercase">Agendamentos</span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 flex items-center justify-center text-rose-600">
              📅
            </div>
          </div>
          <span className="text-3xl font-title text-text-primary">42</span>
          <div className="mt-2 flex items-center">
            <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full font-medium">+5% esta semana</span>
          </div>
        </div>

        <div className="bg-surface border rounded-[14px] p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-text-secondary mb-2">
            <span className="text-xs font-semibold tracking-wider uppercase">Receita Estimada</span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 flex items-center justify-center text-rose-600">
              💰
            </div>
          </div>
          <span className="text-3xl font-title text-text-primary">R$ 5.420,00</span>
          <div className="mt-2 flex items-center">
            <span className="text-xs bg-red-100 text-red-800 px-2 py-0.5 rounded-full font-medium">-2% vs. anterior</span>
          </div>
        </div>
      </div>
    </div>
  );
}
