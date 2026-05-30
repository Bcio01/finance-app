import React, { useEffect, useState } from 'react';
import { useFinanceStore } from '../store/financeStore';
import { FiDownload, FiFilter, FiSearch, FiArrowUpRight, FiArrowDownLeft, FiMoreVertical, FiTrash2, FiEdit2, FiRepeat } from 'react-icons/fi';
import { useCurrency } from '../hooks/useCurrency';
import ErrorHandler from '../utils/errorHandler';
import TransactionModal from '../components/Dashboard/TransactionModal';

const Transactions = () => {
  const {
    transactions,
    recurringTransactions,
    categories,
    fetchTransactions,
    fetchCategories,
    fetchRecurringTransactions,
    addRecurringTransaction,
    deleteRecurringTransaction,
    toggleRecurringTransaction,
    deleteTransaction
  } = useFinanceStore();
  const { format } = useCurrency();
  const [searchTerm, setSearchTerm] = useState('');
  const [recurringForm, setRecurringForm] = useState({
    type: 'INCOME',
    description: '',
    amount: '',
    categoryId: '',
    dayOfMonth: '5',
  });
  const [openActionId, setOpenActionId] = useState(null);
  const [transactionToDelete, setTransactionToDelete] = useState(null);
  const [transactionToEdit, setTransactionToEdit] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (transactions.length === 0) fetchTransactions();
    if (categories.length === 0) fetchCategories();
    fetchRecurringTransactions();
  }, [transactions.length, categories.length, fetchTransactions, fetchCategories, fetchRecurringTransactions]);
  
  // Basic filtering for now
  const filteredTransactions = transactions.filter(t => 
    (t.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (t.category?.name || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDeleteTransaction = async () => {
    if (!transactionToDelete) return;

    try {
      setIsDeleting(true);
      await deleteTransaction(transactionToDelete.id);
      ErrorHandler.info('Transacción eliminada.');
      setTransactionToDelete(null);
      setOpenActionId(null);
    } catch (error) {
      ErrorHandler.handle(error, 'No se pudo eliminar la transacción.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCreateRecurring = async (event) => {
    event.preventDefault();

    const amount = Number(recurringForm.amount);
    const dayOfMonth = Number(recurringForm.dayOfMonth);
    if (!recurringForm.description.trim()) {
      ErrorHandler.warning('La descripción del automático es obligatoria.');
      return;
    }
    if (!Number.isFinite(amount) || amount <= 0) {
      ErrorHandler.warning('El monto debe ser mayor a cero.');
      return;
    }
    if (!Number.isInteger(dayOfMonth) || dayOfMonth < 1 || dayOfMonth > 31) {
      ErrorHandler.warning('El día debe estar entre 1 y 31.');
      return;
    }
    if (!recurringForm.categoryId) {
      ErrorHandler.warning('Selecciona una categoría.');
      return;
    }

    await addRecurringTransaction({
      type: recurringForm.type,
      description: recurringForm.description.trim(),
      amount,
      dayOfMonth,
      categoryId: Number(recurringForm.categoryId),
    });
    setRecurringForm({
      type: 'INCOME',
      description: '',
      amount: '',
      categoryId: '',
      dayOfMonth: '5',
    });
    ErrorHandler.success('Automático mensual creado.');
  };

  const escapeCsv = (value) => `"${String(value ?? '').replace(/"/g, '""')}"`;

  const exportCSV = async () => {
    const headers = ['Fecha', 'Tipo', 'Categoría', 'Monto', 'Descripción'];
    const rows = filteredTransactions.map(t => [
      new Date(t.createdAt).toLocaleDateString(),
      t.type === 'INCOME' ? 'Ingreso' : 'Gasto',
      t.category?.name || 'Sin Categoría',
      t.amount,
      t.description || ''
    ]);

    const csvContent = [headers, ...rows]
      .map(row => row.map(escapeCsv).join(','))
      .join("\n");

    if (window.__TAURI__ || window.__TAURI_INTERNALS__) {
      try {
        const { save } = await import('@tauri-apps/plugin-dialog');
        const { writeTextFile } = await import('@tauri-apps/plugin-fs');
        const filePath = await save({
          defaultPath: 'transacciones.csv',
          filters: [{ name: 'CSV', extensions: ['csv'] }],
        });
        if (!filePath) return;
        await writeTextFile(filePath, csvContent);
        ErrorHandler.success('CSV exportado correctamente.');
        return;
      } catch (error) {
        ErrorHandler.handle(error, 'No se pudo exportar el CSV con la API nativa.');
      }
    }

    const encodedUri = encodeURI(`data:text/csv;charset=utf-8,${csvContent}`);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "transacciones.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-[1600px] mx-auto pb-12">
      <div className="flex items-center justify-between mb-10">
        <div>
          <h2 className="text-3xl font-black tracking-tighter">Historial</h2>
          <p className="text-gray-500 font-medium mt-1">Gestiona todas tus transacciones financieras</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <button onClick={exportCSV} className="flex items-center space-x-2 bg-[#1e1e1e] border border-[#3a3a3a] text-white font-bold text-sm px-5 py-2.5 rounded-2xl hover:bg-white/5 transition-all shadow-lg">
            <FiDownload size={18} />
            <span>Exportar CSV</span>
          </button>
        </div>
      </div>

      <div className="bg-[#232323] border border-[#3a3a3a] rounded-3xl p-8 shadow-lg mb-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between mb-6">
          <div>
            <h3 className="text-xl font-black tracking-tight flex items-center gap-2">
              <FiRepeat className="text-blue-500" />
              Automáticos mensuales
            </h3>
            <p className="text-gray-500 text-sm font-medium mt-1">
              Programa ingresos o gastos que se crean solos cada mes al llegar el día indicado.
            </p>
          </div>
          <button
            type="submit"
            form="recurring-transaction-form"
            className="self-start lg:self-auto bg-blue-600 text-white font-black text-sm uppercase tracking-tighter px-6 py-3 rounded-xl hover:bg-blue-500 transition-all active:scale-95"
          >
            Agregar
          </button>
        </div>

        <form
          id="recurring-transaction-form"
          onSubmit={handleCreateRecurring}
          className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-[140px_minmax(180px,1fr)_minmax(140px,180px)_120px_minmax(180px,240px)] gap-3"
        >
          <select
            value={recurringForm.type}
            onChange={(event) => setRecurringForm({ ...recurringForm, type: event.target.value })}
            className="bg-[#1e1e1e] border border-[#3a3a3a] rounded-xl py-3 px-4 text-white font-bold focus:outline-none focus:border-blue-500"
          >
            <option value="INCOME">Ingreso</option>
            <option value="EXPENSE">Gasto</option>
          </select>
          <input
            type="text"
            value={recurringForm.description}
            onChange={(event) => setRecurringForm({ ...recurringForm, description: event.target.value })}
            placeholder="Ej. Sueldo"
            className="bg-[#1e1e1e] border border-[#3a3a3a] rounded-xl py-3 px-4 text-white font-bold focus:outline-none focus:border-blue-500"
          />
          <input
            type="text"
            inputMode="decimal"
            value={recurringForm.amount}
            onChange={(event) => setRecurringForm({ ...recurringForm, amount: event.target.value.replace(',', '.') })}
            placeholder="Monto"
            className="bg-[#1e1e1e] border border-[#3a3a3a] rounded-xl py-3 px-4 text-white font-bold focus:outline-none focus:border-blue-500"
          />
          <input
            type="number"
            min="1"
            max="31"
            value={recurringForm.dayOfMonth}
            onChange={(event) => setRecurringForm({ ...recurringForm, dayOfMonth: event.target.value })}
            placeholder="Día"
            className="bg-[#1e1e1e] border border-[#3a3a3a] rounded-xl py-3 px-4 text-white font-bold focus:outline-none focus:border-blue-500"
          />
          <select
            value={recurringForm.categoryId}
            onChange={(event) => setRecurringForm({ ...recurringForm, categoryId: event.target.value })}
            className="bg-[#1e1e1e] border border-[#3a3a3a] rounded-xl py-3 px-4 text-white font-bold focus:outline-none focus:border-blue-500"
          >
            <option value="">Categoría</option>
            {categories.map(category => (
              <option key={category.id} value={category.id}>{category.name}</option>
            ))}
          </select>
          <button
            type="submit"
            className="sr-only"
          >
            Agregar
          </button>
        </form>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {recurringTransactions.length === 0 && (
            <p className="text-sm text-gray-500 font-bold italic">No hay automáticos configurados.</p>
          )}
          {recurringTransactions.map((item) => (
            <div key={item.id} className="flex items-center justify-between gap-4 rounded-2xl border border-[#3a3a3a] bg-[#1e1e1e] p-4">
              <div>
                <p className="font-black text-white">{item.description}</p>
                <p className="text-xs font-bold text-gray-500 mt-1">
                  Día {item.dayOfMonth} de cada mes • {item.type === 'INCOME' ? 'Ingreso' : 'Gasto'} • {format(item.amount)}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => toggleRecurringTransaction(item.id, !item.isActive)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-tighter ${item.isActive ? 'bg-income/10 text-income' : 'bg-white/5 text-gray-500'}`}
                >
                  {item.isActive ? 'Activo' : 'Pausado'}
                </button>
                <button
                  type="button"
                  onClick={() => deleteRecurringTransaction(item.id)}
                  className="text-gray-600 hover:text-expense p-2 rounded-lg hover:bg-expense/10 transition-colors"
                  aria-label={`Eliminar automático ${item.description}`}
                >
                  <FiTrash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-[#232323] border border-[#3a3a3a] rounded-3xl p-8 shadow-lg">
        {/* Toolbar */}
        <div className="flex items-center justify-between mb-8">
          <div className="relative w-96">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
            <input 
              type="text" 
              placeholder="Buscar por descripción, categoría..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#1e1e1e] border border-[#3a3a3a] rounded-2xl py-3 pl-11 pr-4 text-sm font-bold text-white focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>
          
          <button className="flex items-center space-x-2 bg-[#1e1e1e] border border-[#3a3a3a] px-4 py-2.5 rounded-2xl text-gray-400 hover:text-white transition-colors">
            <FiFilter size={16} />
            <span className="text-sm font-bold">Filtros Avanzados</span>
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#3a3a3a] text-xs font-black text-gray-500 uppercase tracking-widest">
                <th className="pb-4 pl-4">Transacción</th>
                <th className="pb-4">Categoría</th>
                <th className="pb-4">Fecha</th>
                <th className="pb-4 text-right">Monto</th>
                <th className="pb-4 pr-4 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.map(t => (
                <tr key={t.id} className="border-b border-[#3a3a3a]/50 hover:bg-white/5 transition-colors group">
                  <td className="py-4 pl-4">
                    <div className="flex items-center space-x-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        t.type === 'INCOME' ? 'bg-income/10 text-income' : 'bg-expense/10 text-expense'
                      }`}>
                        {t.type === 'INCOME' ? <FiArrowDownLeft size={18} /> : <FiArrowUpRight size={18} />}
                      </div>
                      <span className="font-bold text-[15px] group-hover:text-blue-400 transition-colors">
                        {t.description || 'Sin descripción'}
                      </span>
                    </div>
                  </td>
                  <td className="py-4">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-[#1e1e1e] border border-[#3a3a3a] text-gray-300">
                      <div className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: t.category?.color || '#666' }}></div>
                      {t.category?.name || 'Varios'}
                    </span>
                  </td>
                  <td className="py-4 text-sm text-gray-400 font-medium">
                    {new Date(t.createdAt).toLocaleDateString()}
                  </td>
                  <td className={`py-4 text-right font-black text-lg ${
                    t.type === 'INCOME' ? 'text-income' : 'text-white'
                  }`}>
                    {t.type === 'INCOME' ? '+' : ''}{format(Math.abs(t.amount))}
                  </td>
                  <td className="py-4 pr-4 text-center relative">
                    <button
                      type="button"
                      onClick={() => setOpenActionId(openActionId === t.id ? null : t.id)}
                      className="text-gray-500 hover:text-white p-2 rounded-lg hover:bg-white/5 transition-colors"
                      aria-label={`Acciones de ${t.description || 'transacción'}`}
                    >
                      <FiMoreVertical size={18} />
                    </button>
                    {openActionId === t.id && (
                      <div className="absolute right-4 top-12 z-20 w-44 rounded-2xl border border-[#3a3a3a] bg-[#1e1e1e] p-2 text-left shadow-2xl">
                        <button
                          type="button"
                          onClick={() => {
                            setTransactionToEdit(t);
                            setOpenActionId(null);
                          }}
                          className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-bold text-gray-300 transition-colors hover:bg-white/5 hover:text-white"
                        >
                          <FiEdit2 size={16} />
                          <span>Editar</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setTransactionToDelete(t);
                            setOpenActionId(null);
                          }}
                          className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-bold text-expense transition-colors hover:bg-expense/10"
                        >
                          <FiTrash2 size={16} />
                          <span>Eliminar</span>
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {filteredTransactions.length === 0 && (
                <tr>
                  <td colSpan="5" className="py-12 text-center text-gray-500 font-bold italic">
                    No se encontraron transacciones.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination placeholder */}
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-[#3a3a3a]">
          <span className="text-sm font-bold text-gray-500">Mostrando {filteredTransactions.length} resultados</span>
          <div className="flex space-x-2">
            <button className="px-4 py-2 text-sm font-bold bg-[#1e1e1e] text-gray-400 rounded-xl hover:text-white border border-[#3a3a3a] transition-colors">Anterior</button>
            <button className="px-4 py-2 text-sm font-bold bg-[#1e1e1e] text-gray-400 rounded-xl hover:text-white border border-[#3a3a3a] transition-colors">Siguiente</button>
          </div>
        </div>
      </div>

      {transactionToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
          <div className="w-full max-w-md rounded-3xl border border-[#3a3a3a] bg-[#232323] p-7 shadow-2xl">
            <h3 className="text-xl font-black tracking-tight text-white">Eliminar transacción</h3>
            <p className="mt-3 text-sm font-medium leading-relaxed text-gray-400">
              ¿Estás seguro de eliminar "{transactionToDelete.description || transactionToDelete.category?.name || 'esta transacción'}"? Esta acción no se puede deshacer.
            </p>
            <div className="mt-7 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setTransactionToDelete(null)}
                disabled={isDeleting}
                className="rounded-xl border border-[#3a3a3a] px-5 py-3 text-sm font-black uppercase tracking-tighter text-gray-300 transition-colors hover:border-gray-500 hover:text-white disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleDeleteTransaction}
                disabled={isDeleting}
                className="rounded-xl bg-expense px-5 py-3 text-sm font-black uppercase tracking-tighter text-white transition-all hover:brightness-110 active:scale-95 disabled:cursor-wait disabled:opacity-70"
              >
                {isDeleting ? 'Eliminando...' : 'Eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}

      <TransactionModal
        isOpen={Boolean(transactionToEdit)}
        transaction={transactionToEdit}
        onClose={() => setTransactionToEdit(null)}
      />
    </div>
  );
};

export default Transactions;
