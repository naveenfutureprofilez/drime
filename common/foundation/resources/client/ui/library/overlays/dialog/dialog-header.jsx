import React, { useContext } from 'react';
import clsx from 'clsx';
import { DialogContext } from './dialog-context';
import { IconButton } from '@ui/buttons/icon-button';
import { CloseIcon } from '@ui/icons/material/Close';
export function DialogHeader(props) {
  const {
    children,
    className,
    color,
    onDismiss,
    leftAdornment,
    rightAdornment,
    hideDismissButton = false,
    size,
    showDivider,
    justify = 'justify-between',
    titleFontWeight = 'font-semibold',
    titleTextSize = size === 'xs' ? 'text-xs' : 'text-sm',
    closeButtonSize = size === 'xs' ? 'xs' : 'sm',
    actions,
    closeButtonIcon
  } = props;
  const {
    labelId,
    isDismissable,
    close
  } = useContext(DialogContext);
  return <div className={clsx(className, 'flex flex-shrink-0 items-center gap-5', titleFontWeight, showDivider && 'border-b', getPadding(props), color || 'text-main', justify)}>
      {leftAdornment}
      <h3 id={labelId} className={clsx(titleTextSize, 'mr-auto leading-5 opacity-90')}>
        {children}
      </h3>
      {rightAdornment}
      {actions}
      {isDismissable && !hideDismissButton && <IconButton aria-label="Dismiss" onClick={() => {
      if (onDismiss) {
        onDismiss();
      } else {
        close();
      }
    }} size={closeButtonSize} className={clsx('-mr-8 text-muted', rightAdornment && 'sr-only')}>
          {closeButtonIcon || <CloseIcon />}
        </IconButton>}
    </div>;
}
function getPadding({
  size,
  padding
}) {
  if (padding) {
    return padding;
  }
  switch (size) {
    case '2xs':
    case 'xs':
      return 'px-2 py-4';
    case 'sm':
      return 'px-2 py-4';
    default:
      return 'px-8 py-6';
  }
}