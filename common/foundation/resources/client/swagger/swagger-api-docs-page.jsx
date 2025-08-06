import SwaggerUI from 'swagger-ui-react';
import 'swagger-ui-react/swagger-ui.css';
import { useMemo } from 'react';
import { Navbar } from '../ui/navigation/navbar/navbar';
import { Footer } from '../ui/footer/footer';
import { useSettings } from '@ui/settings/use-settings';
export function Component() {
  const settings = useSettings();
  const plugins = useMemo(() => {
    return getPluginsConfig(settings);
  }, [settings]);
  return <div className="h-full overflow-y-auto bg-alt">
      <Navbar size="sm" />
      <div className="container mx-auto">
        <SwaggerUI url={`${settings.base_url}/swagger.yaml`} plugins={plugins} onComplete={system => {
        //scroll to Tickets/incomingEmail
        const hash = location.hash.slice(1);
        if (hash) {
          const el = document.querySelector(`#operations-${hash.replace(/\//g, '-')}`);
          if (el) {
            el.scrollIntoView();
            el.querySelector('button')?.click();
          }
        }
      }} />
        <Footer className="px-20" />
      </div>
    </div>;
}
function getPluginsConfig(settings) {
  return [{
    statePlugins: {
      spec: {
        wrapActions: {
          updateSpec: oriAction => {
            return spec => {
              // Replace site name
              spec = spec.replaceAll('SITE_NAME', settings.branding.site_name.replace(':', ''));
              // Replace site url
              spec = spec.replaceAll('SITE_URL', settings.base_url);
              return oriAction(spec);
            };
          },
          // Add current server url to docs
          updateJsonSpec: oriAction => {
            return spec => {
              spec.servers = [{
                url: `${settings.base_url}/api/v1`
              }];
              return oriAction(spec);
            };
          }
        }
      }
    }
  }];
}