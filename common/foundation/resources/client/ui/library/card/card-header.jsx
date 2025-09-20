import React from 'react';
import clsx from 'clsx';

export function CardHeader({ children, className, ...props }) {
  return (
    <div 
      className={clsx(
        'p-4 pb-2',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}