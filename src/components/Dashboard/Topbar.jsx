import React, { useState } from 'react';
import { FiPlus, FiCalendar, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import TransactionModal from './TransactionModal';
import { useFinanceStore } from '../../store/financeStore';

const Topbar = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { currentMonth, currentYear, transactions, budgets, goals, setDate } = useFinanceStore();
  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];
  const currentDate = new Date();
  const selectedMonthIndex = currentYear * 12 + currentMonth;
  const dataMonthIndexes = [
    ...transactions.map((transaction) => {
      const date = new Date(transaction.createdAt);
      return date.getFullYear() * 12 + date.getMonth() + 1;
    }),
    ...budgets.map((budget) => budget.year * 12 + budget.month),
    ...goals.map((goal) => {
      const date = new Date(goal.createdAt || currentDate);
      return date.getFullYear() * 12 + date.getMonth() + 1;
    }),
  ].filter(Number.isFinite);
  const earliestMonthIndex = dataMonthIndexes.length
    ? Math.min(...dataMonthIndexes)
    : currentDate.getFullYear() * 12 + currentDate.getMonth() + 1;
  const canMoveBack = selectedMonthIndex > earliestMonthIndex;

  const moveMonth = (offset) => {
    if (offset < 0 && !canMoveBack) return;

    const nextDate = new Date(currentYear, currentMonth - 1 + offset, 1);
    setDate(nextDate.getMonth() + 1, nextDate.getFullYear());
  };

  return (
    <div className="flex items-center justify-between mb-10">
      <h2 className="text-3xl font-black tracking-tighter">Resumen mensual</h2>
      
      <div className="flex items-center space-x-6">
        <div className="flex items-center space-x-2 bg-[#1e1e1e] border border-[#3a3a3a] rounded-2xl px-5 py-2.5 text-gray-300 shadow-lg">
          <FiCalendar className="text-blue-500" size={18} />
          <div className="flex items-center space-x-4">
            <button
              type="button"
              onClick={() => moveMonth(-1)}
              disabled={!canMoveBack}
              className={`transition-colors p-1 ${canMoveBack ? 'hover:text-white' : 'cursor-not-allowed text-gray-600 opacity-40'}`}
              aria-label="Mes anterior"
            >
              <FiChevronLeft />
            </button>
            <span className="text-sm font-bold tracking-tight w-32 text-center">
              {monthNames[currentMonth - 1]} {currentYear}
            </span>
            <button
              type="button"
              onClick={() => moveMonth(1)}
              className="hover:text-white transition-colors p-1"
              aria-label="Mes siguiente"
            >
              <FiChevronRight />
            </button>
          </div>
        </div>

        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center space-x-2 bg-white text-black font-black text-sm uppercase tracking-tighter px-6 py-3 rounded-2xl hover:bg-gray-200 transition-all shadow-xl shadow-white/5 active:scale-95"
        >
          <FiPlus size={20} />
          <span>Agregar</span>
        </button>
      </div>

      <TransactionModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
};

export default Topbar;
