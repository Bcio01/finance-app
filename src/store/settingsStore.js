import { create } from 'zustand';
import { hashPin, isLegacyPinHash, verifyPin } from '../utils/crypto';
import { settingsRepository } from '../services/repositories/settingsRepository';

const currencyLocales = {
  CLP: "es-CL",
  USD: "en-US",
  EUR: "de-DE",
};

export const useSettingsStore = create((set, get) => ({
  pin: null,
  isLocked: false,
  currency: 'CLP',
  locale: 'es-CL',
  theme: 'dark', 
  isInitialized: false,

  // Nuevo método para hidratar desde el repositorio
  loadSettings: async () => {
    const settings = await settingsRepository.get();
    if (settings) {
      set({ 
        pin: settings.pin, 
        currency: settings.currency, 
        locale: settings.locale, 
        theme: settings.theme,
        isInitialized: settings.isInitialized
      });
    } else {
      // Inicializar por defecto en DB si no existe
      await settingsRepository.initialize({
        currency: 'CLP',
        locale: 'es-CL',
        theme: 'dark',
        isInitialized: false
      });
    }
  },

  setPin: async (newPin) => {
    const hashed = newPin ? await hashPin(newPin) : null;
    await settingsRepository.update({ pin: hashed });
    set({ pin: hashed, isLocked: !!newPin });
  },
  
  validatePin: async (inputPin) => {
    const state = get();
    if (!state.pin) return true;
    
    const isValid = await verifyPin(inputPin, state.pin);
    
    if (isValid) {
      if (isLegacyPinHash(state.pin)) {
        const migratedHash = await hashPin(inputPin);
        await settingsRepository.update({ pin: migratedHash });
        set({ pin: migratedHash, isLocked: false });
        return true;
      }

      set({ isLocked: false });
    }
    return isValid;
  },
  
  lockApp: () => {
    const state = get();
    if (state.pin) set({ isLocked: true });
  },

  setCurrency: async (currency) => {
    const locale = currencyLocales[currency] || 'es-CL';
    await settingsRepository.update({ 
      currency, 
      locale,
      isInitialized: true 
    });
    set({ 
      currency, 
      locale,
      isInitialized: true 
    });
  },
  
  setTheme: async (theme) => {
    await settingsRepository.update({ theme });
    set({ theme });
  },
}));
