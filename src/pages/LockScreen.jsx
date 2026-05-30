import React, { useState } from 'react';
import { useSettingsStore } from '../store/settingsStore';
import { FiLock, FiUnlock } from 'react-icons/fi';

const LockScreen = ({ children }) => {
  const { isLocked, validatePin, pin } = useSettingsStore();
  const [inputPin, setInputPin] = useState('');
  const [error, setError] = useState(false);

  // If no PIN is configured or the app is unlocked, render children
  if (!pin || !isLocked) {
    return children;
  }

  const handleKeyPress = (num) => {
    if (inputPin.length < 4) {
      setInputPin(prev => prev + num);
      setError(false);
    }
  };

  const handleBackspace = () => {
    setInputPin(prev => prev.slice(0, -1));
    setError(false);
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (inputPin.length === 4) {
      const isValid = await validatePin(inputPin);
      if (!isValid) {
        setError(true);
        setInputPin('');
      }
    }
  };

  // Auto-submit when 4 digits are entered
  React.useEffect(() => {
    if (inputPin.length === 4) {
      handleSubmit();
    }
  }, [inputPin]);

  return (
    <div className="fixed inset-0 z-[200] bg-[#0b0b0b] flex flex-col items-center justify-center animate-in fade-in duration-500">
      <div className="mb-10 text-center">
        <div className="w-16 h-16 bg-blue-600/10 rounded-full flex items-center justify-center mx-auto mb-6">
          {error ? <FiLock size={32} className="text-expense" /> : <FiUnlock size={32} className="text-blue-500" />}
        </div>
        <h1 className="text-2xl font-black tracking-tighter text-white mb-2">Finance<span className="text-blue-500">App</span></h1>
        <p className="text-gray-500 font-medium">Introduce tu PIN para acceder</p>
      </div>

      <div className="flex space-x-4 mb-10">
        {[0, 1, 2, 3].map((i) => (
          <div 
            key={i} 
            className={`w-4 h-4 rounded-full transition-all duration-300 ${
              inputPin.length > i ? 'bg-blue-500 scale-110 shadow-[0_0_10px_rgba(59,130,246,0.5)]' : 'bg-[#1e1e1e] border border-[#3a3a3a]'
            } ${error ? 'bg-expense shadow-[0_0_10px_rgba(249,115,22,0.5)]' : ''}`}
          ></div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-4 max-w-[280px]">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
          <button
            key={num}
            onClick={() => handleKeyPress(num.toString())}
            className="w-20 h-20 bg-[#1e1e1e] border border-[#3a3a3a] rounded-full text-2xl font-black text-white hover:bg-white/10 active:scale-95 transition-all"
          >
            {num}
          </button>
        ))}
        <div className="w-20 h-20"></div> {/* Empty space */}
        <button
          onClick={() => handleKeyPress('0')}
          className="w-20 h-20 bg-[#1e1e1e] border border-[#3a3a3a] rounded-full text-2xl font-black text-white hover:bg-white/10 active:scale-95 transition-all"
        >
          0
        </button>
        <button
          onClick={handleBackspace}
          className="w-20 h-20 flex items-center justify-center text-gray-500 hover:text-white active:scale-95 transition-all"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 4H8l-7 8 7 8h13a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z"></path><line x1="18" y1="9" x2="12" y2="15"></line><line x1="12" y1="9" x2="18" y2="15"></line></svg>
        </button>
      </div>

      {error && (
        <p className="text-expense font-bold mt-8 animate-bounce">PIN Incorrecto. Intenta de nuevo.</p>
      )}
    </div>
  );
};

export default LockScreen;
