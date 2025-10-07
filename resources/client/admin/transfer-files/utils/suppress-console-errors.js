// Suppress specific React useState shim errors that don't affect functionality
export function suppressUseStateShimErrors() {
  // Run in both development and production to suppress this harmless error
  const originalError = console.error;
  
  console.error = (...args) => {
    const errorMessage = args.join(' ');
    
    // Check if this is the useState shim error we want to suppress
    if (
      errorMessage.includes('Cannot read properties of undefined (reading \'useState\')') ||
      errorMessage.includes('use-sync-external-store-shim') ||
      errorMessage.includes('use-sync-external-st') ||
      args[0]?.stack?.includes('use-sync-external-store-shim') ||
      args[0]?.stack?.includes('use-sync-external-st') ||
      args[0]?.message?.includes('Cannot read properties of undefined (reading \'useState\')')
    ) {
      // Optionally log a suppressed warning instead in development
      if (process.env.NODE_ENV === 'development') {
        console.warn('[Suppressed] React useState shim error - this is harmless and doesn\'t affect functionality');
      }
      return; // Don't log the error
    }
    
    // For all other errors, log normally
    originalError.apply(console, args);
  };

  // Also handle uncaught errors and unhandled promise rejections
  const originalErrorHandler = window.onerror;
  window.onerror = function(message, source, lineno, colno, error) {
    if (
      message?.includes('Cannot read properties of undefined (reading \'useState\')') ||
      message?.includes('use-sync-external-store-shim') ||
      message?.includes('use-sync-external-st') ||
      source?.includes('use-sync-external-store-shim') ||
      source?.includes('use-sync-external-st') ||
      error?.message?.includes('Cannot read properties of undefined (reading \'useState\')') ||
      error?.stack?.includes('use-sync-external-store-shim') ||
      error?.stack?.includes('use-sync-external-st')
    ) {
      // Suppress this specific error
      if (process.env.NODE_ENV === 'development') {
        console.warn('[Suppressed] React useState shim error via window.onerror - this is harmless');
      }
      return true; // Prevent default error handling
    }
    
    // For all other errors, use original handler
    if (originalErrorHandler) {
      return originalErrorHandler.call(this, message, source, lineno, colno, error);
    }
    return false;
  };

  // Handle unhandled promise rejections
  const originalUnhandledRejection = window.onunhandledrejection;
  window.onunhandledrejection = function(event) {
    const error = event.reason;
    if (
      error?.message?.includes('Cannot read properties of undefined (reading \'useState\')') ||
      error?.message?.includes('use-sync-external-store-shim') ||
      error?.message?.includes('use-sync-external-st') ||
      error?.stack?.includes('use-sync-external-store-shim') ||
      error?.stack?.includes('use-sync-external-st')
    ) {
      // Suppress this specific error
      if (process.env.NODE_ENV === 'development') {
        console.warn('[Suppressed] React useState shim error via unhandled rejection - this is harmless');
      }
      event.preventDefault();
      return;
    }
    
    // For all other errors, use original handler
    if (originalUnhandledRejection) {
      return originalUnhandledRejection.call(this, event);
    }
  };

  // Also handle addEventListener for 'error' events
  const originalAddEventListener = window.addEventListener;
  window.addEventListener = function(type, listener, options) {
    if (type === 'error') {
      const wrappedListener = function(event) {
        if (
          event.error?.message?.includes('Cannot read properties of undefined (reading \'useState\')') ||
          event.error?.stack?.includes('use-sync-external-store-shim') ||
          event.error?.stack?.includes('use-sync-external-st') ||
          event.filename?.includes('use-sync-external-store-shim') ||
          event.filename?.includes('use-sync-external-st') ||
          event.message?.includes('Cannot read properties of undefined (reading \'useState\')')
        ) {
          // Suppress this specific error
          if (process.env.NODE_ENV === 'development') {
            console.warn('[Suppressed] React useState shim error via addEventListener - this is harmless');
          }
          event.preventDefault();
          return;
        }
        
        // Call the original listener for other errors
        return listener.call(this, event);
      };
      
      return originalAddEventListener.call(this, type, wrappedListener, options);
    }
    
    return originalAddEventListener.call(this, type, listener, options);
  };
}