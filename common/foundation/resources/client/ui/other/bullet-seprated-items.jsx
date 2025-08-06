import React, { Children, Fragment } from 'react';
import clsx from 'clsx';
export function BulletSeparatedItems({
  children,
  className
}) {
  const items = Children.toArray(children);
  return <div className={clsx('flex items-center gap-4 overflow-hidden', className)}>
      {items.map((child, index) => <Fragment key={index}>
          <div>{child}</div>
          {index < items.length - 1 ? <div>&bull;</div> : null}
        </Fragment>)}
    </div>;
}