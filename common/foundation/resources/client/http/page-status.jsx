import { FullPageLoader } from '@ui/progress/full-page-loader';
import { errorStatusIs } from '@common/http/error-status-is';
import { NotFoundPage } from '@common/ui/not-found-page/not-found-page';
import { PageErrorMessage } from '@common/errors/page-error-message';
import React from 'react';
import { Navigate } from 'react-router';
import { useAuth } from '@common/auth/use-auth';
import useSpinDelay from '@ui/utils/hooks/use-spin-delay';
export function PageStatus({
  query,
  show404 = true,
  loader,
  loaderClassName,
  loaderIsScreen = true,
  delayedSpinner = true,
  redirectOn404,
  isLoading
}) {
  const {
    isLoggedIn
  } = useAuth();
  isLoading = isLoading ?? query.isLoading;
  const showSpinner = useSpinDelay(isLoading, {
    delay: 500,
    minDuration: 200
  });
  if (isLoading) {
    if (!showSpinner && delayedSpinner) {
      return null;
    }
    return loader || <FullPageLoader className={loaderClassName} screen={loaderIsScreen} />;
  }
  if (query.isError && (errorStatusIs(query.error, 401) || errorStatusIs(query.error, 403)) && !isLoggedIn) {
    return <Navigate to="/login" replace />;
  }
  if (show404 && query.isError && errorStatusIs(query.error, 404)) {
    if (redirectOn404) {
      return <Navigate to={redirectOn404} replace />;
    }
    return <NotFoundPage />;
  }
  return <PageErrorMessage />;
}