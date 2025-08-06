import { FocusScope } from '@react-aria/focus';
import React from 'react';
import clsx from 'clsx';
export const Input = React.forwardRef((props, ref) => {
  const {
    children,
    inputProps,
    wrapperProps,
    className,
    autoFocus,
    style,
    onClick
  } = props;
  return <div {...wrapperProps} onClick={onClick}>
        <div {...inputProps} role="group" className={clsx(className, 'flex items-center focus-within:ring focus-within:ring-primary/focus focus-within:border-primary/60')} ref={ref} style={style}>
          <FocusScope autoFocus={autoFocus}>{children}</FocusScope>
        </div>
      </div>;
});