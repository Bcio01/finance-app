import React, { useEffect } from "react";
import { HashRouter as Router, Routes, Route } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import Dashboard from "./pages/Dashboard";
import Reports from "./pages/Reports";
import Budget from "./pages/Budget";
import Transactions from "./pages/Transactions";
import Goals from "./pages/Goals";
import Calculators from "./pages/Calculators";
import Settings from "./pages/Settings";
import Calendar from "./pages/Calendar";
import Analytics from "./pages/Analytics";
import Categories from "./pages/Categories";
import LockScreen from "./pages/LockScreen";
import ToastContainer from "./components/ui/ToastContainer";
import { useSettingsStore } from "./store/settingsStore";

function App() {
  const { lockApp, pin, loadSettings } = useSettingsStore();

  useEffect(() => {
    loadSettings();
  }, []);

  // Auto-lock on inactivity (5 minutes)
  useEffect(() => {
    let timeoutId;

    const resetTimer = () => {
      clearTimeout(timeoutId);
      if (pin) {
        timeoutId = setTimeout(() => {
          lockApp();
        }, 5 * 60 * 1000); // 5 minutes
      }
    };

    const events = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart'];
    events.forEach(event => window.addEventListener(event, resetTimer));
    const lockOnHidden = () => {
      if (document.visibilityState === 'hidden' && pin) {
        lockApp();
      }
    };
    document.addEventListener('visibilitychange', lockOnHidden);
    
    resetTimer();

    return () => {
      clearTimeout(timeoutId);
      events.forEach(event => window.removeEventListener(event, resetTimer));
      document.removeEventListener('visibilitychange', lockOnHidden);
    };
  }, [lockApp, pin]);

  return (
    <>
      <LockScreen>
        <Router>
          <MainLayout>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/transactions" element={<Transactions />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/budget" element={<Budget />} />
              <Route path="/goals" element={<Goals />} />
              <Route path="/calculators" element={<Calculators />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/calendar" element={<Calendar />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/categories" element={<Categories />} />
            </Routes>
          </MainLayout>
        </Router>
      </LockScreen>
      <ToastContainer />
    </>
  );
}

export default App;
