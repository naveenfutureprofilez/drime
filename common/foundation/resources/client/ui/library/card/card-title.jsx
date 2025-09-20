import React from 'react';
import clsx from 'clsx';

export function CardTitle({ children, className, ...props }) {
  return (
    <h3 
      className={clsx(
        'text-lg font-semibold leading-none tracking-tight',
        className
      )}
      {...props}
    >
      {children}
    </h3>
  );
}