import { lazyAdminRoute } from '@common/admin/routes/lazy-admin-route';
export const appSettingsRoutes = [{
  path: 'drive',
  lazy: () => lazyAdminRoute('DriveSettings')
}];