import { BaseChart } from './base-chart';
import { useMemo } from 'react';
import { formatReportData } from './data/format-report-data';
import { useSelectedLocale } from '@ui/i18n/selected-locale';
import { ChartColors } from './chart-colors';
const LineChartOptions = {
  parsing: {
    xAxisKey: 'label',
    yAxisKey: 'value'
  },
  datasets: {
    line: {
      fill: 'origin',
      tension: 0.1,
      pointBorderWidth: 4,
      pointHitRadius: 10
    }
  },
  plugins: {
    tooltip: {
      intersect: false,
      mode: 'index'
    }
  }
};
export function LineChart({
  data,
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
      backgroundColor: ChartColors[i][1],
      borderColor: ChartColors[i][0],
      pointBackgroundColor: ChartColors[i][0]
    }));
    return formattedData;
  }, [data, localeCode]);
  return <BaseChart {...props} data={formattedData} type="line" options={LineChartOptions} />;
}