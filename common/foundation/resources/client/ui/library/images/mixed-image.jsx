import { memo } from 'react';
import { SvgImage } from '@ui/images/svg-image';
import { isAbsoluteUrl } from '@ui/utils/urls/is-absolute-url';
export const MixedImage = memo(({
  src,
  className,
  ...domProps
}) => {
  let type = null;
  if (!src) {
    type = null;
  } else if (typeof src === 'object') {
    type = 'icon';
  } else if (src.endsWith('.svg') && !isAbsoluteUrl(src)) {
    type = 'svg';
  } else {
    type = 'image';
  }
  if (type === 'svg') {
    return <SvgImage {...domProps} className={className} src={src} height={false} />;
  }
  if (type === 'image') {
    return <img {...domProps} className={className} src={src} alt="" />;
  }
  if (type === 'icon') {
    const Icon = src;
    return <Icon {...domProps} className={className} />;
  }
  return null;
});