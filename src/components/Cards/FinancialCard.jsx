import React from 'react';
import { FiTrendingUp, FiTrendingDown, FiActivity, FiDollarSign } from 'react-icons/fi';
import { useCurrency } from '../../hooks/useCurrency';

const FinancialCard = ({ title, amount, percentage, type = 'default', subtext }) => {
  const { format } = useCurrency();
  const styles = {
    default: {
      text: 'text-white',
      percent: 'text-blue-400',
      icon: <FiDollarSign size={18} className="text-gray-400" />
    },
    income: {
      text: 'text-income',
      percent: 'text-income',
      icon: <FiTrendingUp size={18} className="text-income" />
    },
    expense: {
      text: 'text-expense',
      percent: 'text-expense',
      icon: <FiTrendingDown size={18} className="text-expense" />
    },
    savings: {
      text: 'text-savings',
      percent: 'text-savings',
      icon: <FiActivity size={18} className="text-savings" />
    }
  };

  const style = styles[type];

  return (
    <div className="bg-[#232323] border border-[#3a3a3a] rounded-3xl p-6 flex flex-col justify-between h-44 shadow-lg transition-all hover:border-gray-500 cursor-default">
      <div className="flex items-center justify-between">
        <span className="text-gray-400 text-sm font-medium tracking-tight">{title}</span>
        <div className="p-2 bg-white/5 rounded-lg">
          {style.icon}
        </div>
      </div>
      
      <div className="mt-2">
        <h3 className={`text-3xl font-bold tracking-tight ${style.text}`}>
          {format(amount)}
        </h3>
        <div className="flex items-center space-x-2 mt-3">
          <span className={`text-xs font-bold px-2 py-0.5 rounded-md bg-white/5 ${style.percent}`}>
            {type === 'savings' ? `${percentage}%` : (percentage > 0 ? `+${percentage}%` : `${percentage}%`)}
          </span>
          <span className="text-gray-500 text-[10px] uppercase font-bold tracking-widest">
            {subtext || 'vs mes anterior'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default FinancialCard;
