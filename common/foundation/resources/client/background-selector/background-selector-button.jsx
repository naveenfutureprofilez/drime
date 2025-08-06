import clsx from 'clsx';
import { forwardRef } from 'react';
export const BackgroundSelectorButton = forwardRef(({
  isActive,
  children,
  className,
  style,
  label,
  ...buttonProps
}, ref) => {
  return <button type="button" {...buttonProps} ref={ref}>
      <span className={clsx('flex aspect-square items-center justify-center overflow-hidden rounded-panel border border-[#c3cbdc] outline-none focus-visible:ring', isActive && 'ring-2 ring-primary ring-offset-2', className)} style={style}>
        {children}
      </span>
      <span className="mt-10 block overflow-hidden overflow-ellipsis text-xs">
        {label}
      </span>
    </button>;
});