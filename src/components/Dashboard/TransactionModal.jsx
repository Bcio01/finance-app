import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { FiX, FiDollarSign, FiTag, FiType, FiFileText } from 'react-icons/fi';
import { useFinanceStore } from '../../store/financeStore';
import { useCurrency } from '../../hooks/useCurrency';
import { formatCurrency } from '../../utils/currencyFormatter';
import { MAX_TRANSACTION_AMOUNT } from '../../utils/money';
import { useUIStore } from '../../store/uiStore';

const schema = z.object({
  type: z.enum(['INCOME', 'EXPENSE']),
  amount: z.string()
    .refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
      message: "El monto debe ser un número positivo",
    })
    .refine((val) => Number(val) <= MAX_TRANSACTION_AMOUNT, {
      message: `El monto no puede superar ${MAX_TRANSACTION_AMOUNT}`,
    }),
  categoryId: z.string().min(1, "La categoría es requerida"),
  description: z.string().optional(),
});

const TransactionModal = ({ isOpen, onClose, transaction = null }) => {
  const { categories, addTransaction, updateTransaction } = useFinanceStore();
  const { currency, locale, amountPlaceholder } = useCurrency();
  const addNotification = useUIStore((state) => state.addNotification);
  const { register, handleSubmit, reset, watch, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      type: 'EXPENSE',
      amount: '',
      categoryId: '',
      description: '',
    }
  });
  const selectedType = watch('type');
  const isEditing = Boolean(transaction);

  useEffect(() => {
    if (!isOpen) return;

    reset({
      type: transaction?.type || 'EXPENSE',
      amount: transaction ? String(transaction.amount) : '',
      categoryId: transaction?.categoryId ? String(transaction.categoryId) : '',
      description: transaction?.description || '',
    });
  }, [isOpen, transaction, reset]);

  if (!isOpen) return null;

  const onSubmit = async (data) => {
    try {
      const payload = {
        ...data,
        amount: parseFloat(data.amount),
        categoryId: parseInt(data.categoryId),
      };

      const savedTransaction = isEditing
        ? await updateTransaction(transaction.id, payload)
        : await addTransaction(payload);

      if (isEditing) {
        addNotification({
          type: 'success',
          title: 'Transacción actualizada',
          message: 'Los cambios fueron guardados correctamente.'
        });
        reset();
        onClose();
        return;
      }

      const newTransaction = savedTransaction;
      if (newTransaction.type === 'EXPENSE' && newTransaction.amount > 500) {
        addNotification({
          type: 'warning',
          title: 'Alerta de Gasto Alto',
          message: `Se ha registrado un gasto inusualmente alto (${formatCurrency(newTransaction.amount, currency, locale)}).`
        });
      }
      if (newTransaction.type === 'INCOME' && newTransaction.amount > 1000) {
        addNotification({
          type: 'success',
          title: 'Ingreso Detectado',
          message: `Se sugiere destinar el 20% (${formatCurrency(newTransaction.amount * 0.2, currency, locale)}) a tu meta prioritaria.`
        });
      }
      reset();
      onClose();
    } catch (error) {
      console.error("Error saving transaction:", error);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-[#1e1e1e] border border-[#3a3a3a] w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="flex items-center justify-between p-6 border-b border-white/5">
          <h3 className="text-xl font-black tracking-tight text-white">
            {isEditing ? 'Editar Transacción' : 'Nueva Transacción'}
          </h3>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
            <FiX size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          {/* Type Selector */}
          <div className="space-y-2">
            <label className="text-xs font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
              <FiType size={14} /> Tipo
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className={`cursor-pointer flex items-center justify-center p-3 rounded-xl border-2 transition-all ${
                selectedType === 'INCOME' ? 'border-income bg-income/10 text-income' : 'border-[#3a3a3a] bg-white/5 text-gray-400 hover:border-gray-500'
              }`}>
                <input type="radio" {...register('type')} value="INCOME" className="hidden" />
                <span className="font-bold">Ingreso</span>
              </label>
              <label className={`cursor-pointer flex items-center justify-center p-3 rounded-xl border-2 transition-all ${
                selectedType === 'EXPENSE' ? 'border-expense bg-expense/10 text-expense' : 'border-[#3a3a3a] bg-white/5 text-gray-400 hover:border-gray-500'
              }`}>
                <input type="radio" {...register('type')} value="EXPENSE" className="hidden" />
                <span className="font-bold">Gasto</span>
              </label>
            </div>
            {errors.type && <p className="text-expense text-xs font-bold mt-1">{errors.type.message}</p>}
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <label className="text-xs font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
              <FiDollarSign size={14} /> Monto
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">
                {currency === 'EUR' ? '€' : currency === 'USD' ? '$' : '$'}
              </span>
              <input
                type="text"
                {...register('amount')}
                placeholder={amountPlaceholder}
                className="w-full bg-[#252525] border border-[#3a3a3a] rounded-xl py-3 pl-10 pr-4 text-white font-bold focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
            {errors.amount && <p className="text-expense text-xs font-bold mt-1">{errors.amount.message}</p>}
          </div>

          {/* Category */}
          <div className="space-y-2">
            <label className="text-xs font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
              <FiTag size={14} /> Categoría
            </label>
            <select
              {...register('categoryId')}
              className="w-full bg-[#252525] border border-[#3a3a3a] rounded-xl py-3 px-4 text-white font-bold focus:outline-none focus:border-blue-500 transition-colors appearance-none"
            >
              <option value="">Seleccionar categoría</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
            {errors.categoryId && <p className="text-expense text-xs font-bold mt-1">{errors.categoryId.message}</p>}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="text-xs font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
              <FiFileText size={14} /> Descripción
            </label>
            <input
              type="text"
              {...register('description')}
              placeholder="Ej. Almuerzo, Sueldo..."
              className="w-full bg-[#252525] border border-[#3a3a3a] rounded-xl py-3 px-4 text-white font-bold focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-4 rounded-2xl shadow-xl shadow-blue-600/20 transition-all active:scale-95 disabled:opacity-50 mt-4"
          >
            {isSubmitting ? 'Guardando...' : isEditing ? 'Guardar Cambios' : 'Guardar Transacción'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default TransactionModal;
