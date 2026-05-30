import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useFinanceStore } from '../../store/financeStore';
import { useCurrency } from '../../hooks/useCurrency';
import { addMoney } from '../../utils/money';

const TransactionChart = () => {
  const { transactions, currentMonth, currentYear } = useFinanceStore();
  const { format } = useCurrency();

  // Process data for the last 6 months
  const processData = () => {
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const dataMap = {};

    // Get current and last 5 months
    for (let i = 5; i >= 0; i--) {
      const d = new Date(currentYear, currentMonth - 1 - i, 1);
      const key = `${months[d.getMonth()]} ${d.getFullYear().toString().slice(-2)}`;
      dataMap[key] = { name: months[d.getMonth()], ingresos: 0, gastos: 0, fullKey: key };
    }

    transactions.forEach(t => {
      const date = new Date(t.createdAt);
      const key = `${months[date.getMonth()]} ${date.getFullYear().toString().slice(-2)}`;
      if (dataMap[key]) {
        if (t.type === 'INCOME') dataMap[key].ingresos = addMoney(dataMap[key].ingresos, t.amount);
        else dataMap[key].gastos = addMoney(dataMap[key].gastos, t.amount);
      }
    });

    return Object.values(dataMap);
  };

  const data = processData();

  return (
    <div className="bg-[#232323] border border-[#3a3a3a] rounded-3xl p-8 h-[400px] shadow-lg">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-xl font-bold tracking-tight">Ingresos vs. Gastos</h3>
          <div className="flex items-center space-x-6 mt-3">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-600 rounded-full shadow-[0_0_8px_rgba(37,99,235,0.4)]"></div>
              <span className="text-xs text-gray-500 font-bold uppercase tracking-wider">Ingresos</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-orange-500 rounded-full shadow-[0_0_8px_rgba(249,115,22,0.4)]"></div>
              <span className="text-xs text-gray-500 font-bold uppercase tracking-wider">Gastos</span>
            </div>
          </div>
        </div>
        <span className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em] bg-white/5 px-4 py-1.5 rounded-full border border-white/5">Visualización Real</span>
      </div>

      <ResponsiveContainer width="100%" height="80%">
        <BarChart data={data} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333" strokeOpacity={0.5} />
          <XAxis 
            dataKey="name" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#666', fontSize: 11, fontWeight: 700 }} 
            dy={10}
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#666', fontSize: 11, fontWeight: 700 }} 
            tickFormatter={(value) => format(value)}
          />
          <Tooltip 
            cursor={{ fill: 'rgba(255,255,255,0.03)' }}
            contentStyle={{ backgroundColor: '#1e1e1e', border: '1px solid #3a3a3a', borderRadius: '12px', padding: '12px' }}
            itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
            labelStyle={{ color: '#999', marginBottom: '4px', fontWeight: 'bold' }}
            formatter={(value) => format(value)}
          />
          <Bar dataKey="ingresos" fill="#2563eb" radius={[4, 4, 0, 0]} barSize={12} />
          <Bar dataKey="gastos" fill="#f97316" radius={[4, 4, 0, 0]} barSize={12} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default TransactionChart;
