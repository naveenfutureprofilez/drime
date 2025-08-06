import { MixedImage } from '@ui/images/mixed-image';
import clsx from 'clsx';
import React from 'react';
import { FormattedRelativeTime } from '@ui/i18n/formatted-relative-time';
export function Line({
  notification,
  line,
  index,
  iconRenderer
}) {
  const isPrimary = line.type === 'primary' || index === 0;
  const Icon = iconRenderer || DefaultIconRenderer;
  const Element = line.action ? 'a' : 'div';
  return <>
      <Element key={index} className={clsx('flex items-center gap-8', line.action && 'hover:underline', isPrimary ? 'mnarktext-main whitespace-nowrap text-sm' : 'mt-6 text-xs text-muted')} href={line.action?.action} title={line.action?.label}>
        {line.icon && <Icon icon={line.icon} />}
        <div className="overflow-hidden text-ellipsis" dangerouslySetInnerHTML={{
        __html: line.content
      }} />
      </Element>
      {index === 0 && <time className="text-xs text-muted">
          <FormattedRelativeTime date={notification.created_at} />
        </time>}
    </>;
}
function DefaultIconRenderer({
  icon
}) {
  return <MixedImage src={icon} />;
}