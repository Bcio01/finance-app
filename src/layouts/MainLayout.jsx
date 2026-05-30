import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar/Sidebar";
import CommandPalette from "../components/ui/CommandPalette";

const MainLayout = ({ children }) => {
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="flex h-screen bg-[#0b0b0b] overflow-hidden text-white font-sans selection:bg-blue-500/30">
      <Sidebar />
      <main className="flex-1 flex flex-col overflow-hidden relative">
        <div className="flex-1 overflow-y-auto p-10 custom-scrollbar scroll-smooth">
          {children}
        </div>
      </main>
      <CommandPalette isOpen={isCommandPaletteOpen} onClose={() => setIsCommandPaletteOpen(false)} />
    </div>
  );
};

export default MainLayout;
