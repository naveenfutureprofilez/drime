import clsx from 'clsx';
export function AppearanceSectionTitle({
  children,
  marginTop = 'mt-22'
}) {
  return <div className={clsx('mb-6 text-sm font-semibold', marginTop)}>
      {children}
    </div>;
}