import { useTrans } from '@ui/i18n/use-trans';
import { useSettings } from '@ui/settings/use-settings';
import { Link } from 'react-router';
import clsx from 'clsx';
import { useContext } from 'react';
import { SiteConfigContext } from '@common/core/settings/site-config-context';
import { useAuth } from '@common/auth/use-auth';
export function Logo({
  color = 'light',
  className: propsClassName,
  logoType = 'auto',
  size
}) {
  const className = clsx(propsClassName, size);
  if (logoType === 'compact') {
    return <CompactLogo color={color} className={className} />;
  } else if (logoType === 'wide') {
    return <WideLogo color={color} className={className} />;
  }
  return <AutoLogo color={color} className={className} />;
}
function CompactLogo({
  color,
  className
}) {
  const {
    branding
  } = useSettings();

  // fallback to light logo if dark logo is not available
  const src = color === 'dark' && branding.logo_dark_mobile ? branding.logo_dark_mobile : branding.logo_light_mobile;
  if (!src) return null;
  return <WrapperLink className={className}>
      <img src={src} className="block w-auto" alt="" />
    </WrapperLink>;
}
function AutoLogo({
  color,
  className
}) {
  const {
    branding
  } = useSettings();
  let wideLogo;
  let compactLogo;
  if (color === 'light') {
    wideLogo = branding.logo_light;
    compactLogo = branding.logo_light_mobile;
  } else {
    wideLogo = branding.logo_dark;
    compactLogo = branding.logo_dark_mobile;
  }
  if (!wideLogo && !compactLogo) {
    return null;
  }
  return <WrapperLink className={className}>
      <picture>
        <source srcSet={compactLogo || wideLogo} media="(max-width: 768px)" />
        <source srcSet={wideLogo} media="(min-width: 768px)" />
        <img className="block h-full w-auto" alt="" />
      </picture>
    </WrapperLink>;
}
function WideLogo({
  color,
  className
}) {
  const {
    branding
  } = useSettings();
  const src = color === 'dark' && branding.logo_dark ? branding.logo_dark : branding.logo_light;
  if (!src) return null;
  return <WrapperLink className={className}>
      <img src={src} className="block h-full w-auto" alt="" />
    </WrapperLink>;
}
function WrapperLink({
  className,
  children
}) {
  const {
    trans
  } = useTrans();
  const {
    isLoggedIn
  } = useAuth();
  const {
    auth
  } = useContext(SiteConfigContext);
  return <Link to={isLoggedIn ? auth.redirectUri : '/'} className={clsx('block flex-shrink-0', className)} aria-label={trans({
    message: 'Go to homepage'
  })}>
      {children}
    </Link>;
}