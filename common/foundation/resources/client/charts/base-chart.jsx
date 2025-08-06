import { lazy, Suspense } from 'react';
import { ChartLayout } from './chart-layout';
import { ChartLoadingIndicator } from '@common/charts/chart-loading-indicator';
import clsx from 'clsx';
const LazyChart = lazy(() => import('./lazy-chart'));
export function BaseChart(props) {
  const {
    title,
    description,
    className,
    rowSpan = 'row-span-11',
    colSpan = 'col-span-6',
    contentRef,
    isLoading
  } = props;
  return <ChartLayout title={title} description={description} className={clsx(className, rowSpan, colSpan)} contentRef={contentRef}>
      <Suspense fallback={<ChartLoadingIndicator />}>
        <LazyChart {...props} />
        {isLoading && <ChartLoadingIndicator />}
      </Suspense>
    </ChartLayout>;
}