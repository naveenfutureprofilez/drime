export const appAdminRoutes = [
  {
    path: '/admin/transfer-files',
    lazy: () => import('../transfer-files/transfer-files-page').then(m => ({ Component: m.TransferFilesPage }))
  },
  {
    path: '/admin/transfer-files/:transferId',
    lazy: () => import('../transfer-files/transfer-detail-page').then(m => ({ Component: m.TransferDetailPage }))
  },
  {
    path: '/admin/2fa',
    lazy: () => import('../2fa/admin-2fa-page').then(m => ({ Component: m.AdminTwoFactorAuthPage }))
  },
];
