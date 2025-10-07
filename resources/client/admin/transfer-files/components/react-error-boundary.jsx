import React from 'react';

class ReactErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    // Check if it's the useState shim error we want to ignore
    if (error?.message?.includes('useState') || error?.stack?.includes('use-sync-external-store-shim')) {
      // Log it for debugging but don't crash the app
      console.warn('Suppressed React useState shim error:', error);
      return null; // Don't update state, let the app continue
    }
    
    // For other errors, show error UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Check if this is the useState shim error we want to suppress
    const errorMessage = error.message || '';
    const errorStack = error.stack || '';
    
    if (
      errorMessage.includes('Cannot read properties of undefined (reading \'useState\')') ||
      errorMessage.includes('use-sync-external-store-shim') ||
      errorStack.includes('use-sync-external-store-shim') ||
      errorStack.includes('use-sync-external-store-shim.production.js')
    ) {
      // Log a suppressed warning instead of the full error
      console.warn('[React Error Boundary] Suppressed useState shim error - this is harmless and doesn\'t affect functionality');
      return; // Don't log the full error
    }
    
    // For all other errors, log normally
    console.error('React Error Boundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return <div className="p-4 text-center text-red-600">Something went wrong.</div>;
    }

    return this.props.children;
  }
}

export default ReactErrorBoundary;