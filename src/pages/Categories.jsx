import React, { useState, useEffect } from 'react';
import { useFinanceStore } from '../store/financeStore';
import { FiPlus, FiTrash2, FiTag, FiHash } from 'react-icons/fi';
import ErrorHandler from '../utils/errorHandler';

const Categories = () => {
  const { categories, fetchCategories, createCategory, deleteCategory } = useFinanceStore();
  const [name, setName] = useState('');
  const [color, setColor] = useState('#3b82f6');
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleCreate = async () => {
    if (!name) {
      ErrorHandler.warning('El nombre de la categoría es obligatorio.');
      return;
    }
    
    await createCategory({ name, color });
    setName('');
    setColor('#3b82f6');
    ErrorHandler.success(`Categoría "${name}" creada exitosamente.`);
  };

  const handleDelete = async () => {
    if (!categoryToDelete) return;

    try {
      setIsDeleting(true);
      await deleteCategory(categoryToDelete.id);
      ErrorHandler.info(`Categoría "${categoryToDelete.name}" eliminada.`);
      setCategoryToDelete(null);
    } catch (error) {
      ErrorHandler.handle(error, 'No se pudo eliminar la categoría.');
    } finally {
      setIsDeleting(false);
    }
  };

  const presetColors = [
    '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', 
    '#ec4899', '#06b6d4', '#f97316', '#6366f1', '#64748b'
  ];

  return (
    <div className="max-w-[1200px] mx-auto pb-12">
      <div className="flex items-center justify-between mb-10">
        <div>
          <h2 className="text-3xl font-black tracking-tighter">Categorías</h2>
          <p className="text-gray-500 font-medium mt-1">Gestiona las etiquetas de tus transacciones</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Create Form */}
        <div className="lg:col-span-1">
          <div className="bg-[#232323] border border-[#3a3a3a] rounded-3xl p-8 shadow-lg sticky top-8">
            <h3 className="text-xl font-bold tracking-tight mb-6">Nueva Categoría</h3>
            
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
                  <FiTag size={14} /> Nombre
                </label>
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ej. Comida, Transporte..." 
                  className="w-full bg-[#1e1e1e] border border-[#3a3a3a] rounded-xl py-3 px-4 text-white font-bold focus:outline-none focus:border-blue-500 transition-colors" 
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
                  <FiHash size={14} /> Color
                </label>
                <div className="flex flex-wrap gap-2 mb-4">
                  {presetColors.map(c => (
                    <button 
                      key={c}
                      onClick={() => setColor(c)}
                      className={`w-8 h-8 rounded-full border-2 transition-transform active:scale-90 ${color === c ? 'border-white scale-110' : 'border-transparent'}`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
                <div className="flex items-center space-x-3">
                  <input 
                    type="color" 
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="w-10 h-10 bg-transparent border-none cursor-pointer"
                  />
                  <input 
                    type="text" 
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="flex-1 bg-[#1e1e1e] border border-[#3a3a3a] rounded-xl py-2 px-4 text-xs font-mono text-gray-400 focus:outline-none"
                  />
                </div>
              </div>

              <button 
                onClick={handleCreate}
                className="w-full bg-blue-600 text-white font-black text-sm uppercase tracking-tighter py-4 rounded-2xl hover:bg-blue-500 transition-all shadow-xl shadow-blue-600/20 active:scale-95 flex items-center justify-center space-x-2"
              >
                <FiPlus size={20} />
                <span>Crear Categoría</span>
              </button>
            </div>
          </div>
        </div>

        {/* Categories List */}
        <div className="lg:col-span-2">
          <div className="bg-[#232323] border border-[#3a3a3a] rounded-3xl p-8 shadow-lg">
            <h3 className="text-xl font-bold tracking-tight mb-8">Categorías Existentes</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {categories.length === 0 && (
                <div className="col-span-full py-20 text-center text-gray-500 font-medium italic">
                  No has creado ninguna categoría todavía.
                </div>
              )}
              
              {categories.map(cat => (
                <div 
                  key={cat.id} 
                  className="flex items-center justify-between p-4 bg-[#1e1e1e] border border-[#3a3a3a] rounded-2xl hover:border-gray-500 transition-colors group"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg" style={{ backgroundColor: `${cat.color}20`, color: cat.color }}>
                      <FiTag size={20} />
                    </div>
                    <div>
                      <p className="font-bold text-white tracking-tight">{cat.name}</p>
                      <p className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">{cat.color}</p>
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => setCategoryToDelete(cat)}
                    className="text-gray-600 hover:text-expense p-2 rounded-lg hover:bg-expense/10 transition-all opacity-0 group-hover:opacity-100"
                    aria-label={`Eliminar ${cat.name}`}
                  >
                    <FiTrash2 size={18} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {categoryToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
          <div className="w-full max-w-md rounded-3xl border border-[#3a3a3a] bg-[#232323] p-7 shadow-2xl">
            <h3 className="text-xl font-black tracking-tight text-white">Eliminar categoría</h3>
            <p className="mt-3 text-sm font-medium leading-relaxed text-gray-400">
              ¿Estás seguro de eliminar la categoría "{categoryToDelete.name}"? Sus transacciones y presupuestos se reasignarán a "Sin categoría".
            </p>
            <div className="mt-7 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setCategoryToDelete(null)}
                disabled={isDeleting}
                className="rounded-xl border border-[#3a3a3a] px-5 py-3 text-sm font-black uppercase tracking-tighter text-gray-300 transition-colors hover:border-gray-500 hover:text-white disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                className="rounded-xl bg-expense px-5 py-3 text-sm font-black uppercase tracking-tighter text-white transition-all hover:brightness-110 active:scale-95 disabled:cursor-wait disabled:opacity-70"
              >
                {isDeleting ? 'Eliminando...' : 'Eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Categories;
