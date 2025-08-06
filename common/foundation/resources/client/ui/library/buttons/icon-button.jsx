import React, { cloneElement, forwardRef } from 'react';
import clsx from 'clsx';
import { getButtonSizeStyle } from './button-size';
import { ButtonBase } from './button-base';
export const IconButton = forwardRef(({
  children,
  size = 'md',
  // only set icon size based on button size if "ButtonSize" is passed in and not custom className
  iconSize = size && size.length <= 3 ? size : 'md',
  variant = 'text',
  radius = 'rounded-button',
  className,
  padding,
  equalWidth = true,
  badge,
  ...other
}, ref) => {
  const mergedClassName = clsx(getButtonSizeStyle(size, {
    padding,
    equalWidth,
    variant
  }), className, badge && 'relative');
  return <ButtonBase {...other} ref={ref} radius={radius} variant={variant} className={mergedClassName}>
        {cloneElement(children, {
      size: iconSize
    })}
        {badge}
      </ButtonBase>;
});