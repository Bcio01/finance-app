import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { useFinanceStore } from '../../store/financeStore';
import { useCurrency } from '../../hooks/useCurrency';
import { addMoney } from '../../utils/money';

const CategoryChart = () => {
  const { transactions, currentMonth, currentYear } = useFinanceStore();
  const { format } = useCurrency();

  const processData = () => {
    const expenseTransactions = transactions.filter((transaction) => {
      const date = new Date(transaction.createdAt);
      return transaction.type === 'EXPENSE'
        && date.getMonth() + 1 === currentMonth
        && date.getFullYear() === currentYear;
    });
    const totalExpense = expenseTransactions.reduce((acc, t) => addMoney(acc, t.amount), 0);
    
    if (totalExpense === 0) return [];

    const categoryMap = {};
    expenseTransactions.forEach(t => {
      const name = t.category?.name || 'Sin categoría';
      const color = t.category?.color || '#666';
      if (!categoryMap[name]) {
        categoryMap[name] = { name, value: 0, color };
      }
      categoryMap[name].value = addMoney(categoryMap[name].value, t.amount);
    });

    return Object.values(categoryMap).map(item => ({
      ...item,
      percentage: Math.round((item.value / totalExpense) * 100)
    })).sort((a, b) => b.value - a.value);
  };

  const data = processData();

  return (
    <div className="bg-[#232323] border border-[#3a3a3a] rounded-3xl p-8 h-[400px] shadow-lg">
      <h3 className="text-xl font-bold tracking-tight mb-8">Gastos por categoría</h3>
      
      {data.length === 0 ? (
        <div className="h-[250px] flex items-center justify-center text-gray-500 font-medium italic">
          Sin datos de gastos
        </div>
      ) : (
        <>
          <div className="flex flex-wrap gap-x-6 gap-y-3 mb-8 overflow-y-auto max-h-[60px] custom-scrollbar pr-2">
            {data.map((item) => (
              <div key={item.name} className="flex items-center space-x-2">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}></div>
                <span className="text-xs text-gray-500 font-bold uppercase tracking-wider">{item.name} {item.percentage}%</span>
              </div>
            ))}
          </div>

          <ResponsiveContainer width="100%" height="60%">
            <PieChart>
              <Tooltip 
                contentStyle={{ backgroundColor: '#1e1e1e', border: '1px solid #3a3a3a', borderRadius: '12px', padding: '12px' }}
                itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
              />
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={8}
                dataKey="value"
                stroke="none"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </>
      )}
    </div>
  );
};

export default CategoryChart;
