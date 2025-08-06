import { BaseChart } from './base-chart';
import { ChartColors } from './chart-colors';
import { useSelectedLocale } from '@ui/i18n/selected-locale';
import { useMemo } from 'react';
import { formatReportData } from './data/format-report-data';
const PolarAreaChartOptions = {
  parsing: {
    key: 'value'
  },
  plugins: {
    tooltip: {
      intersect: true
    }
  }
};
export function PolarAreaChart({
  data,
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
    formattedData.labels = formattedData.datasets[0]?.data.map(d => d.label);
    formattedData.datasets = formattedData.datasets.map((dataset, i) => ({
      ...dataset,
      backgroundColor: ChartColors.map(c => c[1]),
      borderColor: ChartColors.map(c => c[0]),
      borderWidth: 2
    }));
    return formattedData;
  }, [data, localeCode]);
  return <BaseChart type="polarArea" data={formattedData} options={PolarAreaChartOptions} className={className} {...props} />;
}