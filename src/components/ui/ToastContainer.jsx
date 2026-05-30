import React from 'react';
import { useUIStore } from '../../store/uiStore';
import { FiCheckCircle, FiAlertCircle, FiInfo, FiXCircle, FiX } from 'react-icons/fi';

const ToastContainer = () => {
  const { notifications, removeNotification } = useUIStore();

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3">
      {notifications.map((notif) => {
        const isSuccess = notif.type === 'success';
        const isError = notif.type === 'error';
        const isWarning = notif.type === 'warning';
        
        return (
          <div 
            key={notif.id} 
            className={`flex items-start space-x-3 p-4 rounded-2xl border shadow-2xl min-w-[300px] backdrop-blur-md animate-in slide-in-from-bottom-5 fade-in duration-300 ${
              isSuccess ? 'bg-income/10 border-income/30 text-white' :
              isError ? 'bg-expense/10 border-expense/30 text-white' :
              isWarning ? 'bg-yellow-500/10 border-yellow-500/30 text-white' :
              'bg-[#232323]/90 border-[#3a3a3a] text-white'
            }`}
          >
            <div className={`mt-0.5 ${
              isSuccess ? 'text-income' :
              isError ? 'text-expense' :
              isWarning ? 'text-yellow-500' :
              'text-blue-500'
            }`}>
              {isSuccess && <FiCheckCircle size={20} />}
              {isError && <FiXCircle size={20} />}
              {isWarning && <FiAlertCircle size={20} />}
              {!isSuccess && !isError && !isWarning && <FiInfo size={20} />}
            </div>
            
            <div className="flex-1">
              <h4 className="font-bold text-sm tracking-tight">{notif.title}</h4>
              <p className="text-xs font-medium text-gray-400 mt-1">{notif.message}</p>
            </div>

            <button 
              onClick={() => removeNotification(notif.id)}
              className="text-gray-500 hover:text-white transition-colors"
            >
              <FiX size={16} />
            </button>
          </div>
        );
      })}
    </div>
  );
};

export default ToastContainer;
