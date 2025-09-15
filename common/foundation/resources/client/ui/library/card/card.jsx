import React from 'react';
import clsx from 'clsx';

export function Card({ children, className, ...props }) {
  return (
    <div 
      className={clsx(
        'rounded-panel border bg-paper p-0 shadow-sm',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

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