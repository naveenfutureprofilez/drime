import { lazy } from 'react';

export * from '@common/admin/routes/admin-routes.lazy';
export { DriveSettings } from '@app/admin/settings/drive-settings';
export { LandingPageAppearanceForm } from '@app/admin/appearance/sections/landing-page-section/landing-page-appearance-form';
export { LandingPageSectionGeneral } from '@app/admin/appearance/sections/landing-page-section/landing-page-section-general';
export { LandingPageSectionActionButtons } from '@app/admin/appearance/sections/landing-page-section/landing-page-section-action-buttons';
export { LandingPageSectionPrimaryFeatures } from '@app/admin/appearance/sections/landing-page-section/landing-page-section-primary-features';
export { LandingPageSecondaryFeatures } from '@app/admin/appearance/sections/landing-page-section/landing-page-section-secondary-features';
export { AdminDashboardPage } from '../dashboard/admin-dashboard-page';
export { TransferFilesPage } from '../transfer-files/transfer-files-page';
export { TransferUsersPage } from '../users/transfer-users-page';
export { TransferAnalyticsPage } from '../analytics/transfer-analytics-page';
export { TransferSettingsPage } from '../settings/transfer-settings-page';
export { AdminTwoFactorAuthPage } from '../2fa/admin-2fa-page';
