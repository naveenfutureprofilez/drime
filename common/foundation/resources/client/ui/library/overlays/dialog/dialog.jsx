import React, { Children, cloneElement, isValidElement, useContext } from 'react';
import clsx from 'clsx';
import { mergeProps } from '@react-aria/utils';
import { DialogContext } from './dialog-context';
import { DismissButton } from './dismiss-button';
export function Dialog(props) {
  const {
    type = 'modal',
    dialogProps,
    ...contextProps
  } = useContext(DialogContext);
  const {
    children,
    className,
    size = 'md',
    background,
    radius = 'rounded-lg',
    maxWidth = 'max-w-dialog',
    maxHeight = 'max-h-dialog',
    shadow = 'shadow-2xl',
    ...domProps
  } = props;

  // If rendered in a popover or tray there won't be a visible dismiss button,
  // so we render a hidden one for screen readers.
  let dismissButton = null;
  if (type === 'popover' || type === 'tray') {
    dismissButton = <DismissButton onDismiss={contextProps.close} />;
  }
  const isTrayOrFullScreen = size === 'fullscreenTakeover' || type === 'tray';
  const mergedClassName = clsx('mx-auto pointer-events-auto outline-none flex flex-col overflow-hidden', background || 'bg', type !== 'tray' && sizeStyle(size), type === 'tray' && 'rounded-t border-b-bg', size !== 'fullscreenTakeover' && `${shadow} border ${maxHeight}`, !isTrayOrFullScreen && `${radius} ${maxWidth}`, className);
  return <div {...mergeProps({
    role: 'dialog',
    tabIndex: -1
  }, dialogProps, domProps)} style={{
    ...props.style,
    '--be-dialog-padding': '24px'
  }} aria-modal className={mergedClassName}>
      {Children.toArray(children).map(child => {
      if (isValidElement(child)) {
        return cloneElement(child, {
          size: child.props.size ?? size
        });
      }
      return child;
    })}
      {dismissButton}
    </div>;
}
function sizeStyle(dialogSize) {
  switch (dialogSize) {
    case '2xs':
      return 'w-256';
    case 'xs':
      return 'w-320';
    case 'sm':
      return 'w-384';
    case 'md':
      return 'w-440';
    case 'lg':
      return 'w-620';
    case 'xl':
      return 'w-780';
    case '2xl':
      return 'w-850';
    case 'fullscreen':
      return 'w-1280';
    case 'fullscreenTakeover':
      return 'w-full h-full';
    default:
      return dialogSize;
  }
}