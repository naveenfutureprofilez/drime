import React, { useId } from 'react';
import { DataTable } from '../data-table';
import { StaticPageTitle } from '../../seo/static-page-title';
import clsx from 'clsx';
export function DataTablePage({
  title,
  headerContent,
  headerItemsAlign = 'items-end',
  className,
  padding,
  variant,
  ...dataTableProps
}) {
  const titleId = useId();
  return <div className={clsx(padding ?? variant === 'fullPage' ? 'p-0' : 'p-0', className)}>
      {title && <div className={clsx(variant === 'fullPage' ? 'mb-6 px-24 py-12' : 'mb-8', headerContent && `flex ${headerItemsAlign} gap-4`)}>
          <StaticPageTitle>{title}</StaticPageTitle>
          <h1 className="heading text-[24px] capitalize" id={titleId}>
            {title} 
          </h1>
          {headerContent}
        </div>}
      <div className={clsx(variant === 'fullPage' ? 'p-12 md:p-24' : 'p-0')}>
        <DataTable {...dataTableProps} tableDomProps={{
        'aria-labelledby': title ? titleId : undefined
      }} />
      </div>
    </div>;
}