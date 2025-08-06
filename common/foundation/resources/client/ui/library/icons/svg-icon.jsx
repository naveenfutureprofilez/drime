import React, { forwardRef } from 'react';
import clsx from 'clsx';
export const SvgIcon = forwardRef((props, ref) => {
  const {
    attr,
    size,
    title,
    className,
    color,
    style,
    children,
    viewBox,
    width,
    height,
    ...svgProps
  } = props;
  return <svg aria-hidden={!title} focusable={false} xmlns="http://www.w3.org/2000/svg" viewBox={viewBox || '0 0 24 24'} {...attr} {...svgProps} className={clsx('svg-icon', className, getSizeClassName(size))} style={{
    color,
    ...style
  }} ref={ref} height={height || '1em'} width={width || '1em'}>
        {title && <title>{title}</title>}
        {children}
      </svg>;
});
function getSizeClassName(size) {
  switch (size) {
    case '2xs':
      return 'icon-2xs';
    case 'xs':
      return 'icon-xs';
    case 'sm':
      return 'icon-sm';
    case 'md':
      return 'icon-md';
    case 'lg':
      return 'icon-lg';
    case 'xl':
      return 'icon-xl';
    default:
      return size;
  }
}