import React from 'react';
import clsx from 'clsx';

export function CardContent({ children, className, ...props }) {
  return (
    <div 
      className={clsx(
        'p-4 pt-0',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}