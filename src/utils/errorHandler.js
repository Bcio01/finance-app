import { useUIStore } from '../store/uiStore';

class ErrorHandler {
  static handle(error, customMessage = "Ha ocurrido un error inesperado") {
    console.error("FinanceApp Error:", error);
    
    // Check if it's a known Prisma or App error
    let message = customMessage;
    if (error.message) {
      message = error.message;
    }

    useUIStore.getState().addNotification({
      type: 'error',
      title: 'Error del Sistema',
      message: message
    });
  }

  static success(message) {
    useUIStore.getState().addNotification({
      type: 'success',
      title: 'Éxito',
      message: message
    });
  }

  static info(message) {
    useUIStore.getState().addNotification({
      type: 'info',
      title: 'Información',
      message: message
    });
  }

  static warning(message) {
    useUIStore.getState().addNotification({
      type: 'warning',
      title: 'Advertencia',
      message: message
    });
  }
}

export default ErrorHandler;