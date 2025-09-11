import { createBrowserRouter } from 'react-router';
import { GuestRoute } from '@common/auth/guards/guest-route';
import { authGuard } from '@common/auth/guards/auth-route';
import React from 'react';
import { authRoutes } from '@common/auth/auth-routes';
import { notificationRoutes } from '@common/notifications/notification-routes';
import { DynamicHomepage } from '@common/ui/other/dynamic-homepage';
import { RootErrorElement, RootRoute } from '@common/core/common-provider';
import { getBootstrapData } from '@ui/bootstrap-data/bootstrap-data-store';
import { TransferHomepage } from '@app/transfer/transfer-homepage';
import { driveRoutes } from '@app/drive/drive-routes';
import { checkoutRoutes } from '@common/billing/checkout/routes/checkout-routes';
import { billingPageRoutes } from '@common/billing/billing-page/routes/billing-page-routes';
import { commonRoutes } from '@common/core/common-routes';
import { adminRoutes } from '@common/admin/routes/admin-routes';
import { QuickSharePage } from '@app/quick-share/quick-share-page';
import { TailwindDebugTest } from '@app/debug-tailwind-test';
export const appRouter = createBrowserRouter([{
  id: 'root',
  element: <RootRoute />,
  errorElement: <RootErrorElement />,
  children: [{
    path: '/',
    element: <TransferHomepage />
  }, {
    path: '/quick-share',
    element: <QuickSharePage />
  }, {
    path: '/debug-tailwind',
    element: <TailwindDebugTest />
  }, {
    path: '/share/:hash',
    lazy: () => import('@app/guest-share/guest-share-page')
  }, ...driveRoutes, ...adminRoutes, ...authRoutes, ...notificationRoutes, ...checkoutRoutes, ...billingPageRoutes, ...commonRoutes, {
    path: 'api-docs',
    loader: () => authGuard({
      permission: 'api.access',
      requireLogin: false
    }),
    lazy: () => import('@common/swagger/swagger-api-docs-page')
  }]
}], {
  basename: getBootstrapData().settings.html_base_uri
});