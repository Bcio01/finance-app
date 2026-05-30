import React from 'react';
import { useFinanceStore } from '../store/financeStore';
import FinancialCard from '../components/Cards/FinancialCard';
import TransactionChart from '../components/Charts/TransactionChart';
import CategoryChart from '../components/Charts/CategoryChart';
import { FiDownload } from 'react-icons/fi';
import { exportFinancialReportPDF } from '../utils/pdfExport';
import { useCurrency } from '../hooks/useCurrency';

const Reports = () => {
  const { summary, insights, transactions, goals } = useFinanceStore();
  const { format } = useCurrency();

  const handleExport = () => {
    exportFinancialReportPDF(summary, transactions, goals, format);
  };

  return (
    <div className="max-w-[1600px] mx-auto pb-12">
      <div className="flex items-center justify-between mb-10">
        <div>
          <h2 className="text-3xl font-black tracking-tighter">Reportes Financieros</h2>
          <p className="text-gray-500 font-medium mt-1">Analíticas avanzadas y tendencias</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <button onClick={handleExport} className="flex items-center space-x-2 bg-[#1e1e1e] border border-[#3a3a3a] text-white font-bold text-sm px-5 py-2.5 rounded-2xl hover:bg-white/5 transition-all shadow-lg">
            <FiDownload size={18} />
            <span>Exportar Informe PDF</span>
          </button>
        </div>
      </div>

      {/* AI Insights Section */}
      {insights && insights.length > 0 && (
        <div className="bg-[#232323] border border-[#3a3a3a] rounded-3xl p-6 mb-10 shadow-lg flex flex-col gap-3">
          <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-2">Insights Automáticos</h3>
          {insights.map((insight, idx) => (
            <div key={idx} className={`p-4 rounded-xl border ${
              insight.type === 'positive' ? 'bg-income/5 border-income/20 text-income' : 
              insight.type === 'warning' ? 'bg-orange-500/5 border-orange-500/20 text-orange-400' :
              'bg-expense/5 border-expense/20 text-expense'
            }`}>
              <p className="font-bold text-sm">{insight.message}</p>
            </div>
          ))}
        </div>
      )}

      {/* Advanced Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
        <FinancialCard 
          title="Promedio Gasto Diario" 
          amount={summary.avgDailyExpense} 
          percentage={0}
          type="expense" 
          subtext="desde el inicio"
        />
        <FinancialCard 
          title="Promedio Ingreso Mensual" 
          amount={summary.avgMonthlyIncome} 
          percentage={0}
          type="income" 
          subtext="desde el inicio"
        />
        <FinancialCard 
          title="Porcentaje de Ahorro" 
          amount={summary.savingsPercentage} 
          percentage={0}
          type="savings" 
          subtext="% de los ingresos"
        />
        <FinancialCard 
          title="Balance Neto Total" 
          amount={summary.balance} 
          percentage={0}
          type="default" 
          subtext="histórico"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-10">
        <div className="xl:col-span-1">
          <TransactionChart />
        </div>
        <div className="xl:col-span-1">
          <CategoryChart />
        </div>
      </div>
    </div>
  );
};

export default Reports;