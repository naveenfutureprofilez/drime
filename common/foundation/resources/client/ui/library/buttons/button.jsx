import React from 'react';
import clsx from 'clsx';
import { getButtonSizeStyle } from './button-size';
import { ButtonBase } from './button-base';
export const Button = React.forwardRef(({
  children,
  startIcon,
  endIcon,
  size = 'sm',
  sizeClassName,
  className,
  equalWidth = false,
  radius = 'rounded-button',
  variant = 'text',
  disabled,
  elementType,
  to,
  replace,
  href,
  download,
  ...other
}, ref) => {
  const mergedClassName = clsx('font-semibold', sizeClassName || getButtonSizeStyle(size, {
    equalWidth,
    variant
  }), className);
  return <ButtonBase className={mergedClassName} ref={ref} radius={radius} variant={variant} disabled={disabled} to={disabled ? undefined : to} href={disabled ? undefined : href} download={disabled ? undefined : download} elementType={disabled ? undefined : elementType} replace={disabled ? undefined : replace} {...other}>
        {startIcon && <InlineIcon position="start" icon={startIcon} size={size} />}
        {children}
        {endIcon && <InlineIcon position="end" icon={endIcon} size={size} />}
      </ButtonBase>;
});
function InlineIcon({
  icon,
  position,
  size
}) {
  const className = clsx('m-auto', {
    '-ml-4 mr-8': position === 'start',
    '-mr-4 ml-8': position === 'end'
  }, icon.props.className);
  // don't override size, if it was explicitly set on the icon
  return React.cloneElement(icon, {
    className,
    size: icon.props.size ?? size
  });
}