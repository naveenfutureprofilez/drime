import { BaseChart } from './base-chart';
import { ChartColors } from './chart-colors';
import { useSelectedLocale } from '@ui/i18n/selected-locale';
import { useMemo } from 'react';
import { formatReportData } from './data/format-report-data';
export function BarChart({
  data,
  direction = 'vertical',
  individualBarColors = false,
  className,
  ...props
}) {
  const {
    localeCode
  } = useSelectedLocale();
  const formattedData = useMemo(() => {
    const formattedData = formatReportData(data, {
      localeCode
    });
    formattedData.datasets = formattedData.datasets.map((dataset, i) => ({
      ...dataset,
      backgroundColor: individualBarColors ? ChartColors.map(c => c[1]) : ChartColors[i][1],
      borderColor: individualBarColors ? ChartColors.map(c => c[0]) : ChartColors[i][0],
      borderWidth: 2
    }));
    return formattedData;
  }, [data, localeCode, individualBarColors]);
  const isHorizontal = direction === 'horizontal';
  const options = useMemo(() => {
    return {
      indexAxis: isHorizontal ? 'y' : 'x',
      parsing: {
        xAxisKey: isHorizontal ? 'value' : 'label',
        yAxisKey: isHorizontal ? 'label' : 'value'
      }
    };
  }, [isHorizontal]);
  return <BaseChart type="bar" className={className} data={formattedData} options={options} {...props} />;
}