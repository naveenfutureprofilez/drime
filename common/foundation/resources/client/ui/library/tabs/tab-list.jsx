import React, { Children, cloneElement, isValidElement } from 'react';
import clsx from 'clsx';
import { FocusScope } from '@react-aria/focus';
import { TabLine } from '@ui/tabs/tab-line';
export function TabList({
  children,
  center,
  expand,
  className,
  border = 'border-b'
}) {
  const childrenArray = Children.toArray(children);
  return <FocusScope>
      <div className={clsx(
    // hide scrollbar completely on mobile, show compact one on desktop
    'max-sm:hidden-scrollbar md:compact-scrollbar relative flex max-w-full overflow-auto', border, className)} role="tablist" aria-orientation="horizontal">
        {childrenArray.map((child, index) => {
        if (isValidElement(child)) {
          return cloneElement(child, {
            index,
            className: clsx(child.props.className, expand && 'flex-auto', center && index === 0 && 'ml-auto', center && index === childrenArray.length - 1 && 'mr-auto')
          });
        }
        return null;
      })}
        <TabLine />
      </div>
    </FocusScope>;
}