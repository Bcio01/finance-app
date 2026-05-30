import React, { useRef, useState } from 'react';
import { FiLock, FiDownload, FiUpload, FiTrash2, FiShield } from 'react-icons/fi';
import { useSettingsStore } from '../store/settingsStore';
import { useFinanceStore } from '../store/financeStore';
import { exportData, importData } from '../services/backupService';
import ErrorHandler from '../utils/errorHandler';

const Settings = () => {
  const { pin, setPin, currency, setCurrency } = useSettingsStore();
  const { fetchTransactions, fetchCategories, fetchBudgets, fetchGoals } = useFinanceStore();
  const [newPin, setNewPin] = useState('');
  const [pendingRestoreFile, setPendingRestoreFile] = useState(null);
  const [isRestoring, setIsRestoring] = useState(false);
  const fileInputRef = useRef(null);

  const handleSetPin = () => {
    if (newPin.length !== 4) {
      ErrorHandler.warning('El PIN debe tener exactamente 4 dígitos.');
      return;
    }
    setPin(newPin);
    setNewPin('');
    ErrorHandler.success('PIN de seguridad configurado exitosamente.');
  };

  const handleRemovePin = () => {
    setPin(null);
    ErrorHandler.info('Seguridad por PIN desactivada.');
  };

  const handleCurrencyChange = (e) => {
    setCurrency(e.target.value);
    ErrorHandler.success(`Moneda global actualizada a ${e.target.value}.`);
  };

  const handleExport = () => {
    const password = window.prompt('Ingresa una clave para cifrar el backup.');
    if (!password) {
      ErrorHandler.warning('El backup no fue exportado porque requiere una clave de cifrado.');
      return;
    }
    exportData({ password });
  };

  const handleImport = async (e) => {
    const file = e.target.files[0];
    if (file) setPendingRestoreFile(file);
    e.target.value = null; // Reset input
  };

  const confirmRestore = async () => {
    if (!pendingRestoreFile) return;

    try {
      setIsRestoring(true);
      await importData(pendingRestoreFile);
      // Refresh global state
      fetchCategories();
      fetchTransactions();
      fetchBudgets();
      fetchGoals();
      setPendingRestoreFile(null);
      ErrorHandler.success('Backup restaurado correctamente.');
    } catch (error) {
      ErrorHandler.handle(error, 'No se pudo restaurar el backup.');
    } finally {
      setIsRestoring(false);
    }
  };

  return (
    <div className="max-w-[1000px] mx-auto pb-12">
      <div className="flex items-center justify-between mb-10">
        <div>
          <h2 className="text-3xl font-black tracking-tighter">Ajustes y Seguridad</h2>
          <p className="text-gray-500 font-medium mt-1">Configura la privacidad y gestiona tus datos</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Security Section */}
        <div className="bg-[#232323] border border-[#3a3a3a] rounded-3xl p-8 shadow-lg">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-3 bg-blue-500/10 text-blue-500 rounded-xl">
              <FiShield size={24} />
            </div>
            <h3 className="text-xl font-bold tracking-tight">Seguridad Local</h3>
          </div>
          
          <p className="text-gray-400 text-sm mb-6 leading-relaxed">
            Activa un PIN de 4 dígitos para proteger el acceso a la aplicación. La información se cifra localmente.
          </p>

          {!pin ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-black text-gray-500 uppercase tracking-widest">Crear PIN de Acceso</label>
                <div className="flex space-x-4">
                  <input 
                    type="password" 
                    maxLength={4}
                    value={newPin}
                    onChange={(e) => setNewPin(e.target.value.replace(/[^0-9]/g, ''))}
                    placeholder="****" 
                    className="w-32 bg-[#1e1e1e] border border-[#3a3a3a] rounded-xl py-3 px-4 text-center text-white text-xl tracking-[0.5em] font-black focus:outline-none focus:border-blue-500 transition-colors" 
                  />
                  <button onClick={handleSetPin} className="flex-1 bg-blue-600 text-white font-black text-sm uppercase tracking-tighter px-6 py-3 rounded-xl hover:bg-blue-500 transition-all shadow-xl shadow-blue-600/20 active:scale-95">
                    Activar
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-[#1e1e1e] border border-[#3a3a3a] rounded-2xl p-6 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-income/10 rounded-full flex items-center justify-center text-income">
                  <FiLock size={18} />
                </div>
                <div>
                  <p className="text-white font-bold text-sm">PIN Activado</p>
                  <p className="text-gray-500 text-xs">La app solicitará PIN al iniciar</p>
                </div>
              </div>
              <button onClick={handleRemovePin} className="text-expense hover:bg-expense/10 p-2 rounded-lg transition-colors">
                <FiTrash2 size={18} />
              </button>
            </div>
          )}
        </div>

        {/* Currency Section */}
        <div className="md:col-span-2 bg-[#232323] border border-[#3a3a3a] rounded-3xl p-8 shadow-lg">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-3 bg-yellow-500/10 text-yellow-500 rounded-xl">
              <span className="font-black text-lg">€$</span>
            </div>
            <h3 className="text-xl font-bold tracking-tight">Moneda Global</h3>
          </div>
          
          <p className="text-gray-400 text-sm mb-6 leading-relaxed">
            Selecciona la moneda principal para tu aplicación. Los montos se formatearán automáticamente según las reglas regionales de la moneda.
          </p>

          <div className="max-w-xs space-y-2">
            <label className="text-xs font-black text-gray-500 uppercase tracking-widest">Moneda</label>
            <select
              value={currency}
              onChange={handleCurrencyChange}
              className="w-full bg-[#1e1e1e] border border-[#3a3a3a] rounded-xl py-3 px-4 text-white font-bold focus:outline-none focus:border-blue-500 transition-colors"
            >
              <option value="CLP">Peso Chileno (CLP)</option>
              <option value="USD">Dólar Estadounidense (USD)</option>
              <option value="EUR">Euro (EUR)</option>
            </select>
          </div>
        </div>

        {/* Backup Section */}
        <div className="bg-[#232323] border border-[#3a3a3a] rounded-3xl p-8 shadow-lg">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-3 bg-income/10 text-income rounded-xl">
              <FiDownload size={24} />
            </div>
            <h3 className="text-xl font-bold tracking-tight">Gestión de Datos</h3>
          </div>
          
          <p className="text-gray-400 text-sm mb-6 leading-relaxed">
            Realiza copias de seguridad manuales de tu información. Todos los datos se almacenan exclusivamente en tu dispositivo.
          </p>

          <div className="space-y-4">
            <button onClick={handleExport} className="w-full flex items-center justify-between p-4 bg-[#1e1e1e] border border-[#3a3a3a] hover:border-gray-500 transition-colors rounded-2xl group active:scale-[0.98]">
              <div className="flex items-center space-x-4">
                <FiDownload size={20} className="text-gray-400 group-hover:text-blue-500 transition-colors" />
                <div className="text-left">
                  <p className="text-white font-bold text-sm">Exportar Backup (.json)</p>
                  <p className="text-gray-500 text-xs">Guarda una copia de seguridad</p>
                </div>
              </div>
            </button>

            <input 
              type="file" 
              accept=".json" 
              ref={fileInputRef} 
              onChange={handleImport} 
              className="hidden" 
            />
            
            <button onClick={() => fileInputRef.current.click()} className="w-full flex items-center justify-between p-4 bg-[#1e1e1e] border border-[#3a3a3a] hover:border-expense transition-colors rounded-2xl group active:scale-[0.98]">
              <div className="flex items-center space-x-4">
                <FiUpload size={20} className="text-gray-400 group-hover:text-expense transition-colors" />
                <div className="text-left">
                  <p className="text-white font-bold text-sm">Restaurar Backup</p>
                  <p className="text-gray-500 text-xs">Sobreescribe los datos actuales</p>
                </div>
              </div>
            </button>
          </div>
        </div>

      </div>

      {pendingRestoreFile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
          <div className="w-full max-w-md rounded-3xl border border-[#3a3a3a] bg-[#232323] p-7 shadow-2xl">
            <h3 className="text-xl font-black tracking-tight text-white">Restaurar backup</h3>
            <p className="mt-3 text-sm font-medium leading-relaxed text-gray-400">
              Restaurar "{pendingRestoreFile.name}" sobreescribirá todos los datos actuales. Esta acción no se puede deshacer.
            </p>
            <div className="mt-7 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setPendingRestoreFile(null)}
                disabled={isRestoring}
                className="rounded-xl border border-[#3a3a3a] px-5 py-3 text-sm font-black uppercase tracking-tighter text-gray-300 transition-colors hover:border-gray-500 hover:text-white disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={confirmRestore}
                disabled={isRestoring}
                className="rounded-xl bg-expense px-5 py-3 text-sm font-black uppercase tracking-tighter text-white transition-all hover:brightness-110 active:scale-95 disabled:cursor-wait disabled:opacity-70"
              >
                {isRestoring ? 'Restaurando...' : 'Restaurar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
