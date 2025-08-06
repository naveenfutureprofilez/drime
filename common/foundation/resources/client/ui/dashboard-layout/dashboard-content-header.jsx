import clsx from 'clsx';
export function DashboardContentHeader({
  children,
  className
}) {
  return <div className={clsx(className, 'dashboard-grid-header')}>{children}</div>;
}