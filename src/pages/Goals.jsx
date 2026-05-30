import React, { useState, useEffect } from 'react';
import { useFinanceStore } from '../store/financeStore';
import { FiTarget, FiPlus, FiClock, FiAlertCircle, FiCheckCircle, FiTrash2 } from 'react-icons/fi';
import { useCurrency } from '../hooks/useCurrency';
import { roundMoney, subtractMoney } from '../utils/money';

const Goals = () => {
  const { goals, createGoal, fetchGoals, deleteGoal } = useFinanceStore();
  const { format, currency, amountPlaceholder } = useCurrency();
  const [title, setTitle] = useState('');
  const [target, setTarget] = useState('');
  const [deadline, setDeadline] = useState('');
  const [priority, setPriority] = useState('medium');

  useEffect(() => {
    fetchGoals();
  }, []);

  const handleCreate = async () => {
    if (!title || !target) return;
    await createGoal({
      title,
      target: parseFloat(target),
      deadline: deadline || null,
      priority,
    });
    setTitle('');
    setTarget('');
    setDeadline('');
  };

  return (
    <div className="max-w-[1600px] mx-auto pb-12">
      <div className="flex items-center justify-between mb-10">
        <div>
          <h2 className="text-3xl font-black tracking-tighter">Metas Inteligentes</h2>
          <p className="text-gray-500 font-medium mt-1">Proyecciones automáticas basadas en tu ahorro mensual</p>
        </div>
      </div>

      {/* Creation Form */}
      <div className="bg-[#232323] border border-[#3a3a3a] rounded-3xl p-8 shadow-lg mb-10">
        <h3 className="text-xl font-bold tracking-tight mb-6">Nueva Meta Financiera</h3>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
          <div className="md:col-span-1 space-y-2">
            <label className="text-xs font-black text-gray-500 uppercase tracking-widest">Nombre</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ej. PC Gamer" className="w-full bg-[#1e1e1e] border border-[#3a3a3a] rounded-xl py-3 px-4 text-white font-bold focus:outline-none focus:border-blue-500 transition-colors" />
          </div>
          <div className="md:col-span-1 space-y-2">
            <label className="text-xs font-black text-gray-500 uppercase tracking-widest">Monto Objetivo ({currency})</label>
            <input
              type="text"
              inputMode="decimal"
              value={target}
              onChange={(e) => {
                const val = e.target.value.replace(/[^0-9.]/g, '');
                if (val.split('.').length <= 2) setTarget(val);
              }}
              placeholder={amountPlaceholder}
              className="w-full bg-[#1e1e1e] border border-[#3a3a3a] rounded-xl py-3 px-4 text-white font-bold focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>
          <div className="md:col-span-1 space-y-2">
            <label className="text-xs font-black text-gray-500 uppercase tracking-widest">Fecha Límite</label>
            <input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} className="w-full bg-[#1e1e1e] border border-[#3a3a3a] rounded-xl py-3 px-4 text-white font-bold focus:outline-none focus:border-blue-500 transition-colors [color-scheme:dark]" />
          </div>
          <div className="md:col-span-1 space-y-2">
            <label className="text-xs font-black text-gray-500 uppercase tracking-widest">Prioridad</label>
            <select value={priority} onChange={(e) => setPriority(e.target.value)} className="w-full bg-[#1e1e1e] border border-[#3a3a3a] rounded-xl py-3 px-4 text-white font-bold focus:outline-none focus:border-blue-500 transition-colors">
              <option value="low">Baja</option>
              <option value="medium">Media</option>
              <option value="high">Alta</option>
            </select>
          </div>
          <div className="md:col-span-1">
            <button onClick={handleCreate} className="w-full flex items-center justify-center space-x-2 bg-blue-600 text-white font-black text-sm uppercase tracking-tighter px-8 py-3.5 rounded-xl hover:bg-blue-500 transition-all shadow-xl shadow-blue-600/20 active:scale-95">
              <FiPlus size={20} />
              <span>Agregar</span>
            </button>
          </div>
        </div>
      </div>

      {/* Goals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {goals.map((goal) => {
          const percentage = goal.target > 0 ? Math.min(100, Math.round((goal.current / goal.target) * 100)) : 0;
          const remaining = subtractMoney(goal.target, goal.current);
          
          return (
            <div key={goal.id} className="bg-[#232323] border border-[#3a3a3a] rounded-3xl p-8 shadow-lg flex flex-col justify-between group">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <div className="flex items-center space-x-3 mb-2">
                    <div className={`p-2 rounded-xl ${
                      goal.priority === 'high' ? 'bg-orange-500/10 text-orange-500' :
                      goal.priority === 'medium' ? 'bg-blue-500/10 text-blue-500' :
                      'bg-gray-500/10 text-gray-500'
                    }`}>
                      <FiTarget size={20} />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 border border-[#3a3a3a] px-2 py-1 rounded-md">
                      {goal.priority === 'high' ? 'Alta' : goal.priority === 'medium' ? 'Media' : 'Baja'}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold tracking-tight">{goal.title}</h3>
                </div>
                <button onClick={() => deleteGoal(goal.id)} className="text-gray-600 hover:text-expense transition-colors opacity-0 group-hover:opacity-100">
                  <FiTrash2 size={18} />
                </button>
              </div>

              <div className="space-y-6">
                <div className="flex items-end justify-between">
                  <div>
                    <span className="text-3xl font-black tracking-tight">{format(goal.current)}</span>
                    <span className="text-gray-500 text-sm font-medium ml-2">de {format(goal.target)}</span>
                  </div>
                  <span className="text-lg font-black text-blue-500">{percentage}%</span>
                </div>

                <div className="w-full h-3 bg-[#1e1e1e] rounded-full overflow-hidden border border-[#3a3a3a] p-0.5">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-600 to-blue-400 rounded-full transition-all duration-1000 shadow-[0_0_15px_rgba(37,99,235,0.4)]"
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>

                {/* AI Projection Message */}
                <div className={`flex items-start space-x-3 p-4 rounded-2xl border ${
                  goal.status === 'completed' ? 'bg-income/5 border-income/20 text-income' :
                  goal.status === 'at_risk' ? 'bg-orange-500/5 border-orange-500/20 text-orange-400' :
                  'bg-[#1e1e1e] border-[#3a3a3a] text-gray-400'
                }`}>
                  <div className="mt-0.5">
                    {goal.status === 'completed' ? <FiCheckCircle size={16} /> :
                     goal.status === 'at_risk' ? <FiAlertCircle size={16} /> :
                     <FiClock size={16} />}
                  </div>
                  <p className="text-xs font-bold leading-relaxed">
                    {goal.estimationMessage || "Calculando proyección..."}
                  </p>
                </div>
                
                {remaining > 0 && (
                  <p className="text-center text-xs font-bold text-gray-500 uppercase tracking-widest">
                    Faltan {format(roundMoney(remaining))}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Goals;
