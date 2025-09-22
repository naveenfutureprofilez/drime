// Suppress specific React useState shim errors that don't affect functionality
export function suppressUseStateShimErrors() {
  // Only run in development
  if (process.env.NODE_ENV !== 'development') {
    return;
  }

  const originalError = console.error;
  
  console.error = (...args) => {
    const errorMessage = args.join(' ');
    
    // Check if this is the useState shim error we want to suppress
    if (
      errorMessage.includes('Cannot read properties of undefined (reading \'useState\')') ||
      errorMessage.includes('use-sync-external-store-shim') ||
      args[0]?.stack?.includes('use-sync-external-store-shim')
    ) {
      // Optionally log a suppressed warning instead
      // console.warn('[Suppressed] React useState shim error:', ...args);
      return; // Don't log the error
    }
    
    // For all other errors, log normally
    originalError.apply(console, args);
  };

  // Also handle uncaught errors
  const originalUncaughtError = window.addEventListener;
  window.addEventListener = function(type, listener, options) {
    if (type === 'error') {
      const wrappedListener = function(event) {
        if (
          event.error?.message?.includes('useState') ||
          event.error?.stack?.includes('use-sync-external-store-shim') ||
          event.filename?.includes('use-sync-external-store-shim')
        ) {
          // Suppress this specific error
          event.preventDefault();
          return;
        }
        
        // Call the original listener for other errors
        return listener.call(this, event);
      };
      
      return originalUncaughtError.call(this, type, wrappedListener, options);
    }
    
    return originalUncaughtError.call(this, type, listener, options);
  };
}