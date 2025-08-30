import { Link } from 'react-router';
import { AuthLayoutFooter } from './auth-layout-footer';
import { useIsDarkMode } from '@ui/themes/use-is-dark-mode';
import authBgSvg from './auth-bg.svg';
import { useTrans } from '@ui/i18n/use-trans';
import { useSettings } from '@ui/settings/use-settings';
export function AuthLayout({
  heading,
  children,
  message
}) {
  const {
    branding
  } = useSettings();
  const isDarkMode = useIsDarkMode();
  const {
    trans
  } = useTrans();
  return (
    <main
      className="flex w-full h-screen flex-col items-center justify-center bg-alt px-4 dark:bg-none md:px-10vw"
      style={{
        backgroundImage: isDarkMode ? undefined : `url("${authBgSvg}")`,
      }}
    >
      <div className=''>
        <Link
          to="/"
          className="mb-4 block flex-shrink-0"
          aria-label={trans({
            message: "Go to homepage",
          })}
        >
          <img
            src={isDarkMode ? branding.logo_light : branding?.logo_dark}
            className="m-auto block h-42 w-auto"
            alt=""
          />
        </Link>

        <div className="w-full rounded-lg bg px-4 pb-4 pt-4 shadow md:shadow-xl">
          {heading && <h1 className="mb-4 text-xl">{heading}</h1>}
          {children}
        </div>

        {message && <div className="mt-4 text-sm">{message}</div>}
        <AuthLayoutFooter />
      </div>
    </main>
  );

  ;
}