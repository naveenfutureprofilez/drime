import React, { cloneElement, Fragment, isValidElement } from 'react';
import { TrendingUpIcon } from '@ui/icons/material/TrendingUp';
import { TrendingDownIcon } from '@ui/icons/material/TrendingDown';
import { createSvgIconFromTree } from '@ui/icons/create-svg-icon';
import { FormattedNumber } from '@ui/i18n/formatted-number';
import { FormattedBytes } from '@ui/i18n/formatted-bytes';
import { TrendingFlatIcon } from '@ui/icons/material/TrendingFlat';
import { AnimatePresence, m } from 'framer-motion';
import { opacityAnimation } from '@ui/animation/opacity-animation';
import { Skeleton } from '@ui/skeleton/skeleton';
import clsx from 'clsx';
import { Trans } from '@ui/i18n/trans';
import { FormattedDuration } from '@ui/i18n/formatted-duration';
export function AdminReportCardRow({
  report,
  isLoading
}) {
  if (!report) return <div className="col-span-12 row-span-3" />;
  return <Fragment>
      {report?.map(data => <ReportCard key={data.name} icon={data.icon} type={data.type} currentValue={data.currentValue} previousValue={data.previousValue} percentageChange={data.percentageChange} isLoading={isLoading}>
          <Trans message={data.name} />
        </ReportCard>)}
    </Fragment>;
}
export function ReportCard({
  icon: propsIcon,
  children,
  type,
  currentValue,
  previousValue,
  percentageChange,
  isLoading = false,
  colSpan = 'col-span-3',
  rowSpan = 'row-span-3'
}) {
  let icon;
  if (propsIcon) {
    if (isValidElement(propsIcon)) {
      icon = cloneElement(propsIcon, {
        size: 'sm'
      });
    } else {
      const IconEl = createSvgIconFromTree(propsIcon);
      icon = <IconEl size="sm" />;
    }
  }
  return <div className={clsx('compact-scrollbar flex flex-col justify-between overflow-x-auto overflow-y-hidden whitespace-nowrap rounded-panel border px-20 py-14', colSpan, rowSpan)}>
      <div className="flex items-center gap-6">
        {icon}
        <h2 className="text-sm font-semibold">{children}</h2>
      </div>
      <div className="flex gap-10">
        <div className="text-4xl font-medium text-main">
          <AnimatePresence initial={false} mode="wait">
            {isLoading ? <m.div key="skeleton" {...opacityAnimation}>
                <Skeleton className="min-w-40" />
              </m.div> : <m.div key="value" {...opacityAnimation}>
                <FormattedValue type={type} value={currentValue} />
              </m.div>}
          </AnimatePresence>
        </div>
        {currentValue != null && (percentageChange != null || previousValue != null) && <div className="flex items-center gap-10">
              <TrendingIndicator currentValue={currentValue} previousValue={previousValue} percentageChange={percentageChange} />
            </div>}
      </div>
    </div>;
}
function FormattedValue({
  type,
  value
}) {
  if (value == null) return '—';
  switch (type) {
    case 'fileSize':
      return <FormattedBytes bytes={value} />;
    case 'percentage':
      return <FormattedNumber value={value} style="percent" maximumFractionDigits={1} />;
    case 'durationInSeconds':
      return <FormattedDuration seconds={value} verbose />;
    default:
      return <FormattedNumber value={value} />;
  }
}
function TrendingIndicator(props) {
  const percentage = calculatePercentage(props);
  let icon;
  if (percentage > 0) {
    icon = <TrendingUpIcon size="md" className="text-positive" />;
  } else if (percentage === 0) {
    icon = <TrendingFlatIcon className="text-muted" />;
  } else {
    icon = <TrendingDownIcon className="text-danger" />;
  }
  return <Fragment>
      {icon}
      <div className="text-sm font-semibold text-muted">{percentage}%</div>
    </Fragment>;
}
function calculatePercentage({
  percentageChange,
  previousValue,
  currentValue
}) {
  if (percentageChange != null || previousValue == null || currentValue == null) {
    return percentageChange ?? 0;
  }
  if (previousValue === 0) {
    return 100;
  }
  return Math.round((currentValue - previousValue) / previousValue * 100);
}