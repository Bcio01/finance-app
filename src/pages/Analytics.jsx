import React from 'react';
import { useFinanceStore } from '../store/financeStore';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ComposedChart, Bar, Line } from 'recharts';
import { FiTrendingUp, FiTrendingDown, FiShield, FiAlertTriangle } from 'react-icons/fi';
import { useCurrency } from '../hooks/useCurrency';

const Analytics = () => {
  const { financialScore, balancePredictions, summary } = useFinanceStore();
  const { format } = useCurrency();

  const getScoreColor = (score) => {
    if (score >= 85) return 'text-income';
    if (score >= 70) return 'text-blue-500';
    if (score >= 50) return 'text-yellow-500';
    return 'text-expense';
  };

  const getScoreBg = (score) => {
    if (score >= 85) return 'bg-income';
    if (score >= 70) return 'bg-blue-500';
    if (score >= 50) return 'bg-yellow-500';
    return 'bg-expense';
  };

  // Mock data for heatmap / advanced charts based on summary to avoid complex calculations here
  const historyData = balancePredictions ? [
    { month: 'Actual', projectedBalance: summary.balance, projectedIncome: summary.avgMonthlyIncome, projectedExpense: summary.avgDailyExpense * 30 },
    ...balancePredictions
  ] : [];

  return (
    <div className="max-w-[1600px] mx-auto pb-12">
      <div className="flex items-center justify-between mb-10">
        <div>
          <h2 className="text-3xl font-black tracking-tighter">Centro de Analíticas Pro</h2>
          <p className="text-gray-500 font-medium mt-1">Inteligencia artificial y proyecciones financieras</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 mb-10">
        {/* Financial Score */}
        <div className="xl:col-span-1 bg-[#232323] border border-[#3a3a3a] rounded-3xl p-8 shadow-lg flex flex-col justify-center items-center text-center relative overflow-hidden">
          <div className={`absolute top-0 w-full h-2 ${getScoreBg(financialScore.score)} opacity-50`}></div>
          <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-6">Financial Score</h3>
          
          <div className="relative w-48 h-48 flex items-center justify-center mb-6">
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="96" cy="96" r="88" className="stroke-[#1e1e1e]" strokeWidth="12" fill="none" />
              <circle 
                cx="96" cy="96" r="88" 
                className={`stroke-current ${getScoreColor(financialScore.score)}`} 
                strokeWidth="12" fill="none" 
                strokeDasharray={`${2 * Math.PI * 88}`}
                strokeDashoffset={`${2 * Math.PI * 88 * (1 - financialScore.score / 100)}`}
                strokeLinecap="round"
                style={{ transition: 'stroke-dashoffset 1s ease-out' }}
              />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className={`text-6xl font-black tracking-tighter ${getScoreColor(financialScore.score)}`}>
                {financialScore.score}
              </span>
              <span className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-1">/ 100</span>
            </div>
          </div>
          
          <h4 className={`text-xl font-black uppercase tracking-widest ${getScoreColor(financialScore.score)} mb-2`}>
            {financialScore.level}
          </h4>
          <p className="text-sm text-gray-400 font-medium leading-relaxed px-4">
            Tu puntuación se basa en tu capacidad de ahorro, el cumplimiento de tus presupuestos y el progreso de tus metas.
          </p>
        </div>

        {/* Balance Projection Chart */}
        <div className="xl:col-span-2 bg-[#232323] border border-[#3a3a3a] rounded-3xl p-8 shadow-lg">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold tracking-tight">Proyección de Balance (6 Meses)</h3>
            <div className="flex space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Estimado</span>
              </div>
            </div>
          </div>
          
          <div className="h-[300px]">
            {historyData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={historyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333" strokeOpacity={0.5} />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#666', fontSize: 11, fontWeight: 700 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#666', fontSize: 11, fontWeight: 700 }} tickFormatter={v => format(v)} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1e1e1e', border: '1px solid #3a3a3a', borderRadius: '12px', padding: '12px' }}
                    itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                    labelStyle={{ color: '#999', marginBottom: '4px', fontWeight: 'bold' }}
                    formatter={(value) => format(value)}
                  />
                  <Area type="monotone" dataKey="projectedBalance" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorBalance)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500 font-medium italic">
                No hay suficientes datos históricos para proyectar.
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Risk Analysis */}
        <div className="bg-[#232323] border border-[#3a3a3a] rounded-3xl p-8 shadow-lg">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-3 bg-orange-500/10 text-orange-500 rounded-xl">
              <FiAlertTriangle size={24} />
            </div>
            <h3 className="text-xl font-bold tracking-tight">Riesgos Financieros</h3>
          </div>
          <div className="space-y-4">
            {financialScore.score > 80 ? (
              <div className="p-4 bg-income/5 border border-income/20 rounded-2xl flex items-start space-x-4">
                <FiShield className="text-income mt-1" size={20} />
                <div>
                  <h4 className="text-income font-bold text-sm">Bajo Riesgo</h4>
                  <p className="text-gray-400 text-xs mt-1">Tus finanzas son estables. Mantienes un buen margen de ahorro y no excedes tus presupuestos.</p>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-expense/5 border border-expense/20 rounded-2xl flex items-start space-x-4">
                <FiAlertTriangle className="text-expense mt-1" size={20} />
                <div>
                  <h4 className="text-expense font-bold text-sm">Alerta de Riesgo</h4>
                  <p className="text-gray-400 text-xs mt-1">Tus niveles de ahorro son bajos respecto a tus ingresos. Considera reducir gastos no esenciales.</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Income vs Expense Prediction */}
        <div className="bg-[#232323] border border-[#3a3a3a] rounded-3xl p-8 shadow-lg">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-3 bg-blue-500/10 text-blue-500 rounded-xl">
              <FiTrendingUp size={24} />
            </div>
            <h3 className="text-xl font-bold tracking-tight">Tendencia I/G (IA)</h3>
          </div>
          <div className="h-[200px]">
            {historyData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={historyData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333" strokeOpacity={0.5} />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#666', fontSize: 10 }} dy={5} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#666', fontSize: 10 }} tickFormatter={v => format(v)} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1e1e1e', borderColor: '#3a3a3a', borderRadius: '12px' }} 
                    formatter={(value) => format(value)}
                  />
                  <Bar dataKey="projectedIncome" fill="#10b981" radius={[4, 4, 0, 0]} barSize={8} />
                  <Bar dataKey="projectedExpense" fill="#f97316" radius={[4, 4, 0, 0]} barSize={8} />
                  <Line type="monotone" dataKey="projectedBalance" stroke="#3b82f6" strokeWidth={2} dot={false} />
                </ComposedChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500 text-sm">Sin datos suficientes</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;