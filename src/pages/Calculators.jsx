import React, { useState } from 'react';
import { FiPieChart, FiDollarSign, FiClock, FiTarget } from 'react-icons/fi';
import { useFinanceStore } from '../store/financeStore';
import { useCurrency } from '../hooks/useCurrency';
import { roundMoney } from '../utils/money';

const Calculators = () => {
  const [targetAmount, setTargetAmount] = useState('');
  const [monthlySaving, setMonthlySaving] = useState('');
  const [interestRate, setInterestRate] = useState('');
  const { summary } = useFinanceStore();
  const { format, amountPlaceholder } = useCurrency();

  const calculateMonths = () => {
    if (!targetAmount || !monthlySaving) return null;
    const target = parseFloat(targetAmount);
    const saving = parseFloat(monthlySaving);
    const rate = parseFloat(interestRate) / 100 / 12 || 0;

    if (saving <= 0) return Infinity;

    if (rate > 0) {
      const months = Math.log((target * rate) / saving + 1) / Math.log(1 + rate);
      return Math.ceil(months);
    }
    return Math.ceil(target / saving);
  };

  const months = calculateMonths();
  const needsTarget = roundMoney(summary.income * 0.5);
  const wantsTarget = roundMoney(summary.income * 0.3);
  const savingsTarget = roundMoney(summary.income * 0.2);
  const actualSavings = roundMoney(summary.savings);
  const actualExpense = roundMoney(summary.expense);
  const needsApprox = roundMoney(Math.min(actualExpense, needsTarget));
  const wantsApprox = roundMoney(Math.max(0, actualExpense - needsApprox));

  const ruleRows = [
    { label: 'Necesidades (50%)', detail: 'Límite sugerido', target: needsTarget, actual: needsApprox, color: 'bg-blue-500' },
    { label: 'Deseos (30%)', detail: 'Gasto restante estimado', target: wantsTarget, actual: wantsApprox, color: 'bg-orange-500' },
    { label: 'Ahorro (20%)', detail: 'Ahorro real registrado', target: savingsTarget, actual: actualSavings, color: 'bg-income' },
  ];

  return (
    <div className="max-w-[1600px] mx-auto pb-12">
      <div className="flex items-center justify-between mb-10">
        <div>
          <h2 className="text-3xl font-black tracking-tighter">Calculadoras Financieras</h2>
          <p className="text-gray-500 font-medium mt-1">Simula escenarios y planifica tu futuro</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-[#232323] border border-[#3a3a3a] rounded-3xl p-8 shadow-lg">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-3 bg-blue-500/10 text-blue-500 rounded-xl">
              <FiTarget size={24} />
            </div>
            <h3 className="text-xl font-bold tracking-tight">Proyección de Ahorro</h3>
          </div>

          <div className="space-y-4 mb-8">
            <div className="space-y-2">
              <label className="text-xs font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
                <FiDollarSign size={14} /> Monto Objetivo
              </label>
              <input type="number" value={targetAmount} onChange={(e) => setTargetAmount(e.target.value)} placeholder={amountPlaceholder} className="w-full bg-[#1e1e1e] border border-[#3a3a3a] rounded-xl py-3 px-4 text-white font-bold focus:outline-none focus:border-blue-500 transition-colors" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
                <FiDollarSign size={14} /> Ahorro Mensual
              </label>
              <input type="number" value={monthlySaving} onChange={(e) => setMonthlySaving(e.target.value)} placeholder={amountPlaceholder} className="w-full bg-[#1e1e1e] border border-[#3a3a3a] rounded-xl py-3 px-4 text-white font-bold focus:outline-none focus:border-blue-500 transition-colors" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
                <FiPieChart size={14} /> Tasa de Interés Anual (%) - Opcional
              </label>
              <input type="number" value={interestRate} onChange={(e) => setInterestRate(e.target.value)} placeholder="5" className="w-full bg-[#1e1e1e] border border-[#3a3a3a] rounded-xl py-3 px-4 text-white font-bold focus:outline-none focus:border-blue-500 transition-colors" />
            </div>
          </div>

          {months !== null && months !== Infinity && (
            <div className="bg-[#1e1e1e] border border-blue-500/30 rounded-2xl p-6 text-center shadow-[0_0_20px_rgba(37,99,235,0.1)]">
              <p className="text-sm font-bold text-gray-400 mb-2 uppercase tracking-widest">Tiempo Estimado</p>
              <div className="flex items-center justify-center space-x-3 text-white">
                <FiClock size={28} className="text-blue-500" />
                <span className="text-5xl font-black tracking-tighter">{months}</span>
                <span className="text-xl font-bold text-gray-500 mt-2">meses</span>
              </div>
              <p className="text-xs font-bold text-gray-500 mt-4">
                Aproximadamente {(months / 12).toFixed(1)} años para alcanzar tu meta.
              </p>
            </div>
          )}
        </div>

        <div className="bg-[#232323] border border-[#3a3a3a] rounded-3xl p-8 shadow-lg">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-3 bg-income/10 text-income rounded-xl">
              <FiPieChart size={24} />
            </div>
            <h3 className="text-xl font-bold tracking-tight">Regla 50/30/20</h3>
          </div>

          <div className="space-y-4">
            {ruleRows.map((row) => {
              const percentage = row.target > 0 ? Math.min(100, Math.round((row.actual / row.target) * 100)) : 0;
              return (
                <div key={row.label} className="p-4 bg-[#1e1e1e] border border-[#3a3a3a] rounded-2xl">
                  <div className="flex justify-between items-start gap-4 mb-3">
                    <div>
                      <p className="text-xs font-black text-gray-500 uppercase tracking-widest mb-1">{row.label}</p>
                      <p className="text-white font-bold text-sm">{row.detail}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-black">{format(row.actual)}</p>
                      <p className="text-xs text-gray-500">de {format(row.target)}</p>
                    </div>
                  </div>
                  <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                    <div className={`h-full ${row.color}`} style={{ width: `${percentage}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Calculators;
