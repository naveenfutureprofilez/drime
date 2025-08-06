import React, { forwardRef } from 'react';
import clsx from 'clsx';
import { useObjectRef } from '@react-aria/utils';
import { useAutoFocus } from '@ui/focus/use-auto-focus';
export const SegmentedRadio = forwardRef((props, ref) => {
  const {
    children,
    autoFocus,
    size,
    invalid,
    isFirst,
    labelRef,
    isSelected,
    ...domProps
  } = props;
  const inputRef = useObjectRef(ref);
  useAutoFocus({
    autoFocus
  }, inputRef);
  const sizeClassNames = getSizeClassNames(size);
  return <label ref={labelRef} className={clsx('relative z-20 inline-flex flex-auto cursor-pointer select-none items-center justify-center gap-8 whitespace-nowrap align-middle font-medium transition-colors hover:text-main', isSelected ? 'text-main' : 'text-muted', !isFirst && '', sizeClassNames, props.disabled && 'pointer-events-none text-disabled', props.invalid && 'text-danger')}>
        <input type="radio" className="pointer-events-none absolute left-0 top-0 h-full w-full appearance-none rounded focus-visible:outline" ref={inputRef} {...domProps} />
        {children && <span>{children}</span>}
      </label>;
});
function getSizeClassNames(size) {
  switch (size) {
    case 'xs':
      return 'px-6 py-3 text-xs';
    case 'sm':
      return 'px-10 py-5 text-sm';
    case 'lg':
      return 'px-16 py-6 text-lg';
    default:
      return 'px-16 py-8 text-sm';
  }
}