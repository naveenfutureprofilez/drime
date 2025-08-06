import { Children, cloneElement } from 'react';
import clsx from 'clsx';
export function Timeline({
  children,
  className
}) {
  const items = Children.toArray(children);
  return <div className={className}>
      {items.map((item, index) => cloneElement(item, {
      isLast: index === items.length - 1
    }))}
    </div>;
}
export function TimelineItem({
  children,
  className,
  isLast,
  isActive
}) {
  return <div className={clsx('flex min-w-0 gap-12 py-6', className)}>
      <div>
        <div className={clsx('mt-4 h-12 w-12 flex-shrink-0 rounded-full border-[3px]', isActive && 'border-positive bg-positive-lighter')} />
        {!isLast && <div className="mx-auto mt-4 h-[calc(100%-12px)] w-2 bg-chip"></div>}
      </div>
      <div className="min-w-0 flex-auto overflow-hidden overflow-ellipsis whitespace-nowrap text-sm">
        {children}
      </div>
    </div>;
}