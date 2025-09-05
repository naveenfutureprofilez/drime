import { Outlet } from 'react-router';
import { DashboardContent } from '@common/ui/dashboard-layout/dashboard-content';
import { useAdminSetupAlerts } from '@common/admin/use-admin-setup-alerts';
import { SectionHelper } from '@common/ui/other/section-helper';
import { ErrorIcon } from '@ui/icons/material/Error';
import { setInLocalStorage, useLocalStorage } from '@ui/utils/hooks/local-storage';
import clsx from 'clsx';
import { useIsMobileMediaQuery } from '@ui/utils/hooks/is-mobile-media-query';
import AdminSidebars from './AdminSideBars';
import { BasicInfoPanel } from '@common/auth/ui/account-settings/basic-info-panel/basic-info-panel';
import { useUser } from '@common/auth/ui/use-user';
import { SocialLoginPanel } from '@common/auth/ui/account-settings/social-login-panel';
import { ChangePasswordPanel } from '@common/auth/ui/account-settings/change-password-panel/change-password-panel';
import { TwoFactorPanel } from '@common/auth/ui/account-settings/two-factor-panel';
import { SessionsPanel } from '@common/auth/ui/account-settings/sessions-panel/sessions-panel';
import { LocalizationPanel } from '@common/auth/ui/account-settings/localization-panel';
import { AccessTokenPanel } from '@common/auth/ui/account-settings/access-token-panel/access-token-panel';
import { DangerZonePanel } from '@common/auth/ui/account-settings/danger-zone-panel/danger-zone-panel';
export function AdminLayout() {
  const isMobile = useIsMobileMediaQuery();
  const variant = isMobile ? 'withNavbar' : 'withoutNavbar';
  
  const { data, isLoading } = useUser('me', { with: ['roles', 'social_profiles', 'tokens'] });

  return <>
  <div className='layout flex'>
        <AdminSidebars variant={variant}/>
        <DashboardContent>
          <div className={clsx(variant === 'withoutNavbar' ? 'relative' : 'bg dark:bg-alt')}>
            {!isLoading && data && (
              <>
              <BasicInfoPanel user={data.user} />
                <ChangePasswordPanel />

<LocalizationPanel user={data.user} />
                <TwoFactorPanel user={data.user} />
                {/* <SocialLoginPanel user={data.user} /> */}
                {/* 
                <SessionsPanel />
                <LocalizationPanel user={data.user} />
                <AccessTokenPanel user={data.user} />
                 */}
                {/* <DangerZonePanel /> */}
              </>
            )}
            {/* <SetupAlertsList />
            <Outlet /> */}
          </div>
        </DashboardContent>
  </div>
    {/* <DashboardLayout name="admin" leftSidenavCanBeCompact className="bg-alt">
      {variant === 'withNavbar' && <DashboardNavbar size="sm" menuPosition="admin-navbar" />}
      <DashboardSidenav position="left" size="sm">
        <AdminSidebar variant={variant} />
      </DashboardSidenav>
      <DashboardContent>
        <div className={clsx(variant === 'withoutNavbar' ? 'relative bg ring-divider dark:bg-alt md:mt-6 md:rounded-tl-md md:shadow-sm md:ring md:ring-1' : 'border-l bg dark:bg-alt')}>
          <SetupAlertsList />
          <Outlet />
        </div>
      </DashboardContent>
    </DashboardLayout> */}
  </> 
}
function SetupAlertsList() {
  const {
    data
  } = useAdminSetupAlerts();
  const [dismissValue] = useLocalStorage('admin-setup-alert-dismissed', null);

  // show alert if 1 day passed since last dismiss
  const shouldShowAlert = !dismissValue || Date.now() - dismissValue.timestamp > 86400000;
  if (!data?.alerts.length || !shouldShowAlert) {
    return null;
  }
  return <div className="fixed left-24 right-24 top-24 z-10 mx-auto w-max max-w-[calc(100%-48px)] overflow-hidden rounded-panel bg shadow-md">
      <SetupAlert alert={data.alerts[0]} />
    </div>;
}
function SetupAlert({
  alert
}) {
  const description = <div dangerouslySetInnerHTML={{
    __html: alert.description
  }}></div>;
  return <SectionHelper leadingIcon={<ErrorIcon size="xs" className="text-danger" />} onClose={() => {
    setInLocalStorage('admin-setup-alert-dismissed', {
      timestamp: Date.now()
    });
  }} key={alert.title} title={alert.title} description={description} color="neutral" />;
}