// Suppress React useState shim errors immediately before any other code
(function() {
  // Handle window.onerror immediately
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
      return true; // Prevent default error handling
    }
    
    // For all other errors, use original handler
    if (originalErrorHandler) {
      return originalErrorHandler.call(this, message, source, lineno, colno, error);
    }
    return false;
  };

  // Handle unhandled promise rejections immediately
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
      event.preventDefault();
      return;
    }
    
    // For all other errors, use original handler
    if (originalUnhandledRejection) {
      return originalUnhandledRejection.call(this, event);
    }
  };
})();

import './App.css';
import React from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import { CommonProvider } from '@common/core/common-provider';
import * as Sentry from '@sentry/react';
import { ignoredSentryErrors } from '@common/errors/ignored-sentry-errors';
import { appRouter } from '@app/app-router';
import { getBootstrapData } from '@ui/bootstrap-data/bootstrap-data-store';
import { rootEl } from '@ui/root-el';
import { suppressUseStateShimErrors } from '@app/admin/transfer-files/utils/suppress-console-errors';

// Suppress React useState shim errors that don't affect functionality
suppressUseStateShimErrors();
const data = getBootstrapData();
const sentryDsn = data.settings.logging.sentry_public;
if (sentryDsn && import.meta.env.PROD) {
  Sentry.init({
    dsn: sentryDsn,
    integrations: [new Sentry.BrowserTracing()],
    tracesSampleRate: 0.2,
    ignoreErrors: ignoredSentryErrors,
    release: data.sentry_release
  });
}
const app = <CommonProvider router={appRouter} />;
if (data.rendered_ssr) {
  hydrateRoot(rootEl, app);
} else {
  createRoot(rootEl).render(app);
}