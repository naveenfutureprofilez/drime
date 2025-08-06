import './App.css';
import React from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import { CommonProvider } from '@common/core/common-provider';
import * as Sentry from '@sentry/react';
import { ignoredSentryErrors } from '@common/errors/ignored-sentry-errors';
import { appRouter } from '@app/app-router';
import { getBootstrapData } from '@ui/bootstrap-data/bootstrap-data-store';
import { rootEl } from '@ui/root-el';
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