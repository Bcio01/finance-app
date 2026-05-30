import React from 'react';
import { FiArrowUpRight, FiArrowDownLeft } from 'react-icons/fi';
import { useFinanceStore } from '../../store/financeStore';
import { useCurrency } from '../../hooks/useCurrency';

const RecentTransactions = () => {
  const { transactions, currentMonth, currentYear } = useFinanceStore();
  const { format } = useCurrency();
  const recent = transactions
    .filter((transaction) => {
      const date = new Date(transaction.createdAt);
      return date.getMonth() + 1 === currentMonth && date.getFullYear() === currentYear;
    })
    .slice(0, 5);

  return (
    <div className="bg-[#232323] border border-[#3a3a3a] rounded-3xl p-8 shadow-lg">
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-xl font-bold tracking-tight">Últimas transacciones</h3>
        <button className="text-sm text-blue-500 font-bold hover:text-blue-400 transition-colors bg-blue-500/10 px-4 py-1.5 rounded-full">Ver todas</button>
      </div>

      <div className="space-y-3">
        {recent.length === 0 && (
          <p className="text-center text-gray-500 py-10 font-medium italic">No hay transacciones registradas.</p>
        )}
        {recent.map((t) => (
          <div key={t.id} className="flex items-center justify-between p-4 rounded-2xl hover:bg-white/5 transition-all cursor-pointer border border-transparent hover:border-white/5 group">
            <div className="flex items-center space-x-5">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                t.type === 'INCOME' ? 'bg-income/10 text-income' : 'bg-expense/10 text-expense'
              }`}>
                {t.type === 'INCOME' ? <FiArrowDownLeft size={20} /> : <FiArrowUpRight size={20} />}
              </div>
              <div>
                <p className="font-bold text-[15px] group-hover:text-blue-400 transition-colors tracking-tight">
                  {t.description || t.category?.name || 'Transacción'}
                </p>
                <p className="text-xs text-gray-500 font-medium mt-0.5">
                  {t.category?.name} • {new Date(t.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className={`font-bold text-lg ${
                t.type === 'INCOME' ? 'text-income' : 'text-white'
              }`}>
                {t.type === 'INCOME' ? '+' : ''}{format(Math.abs(t.amount))}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentTransactions;
