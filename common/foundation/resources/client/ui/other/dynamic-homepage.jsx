import { GuestRoute } from '../../auth/guards/guest-route';
import { RegisterPage } from '../../auth/ui/register-page';
import { useSettings } from '@ui/settings/use-settings';
import { CustomPageLayout } from '@common/custom-page/custom-page-layout';
import { LoginPageWrapper } from '@common/auth/ui/login-page-wrapper';
export function DynamicHomepage({
  homepageResolver
}) {
  const {
    homepage
  } = useSettings();
  if (homepage?.type === 'loginPage') {
    return <GuestRoute>
        <LoginPageWrapper />
      </GuestRoute>;
  }
  if (homepage?.type === 'registerPage') {
    return <GuestRoute>
        <RegisterPage />
      </GuestRoute>;
  }
  if (homepage?.type === 'customPage') {
    return <CustomPageLayout slug={homepage.value} />;
  }
  return homepageResolver?.(homepage?.type) || null;
}