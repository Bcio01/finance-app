import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiSearch, FiFileText, FiTarget, FiBriefcase, FiSettings, FiPlus, FiPieChart } from 'react-icons/fi';
import { useFinanceStore } from '../../store/financeStore';
import { useCurrency } from '../../hooks/useCurrency';

const CommandPalette = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const navigate = useNavigate();
  const inputRef = useRef(null);
  const { transactions } = useFinanceStore();
  const { format } = useCurrency();

  const actions = [
    { id: 'nav-dashboard', title: 'Ir al Dashboard', icon: <FiPieChart />, action: () => navigate('/') },
    { id: 'nav-transactions', title: 'Ver Transacciones', icon: <FiFileText />, action: () => navigate('/transactions') },
    { id: 'nav-budget', title: 'Presupuestos', icon: <FiBriefcase />, action: () => navigate('/budget') },
    { id: 'nav-goals', title: 'Metas', icon: <FiTarget />, action: () => navigate('/goals') },
    { id: 'nav-settings', title: 'Ajustes', icon: <FiSettings />, action: () => navigate('/settings') },
    // Add transaction action would typically open a modal, for simplicity we navigate or trigger a global state
  ];

  const searchResults = query ? transactions
    .filter(t => t.description?.toLowerCase().includes(query.toLowerCase()) || t.category?.name.toLowerCase().includes(query.toLowerCase()))
    .slice(0, 5)
    .map(t => ({
      id: `tx-${t.id}`,
      title: `${t.description || t.category?.name} (${format(t.amount)})`,
      icon: <FiFileText />,
      action: () => { navigate('/transactions'); onClose(); }
    })) : [];

  const filteredActions = actions.filter(a => a.title.toLowerCase().includes(query.toLowerCase()));
  const allResults = [...filteredActions, ...searchResults];

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % allResults.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + allResults.length) % allResults.length);
      } else if (e.key === 'Enter' && allResults.length > 0) {
        e.preventDefault();
        allResults[selectedIndex]?.action();
        onClose();
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, allResults, selectedIndex, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[300] flex items-start justify-center pt-[15vh] bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose}>
      <div className="w-full max-w-2xl bg-[#1e1e1e] border border-[#3a3a3a] rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
        <div className="flex items-center px-4 border-b border-[#3a3a3a]">
          <FiSearch className="text-gray-400" size={20} />
          <input
            ref={inputRef}
            className="w-full bg-transparent text-white font-bold px-4 py-4 focus:outline-none placeholder-gray-500"
            placeholder="Buscar transacciones, navegar o escribir comandos..."
            value={query}
            onChange={(e) => { setQuery(e.target.value); setSelectedIndex(0); }}
          />
          <div className="text-[10px] font-bold text-gray-500 bg-[#232323] px-2 py-1 rounded-md border border-[#3a3a3a]">ESC</div>
        </div>

        <div className="max-h-[60vh] overflow-y-auto custom-scrollbar p-2">
          {allResults.length === 0 && (
            <div className="p-8 text-center text-gray-500 font-medium">No se encontraron resultados for "{query}"</div>
          )}
          
          {allResults.map((result, idx) => (
            <div
              key={result.id}
              onClick={() => { result.action(); onClose(); }}
              onMouseEnter={() => setSelectedIndex(idx)}
              className={`flex items-center px-4 py-3 rounded-xl cursor-pointer transition-colors ${
                idx === selectedIndex ? 'bg-blue-600/10 text-blue-500' : 'text-gray-300 hover:bg-white/5'
              }`}
            >
              <div className="mr-4">{result.icon}</div>
              <span className={`font-bold text-sm ${idx === selectedIndex ? 'text-blue-500' : 'text-gray-300'}`}>{result.title}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CommandPalette;
