import React from 'react';
import clsx from 'clsx';
export function DetailsSidebarSectionHeader({
  children,
  margin = 'mb-20'
}) {
  return <div className={clsx('text-base text-main', margin)}>{children}</div>;
}