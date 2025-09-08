import React, { forwardRef } from 'react';
import clsx from 'clsx';
export const DialogBody = forwardRef((props, ref) => {
  const {
    children,
    className,
    padding,
    size,
    ...domProps
  } = props;
  return <div {...domProps} ref={ref} className={clsx(className, getPadding(props), 'overflow-y-auto overflow-x-hidden overscroll-contain text-sm flex-auto')}>
        {children}
      </div>;
});
function getPadding({
  size,
  padding
}) {
  if (padding) {
    return padding;
  }
  switch (size) {
    case 'xs':
      return 'p-14';
    case 'sm':
      return 'p-18';
    default:
      return 'px-4 py-4';
  }
}