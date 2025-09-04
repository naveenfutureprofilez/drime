import clsx from 'clsx';
export function ChartLayout(props) {
  const {
    title,
    description,
    children,
    className,
    contentIsFlex = true,
    contentClassName,
    contentRef
  } = props;
  return <div className={clsx('flex h-full flex-auto flex-col rounded-panel border bg p-10 dark:bg-alt', className)}>
      <div className="flex flex-shrink-0 items-center justify-between pb-10 text-xs">
        <div className="text-sm font-semibold">{title}</div>
        {description && <div className="text-muted">{description}</div>}
      </div>
      <div ref={contentRef} className={clsx('relative', contentIsFlex && 'flex flex-auto items-center justify-center', contentClassName)}>
        {children}
      </div>
    </div>;
}