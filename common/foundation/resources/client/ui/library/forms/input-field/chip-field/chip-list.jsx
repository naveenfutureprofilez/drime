import React, { Children, cloneElement, isValidElement } from 'react';
import clsx from 'clsx';
export function ChipList({
  className,
  children,
  size,
  color,
  radius,
  selectable,
  wrap = true,
  startButton
}) {
  return <div className={clsx('flex items-center gap-8', wrap && 'flex-wrap', className)}>
      {startButton}
      {Children.map(children, chip => {
      if (isValidElement(chip)) {
        return cloneElement(chip, {
          size,
          color,
          selectable,
          radius
        });
      }
    })}
    </div>;
}