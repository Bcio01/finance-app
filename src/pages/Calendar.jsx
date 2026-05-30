import React, { useState, useMemo } from 'react';
import { useFinanceStore } from '../store/financeStore';
import { FiChevronLeft, FiChevronRight, FiCalendar } from 'react-icons/fi';
import { useCurrency } from '../hooks/useCurrency';
import { addMoney } from '../utils/money';

const Calendar = () => {
  const { transactions } = useFinanceStore();
  const { format } = useCurrency();
  const [currentDate, setCurrentDate] = useState(new Date());

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

  // Group transactions by day
  const txByDay = useMemo(() => {
    const map = {};
    transactions.forEach(t => {
      const d = new Date(t.createdAt);
      if (d.getMonth() === currentDate.getMonth() && d.getFullYear() === currentDate.getFullYear()) {
        const day = d.getDate();
        if (!map[day]) map[day] = [];
        map[day].push(t);
      }
    });
    return map;
  }, [transactions, currentDate]);

  const renderCells = () => {
    const cells = [];
    // Padding days
    for (let i = 0; i < (firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1); i++) {
      cells.push(<div key={`pad-${i}`} className="bg-[#1e1e1e]/50 border border-[#3a3a3a]/50 p-2 min-h-[120px] rounded-xl opacity-50"></div>);
    }
    
    // Actual days
    for (let day = 1; day <= daysInMonth; day++) {
      const dayTxs = txByDay[day] || [];
      const isToday = new Date().getDate() === day && new Date().getMonth() === currentDate.getMonth() && new Date().getFullYear() === currentDate.getFullYear();
      
      const dayIncome = dayTxs
        .filter(t => t.type === 'INCOME')
        .reduce((total, tx) => addMoney(total, tx.amount), 0);
      const dayExpense = dayTxs
        .filter(t => t.type === 'EXPENSE')
        .reduce((total, tx) => addMoney(total, Math.abs(tx.amount)), 0);

      cells.push(
        <div key={day} className={`bg-[#232323] border ${isToday ? 'border-blue-500 shadow-[0_0_15px_rgba(37,99,235,0.2)]' : 'border-[#3a3a3a]'} p-3 min-h-[120px] rounded-xl flex flex-col hover:border-gray-500 transition-colors`}>
          <div className="flex justify-between items-start mb-2">
            <span className={`text-sm font-black ${isToday ? 'text-blue-500' : 'text-gray-400'}`}>{day}</span>
            {dayTxs.length > 0 && <span className="text-[10px] font-bold text-gray-500 bg-white/5 px-2 py-0.5 rounded-md">{dayTxs.length} tx</span>}
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar space-y-1 pr-1">
            {dayTxs.slice(0, 3).map(t => (
              <div key={t.id} className="text-[10px] truncate font-bold flex justify-between">
                <span className="text-gray-400 truncate pr-1">{t.description || t.category?.name}</span>
                <span className={t.type === 'INCOME' ? 'text-income' : 'text-white'}>
                  {t.type === 'INCOME' ? '+' : ''}{format(Math.abs(t.amount))}
                </span>
              </div>
            ))}
            {dayTxs.length > 3 && (
              <div className="text-[10px] text-gray-500 font-bold text-center mt-1">+{dayTxs.length - 3} más</div>
            )}
          </div>
          {(dayIncome > 0 || dayExpense > 0) && (
             <div className="mt-2 pt-2 border-t border-[#3a3a3a] flex justify-between text-[10px] font-black">
                <span className="text-income">{dayIncome > 0 ? `+${format(dayIncome)}` : ''}</span>
                <span className="text-expense">{dayExpense > 0 ? `-${format(dayExpense)}` : ''}</span>
             </div>
          )}
        </div>
      );
    }
    return cells;
  };

  const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

  return (
    <div className="max-w-[1600px] mx-auto pb-12">
      <div className="flex items-center justify-between mb-10">
        <div>
          <h2 className="text-3xl font-black tracking-tighter">Calendario Financiero</h2>
          <p className="text-gray-500 font-medium mt-1">Visualiza tus transacciones día a día</p>
        </div>
        
        <div className="flex items-center space-x-2 bg-[#1e1e1e] border border-[#3a3a3a] rounded-2xl px-5 py-2.5 text-gray-300 shadow-lg">
          <FiCalendar className="text-blue-500" size={18} />
          <div className="flex items-center space-x-4">
            <button onClick={prevMonth} className="hover:text-white transition-colors p-1"><FiChevronLeft /></button>
            <span className="text-sm font-bold tracking-tight w-32 text-center uppercase tracking-widest">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </span>
            <button onClick={nextMonth} className="hover:text-white transition-colors p-1"><FiChevronRight /></button>
          </div>
        </div>
      </div>

      <div className="bg-[#1e1e1e] border border-[#3a3a3a] rounded-3xl p-6 shadow-2xl">
        <div className="grid grid-cols-7 gap-4 mb-4 text-center">
          {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map(day => (
            <div key={day} className="text-xs font-black text-gray-500 uppercase tracking-widest">{day}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-4">
          {renderCells()}
        </div>
      </div>
    </div>
  );
};

export default Calendar;
