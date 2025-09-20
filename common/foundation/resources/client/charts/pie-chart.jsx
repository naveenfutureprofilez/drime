import React from 'react';
import { BaseChart } from './base-chart';

export function PieChart({ 
  data, 
  className,
  hideLegend = false,
  ...props 
}) {
  const chartData = {
    labels: data?.labels || [],
    datasets: [{
      data: data?.datasets?.[0]?.data || [],
      backgroundColor: data?.datasets?.[0]?.backgroundColor || [
        '#3B82F6', // blue
        '#10B981', // green
        '#F59E0B', // yellow
        '#EF4444', // red
        '#8B5CF6', // purple
        '#F97316', // orange
        '#06B6D4', // cyan
        '#84CC16', // lime
      ],
      borderWidth: 1,
      borderColor: '#ffffff',
    }]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: !hideLegend,
        position: 'bottom',
        labels: {
          padding: 20,
          usePointStyle: true,
        }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.parsed || 0;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return `${label}: ${value} (${percentage}%)`;
          }
        }
      }
    },
    ...props.options
  };

  return (
    <BaseChart
      type="pie"
      data={chartData}
      options={options}
      className={className}
      {...props}
    />
  );
}