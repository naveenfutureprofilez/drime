export const appAdminRoutes = [
  {
    path: '/admin/transfer-files',
    lazy: () => import('../transfer-files/transfer-files-page').then(m => ({ Component: m.TransferFilesPage })),
  },
];
