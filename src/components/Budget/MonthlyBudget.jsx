import React from 'react';
import { FiEdit2 } from 'react-icons/fi';
import { useFinanceStore } from '../../store/financeStore';
import { Link } from 'react-router-dom';
import { useCurrency } from '../../hooks/useCurrency';
import { addMoney } from '../../utils/money';

const MonthlyBudget = () => {
  const { budgets, transactions, currentMonth, currentYear } = useFinanceStore();
  const { format } = useCurrency();

  const expensesThisMonth = transactions.filter(t => 
    t.type === 'EXPENSE' && 
    new Date(t.createdAt).getMonth() + 1 === currentMonth &&
    new Date(t.createdAt).getFullYear() === currentYear
  );

  const totalBudgeted = budgets.reduce((acc, b) => addMoney(acc, b.amount), 0);
  
  // Only count expenses for categories that have a budget
  let usedInBudgets = 0;
  expensesThisMonth.forEach(t => {
    if (budgets.find(b => b.categoryId === t.categoryId)) {
      usedInBudgets = addMoney(usedInBudgets, Math.abs(t.amount));
    }
  });

  const percentage = totalBudgeted > 0 ? Math.round((usedInBudgets / totalBudgeted) * 100) : 0;
  
  return (
    <div className="bg-[#232323] border border-[#3a3a3a] rounded-3xl p-8 shadow-lg flex flex-col justify-between h-full">
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-xl font-bold tracking-tight">Presupuesto mensual</h3>
        <Link to="/budget" className="flex items-center space-x-2 text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:text-white transition-colors bg-white/5 px-4 py-2 rounded-xl border border-white/5">
          <FiEdit2 size={12} />
          <span>Editar</span>
        </Link>
      </div>

      {totalBudgeted === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center">
          <p className="text-gray-500 font-medium mb-4">No has definido presupuestos para este mes.</p>
          <Link to="/budget" className="text-sm font-bold text-blue-500 hover:underline">Configurar ahora</Link>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex items-end justify-between">
            <div>
              <span className="text-4xl font-bold tracking-tight">{format(usedInBudgets)}</span>
              <span className="text-gray-500 text-sm font-medium ml-2">de {format(totalBudgeted)}</span>
            </div>
            <div className={`text-sm font-bold px-2 py-1 rounded-lg bg-white/5 ${percentage > 90 ? 'text-expense' : 'text-blue-500'}`}>
              {percentage}%
            </div>
          </div>

          <div className="w-full h-4 bg-white/5 rounded-full overflow-hidden border border-white/5 p-0.5">
            <div 
              className={`h-full transition-all duration-700 rounded-full shadow-[0_0_15px_rgba(37,99,235,0.3)] ${
                percentage > 90 ? 'bg-expense' : 'bg-blue-600'
              }`}
              style={{ width: `${Math.min(percentage, 100)}%` }}
            ></div>
          </div>

          <p className="text-xs text-gray-500 leading-relaxed font-medium">
            Has utilizado el {percentage}% de tu presupuesto mensual. 
            {percentage < 80 ? ' Vas por buen camino para ahorrar este mes.' : ' Ten cuidado, te acercas al límite de tu presupuesto.'}
          </p>
        </div>
      )}
    </div>
  );
};

export default MonthlyBudget;
