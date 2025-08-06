import { Helmet } from './helmet';
import { useSettings } from '@ui/settings/use-settings';
export function StaticPageTitle({
  children
}) {
  const {
    branding: {
      site_name
    }
  } = useSettings();
  return <Helmet>
      {children ?
    // @ts-ignore
    <title>
          {children} - {site_name}
        </title> : undefined}
    </Helmet>;
}