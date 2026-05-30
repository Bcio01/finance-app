import React from 'react';
import { NavLink } from 'react-router-dom';
import { FiGrid, FiArrowUp, FiArrowDown, FiPieChart, FiSettings, FiTarget, FiList, FiBriefcase, FiMenu } from 'react-icons/fi';

const SidebarItem = ({ icon: Icon, label, to }) => (
  <NavLink 
    to={to}
    className={({ isActive }) => `flex items-center space-x-3 p-3.5 rounded-xl cursor-pointer transition-all duration-200 group ${
      isActive 
        ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' 
        : 'text-gray-500 hover:bg-white/5 hover:text-white'
    }`}
  >
    {({ isActive }) => (
      <>
        <Icon size={20} className={isActive ? 'text-white' : 'text-gray-500 group-hover:text-blue-500 transition-colors'} />
        <span className={`font-bold text-sm tracking-tight ${isActive ? 'text-white' : ''}`}>{label}</span>
      </>
    )}
  </NavLink>
);

const Sidebar = () => {
  return (
    <div className="w-72 h-screen bg-[#1e1e1e] border-r border-white/5 flex flex-col p-6 shadow-2xl z-10">
      <div className="flex items-center space-x-3 px-2 mb-12">
        <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/20">
          <FiBriefcase className="text-white" size={24} />
        </div>
        <h1 className="text-2xl font-black tracking-tighter text-white">Finance<span className="text-blue-500">App</span></h1>
      </div>

      <div className="flex-1 space-y-10 overflow-y-auto custom-scrollbar pr-2">
        <div>
          <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] px-3 mb-5">Principal</p>
          <div className="space-y-1.5">
            <SidebarItem icon={FiGrid} label="Dashboard" to="/" />
            <SidebarItem icon={FiList} label="Transacciones" to="/transactions" />
            <SidebarItem icon={FiPieChart} label="Reportes" to="/reports" />
            <SidebarItem icon={FiPieChart} label="Analíticas Pro" to="/analytics" />
          </div>
        </div>

        <div>
          <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] px-3 mb-5">Planificación</p>
          <div className="space-y-1.5">
            <SidebarItem icon={FiBriefcase} label="Presupuesto" to="/budget" />
            <SidebarItem icon={FiTarget} label="Metas" to="/goals" />
            <SidebarItem icon={FiSettings} label="Categorías" to="/categories" />
          </div>
        </div>

        <div>
          <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] px-3 mb-5">Herramientas</p>
          <div className="space-y-1.5">
            <SidebarItem icon={FiTarget} label="Calculadoras" to="/calculators" />
            <SidebarItem icon={FiTarget} label="Calendario" to="/calendar" />
          </div>
        </div>
      </div>

      <div className="pt-6 border-t border-white/5">
        <SidebarItem icon={FiSettings} label="Ajustes" to="/settings" />
      </div>
    </div>
  );
};

export default Sidebar;
