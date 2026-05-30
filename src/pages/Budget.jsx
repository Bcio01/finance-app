import React, { useState, useEffect } from 'react';
import { useFinanceStore } from '../store/financeStore';
import { FiPlus, FiAlertCircle } from 'react-icons/fi';
import { useCurrency } from '../hooks/useCurrency';
import { addMoney, roundMoney, subtractMoney } from '../utils/money';

const Budget = () => {
  const { categories, budgets, transactions, upsertBudget, currentMonth, currentYear } = useFinanceStore();
  const { format, currency, amountPlaceholder } = useCurrency();
  const [selectedCat, setSelectedCat] = useState('');
  const [amount, setAmount] = useState('');

  const handleSaveBudget = async () => {
    if (!selectedCat || !amount) return;
    await upsertBudget({
      categoryId: parseInt(selectedCat),
      amount: parseFloat(amount),
      month: currentMonth,
      year: currentYear
    });
    setAmount('');
    setSelectedCat('');
  };

  // Calculate used amounts per category for the current month
  const expensesThisMonth = transactions.filter(t => 
    t.type === 'EXPENSE' && 
    new Date(t.createdAt).getMonth() + 1 === currentMonth &&
    new Date(t.createdAt).getFullYear() === currentYear
  );

  const categoryExpenses = {};
  expensesThisMonth.forEach(t => {
    const catId = t.categoryId;
    categoryExpenses[catId] = addMoney(categoryExpenses[catId] || 0, Math.abs(t.amount));
  });

  return (
    <div className="max-w-[1200px] mx-auto pb-12">
      <div className="flex items-center justify-between mb-10">
        <div>
          <h2 className="text-3xl font-black tracking-tighter">Presupuestos</h2>
          <p className="text-gray-500 font-medium mt-1">Control de límites por categoría</p>
        </div>
      </div>

      <div className="bg-[#232323] border border-[#3a3a3a] rounded-3xl p-8 shadow-lg mb-10">
        <h3 className="text-xl font-bold tracking-tight mb-6">Definir Nuevo Límite</h3>
        <div className="flex items-end gap-4">
          <div className="flex-1 space-y-2">
            <label className="text-xs font-black text-gray-500 uppercase tracking-widest">Categoría</label>
            <select
              value={selectedCat}
              onChange={(e) => setSelectedCat(e.target.value)}
              className="w-full bg-[#1e1e1e] border border-[#3a3a3a] rounded-xl py-3 px-4 text-white font-bold focus:outline-none focus:border-blue-500 transition-colors"
            >
              <option value="">Seleccionar...</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
          <div className="flex-1 space-y-2">
            <label className="text-xs font-black text-gray-500 uppercase tracking-widest">Límite Mensual ({currency})</label>
            <input
              type="text"
              value={amount}
              onChange={(e) => {
                const val = e.target.value.replace(/[^0-9.]/g, '');
                if (val.split('.').length <= 2) setAmount(val);
              }}
              placeholder={amountPlaceholder}
              className="w-full bg-[#1e1e1e] border border-[#3a3a3a] rounded-xl py-3 px-4 text-white font-bold focus:outline-none focus:border-blue-500 transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
          </div>
          <button 
            onClick={handleSaveBudget}
            className="flex items-center space-x-2 bg-blue-600 text-white font-black text-sm uppercase tracking-tighter px-8 py-3 rounded-xl hover:bg-blue-500 transition-all shadow-xl shadow-blue-600/20 active:scale-95 mb-0.5"
          >
            <FiPlus size={20} />
            <span>Guardar</span>
          </button>
        </div>
      </div>

      <div className="space-y-6">
        <h3 className="text-xl font-bold tracking-tight mb-4">Progreso Mensual</h3>
        
        {budgets.length === 0 && (
          <p className="text-center text-gray-500 py-10 font-medium italic">No hay presupuestos definidos para este mes.</p>
        )}

        {budgets.map(b => {
          const used = categoryExpenses[b.categoryId] || 0;
          const remaining = subtractMoney(b.amount, used);
          const percentage = b.amount > 0 ? Math.round((used / b.amount) * 100) : 0;
          const isWarning = percentage >= 80 && percentage <= 100;
          const isDanger = percentage > 100;
          
          return (
            <div key={b.id} className="bg-[#232323] border border-[#3a3a3a] rounded-3xl p-6 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: b.category?.color || '#3b82f6' }}></div>
                  <h4 className="font-bold text-lg">{b.category?.name}</h4>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-black tracking-tight">{format(used)}</p>
                  <p className="text-gray-500 text-sm font-medium">de {format(b.amount)}</p>
                </div>
              </div>

              <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden border border-white/5 p-0.5 mb-2">
                <div 
                  className={`h-full transition-all duration-700 rounded-full ${
                    isDanger ? 'bg-expense shadow-[0_0_10px_rgba(249,115,22,0.4)]' : 
                    isWarning ? 'bg-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.4)]' : 
                    'bg-income shadow-[0_0_10px_rgba(16,185,129,0.4)]'
                  }`}
                  style={{ width: `${Math.min(percentage, 100)}%` }}
                ></div>
              </div>
              
              <div className="flex justify-between items-center text-xs font-bold uppercase tracking-wider">
                <span className={isDanger ? 'text-expense' : 'text-gray-500'}>
                  {percentage}% utilizado
                </span>
                <span className={isDanger ? 'text-expense' : 'text-gray-500'}>
                  {remaining >= 0 ? `Restante: ${format(remaining)}` : `Excedido: ${format(roundMoney(Math.abs(remaining)))}`}
                </span>
              </div>
              
              {isDanger && (
                <div className="mt-4 flex items-center space-x-2 text-expense text-sm font-bold bg-expense/10 px-4 py-2 rounded-lg border border-expense/20">
                  <FiAlertCircle size={16} />
                  <span>Has superado el límite presupuestado para esta categoría.</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Budget;
