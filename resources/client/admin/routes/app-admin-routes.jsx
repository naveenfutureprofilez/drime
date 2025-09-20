export const appAdminRoutes = [
  {
    path: 'transfer-files',
    lazy: () => import('./app-admin-routes.lazy').then(m => ({ Component: m.TransferFilesPage }))
  },
  {
    path: 'transfer-files/:transferId',
    lazy: () => import('../transfer-files/transfer-detail-page').then(m => ({ Component: m.TransferDetailPage }))
  },
  {
    path: 'transfer-users',
    lazy: () => import('./app-admin-routes.lazy').then(m => ({ Component: m.TransferUsersPage }))
  },
  {
    path: 'transfer-analytics',
    lazy: () => import('./app-admin-routes.lazy').then(m => ({ Component: m.TransferAnalyticsPage }))
  },
  {
    path: 'transfer-settings',
    lazy: () => import('./app-admin-routes.lazy').then(m => ({ Component: m.TransferSettingsPage }))
  },
  {
    path: '2fa',
    lazy: () => import('./app-admin-routes.lazy').then(m => ({ Component: m.AdminTwoFactorAuthPage }))
  },
];
