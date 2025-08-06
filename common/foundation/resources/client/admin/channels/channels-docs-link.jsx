import { useContext } from 'react';
import { SiteConfigContext } from '@common/core/settings/site-config-context';
import { LearnMoreLink } from '@common/admin/settings/form/learn-more-link';
export function ChannelsDocsLink({
  className,
  hash
}) {
  const {
    admin
  } = useContext(SiteConfigContext);
  if (!admin?.channelsDocsLink) return null;
  const link = hash ? `${admin.channelsDocsLink}#${hash}` : admin.channelsDocsLink;
  return <LearnMoreLink link={link} className={className} />;
}