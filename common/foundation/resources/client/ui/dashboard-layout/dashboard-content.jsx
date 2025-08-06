import { cloneElement } from 'react';
import clsx from 'clsx';
export function DashboardContent({
  children,
  isScrollable = true,
  stableScrollbar = true
}) {
  return cloneElement(children, {
    className: clsx(children.props.className, isScrollable && 'overflow-y-auto', isScrollable && stableScrollbar && 'stable-scrollbar', 'dashboard-grid-content', 'has-[.dashboard-stable-scrollbar]:stable-scrollbar')
  });
}