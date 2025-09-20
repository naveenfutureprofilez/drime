import React, { Fragment, useState } from 'react';
import { Trans } from '@ui/i18n/trans';
import { StatDisplayWidget } from '@common/admin/analytics/stat-display-widget';
import { BaseMetricDateRangePicker } from '@common/admin/analytics/base-metric-date-range-picker';
import { FormattedBytes } from '@ui/i18n/formatted-bytes';
import { FormattedNumber } from '@ui/i18n/formatted-number';
import { LineChart } from '@common/charts/line-chart';
import { BarChart } from '@common/charts/bar-chart';
import { PieChart } from '@common/charts/pie-chart';
import { Card } from '@ui/card/card';
import { CardContent } from '@ui/card/card-content';
import { CardHeader } from '@ui/card/card-header';
import { CardTitle } from '@ui/card/card-title';
import { Button } from '@ui/buttons/button';
import { IconButton } from '@ui/buttons/icon-button';
import { RefreshIcon } from '@ui/icons/material/Refresh';
import { DownloadIcon } from '@ui/icons/material/Download';
import { TrendingUpIcon } from '@ui/icons/material/TrendingUp';
import { TrendingDownIcon } from '@ui/icons/material/TrendingDown';
import { CloudUploadIcon } from '@ui/icons/material/CloudUpload';
import { ShareIcon } from '@ui/icons/material/Share';
import { PeopleIcon } from '@ui/icons/material/People';
import { StorageIcon } from '@ui/icons/material/Storage';
import { SpeedIcon } from '@ui/icons/material/Speed';
import { SecurityIcon } from '@ui/icons/material/Security';
import { Badge } from '@ui/badge/badge';
import { Tooltip } from '@ui/tooltip/tooltip';
import { Select } from '@ui/forms/select/select';
import { Item } from '@ui/forms/listbox/item';
import { DateRangeIcon } from '@ui/icons/material/DateRange';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@common/http/query-client';

export function TransferAnalyticsPage() {
  const [dateRange, setDateRange] = useState('last_30_days');
  const [refreshKey, setRefreshKey] = useState(0);

  const { data: analyticsData, isLoading } = useQuery({
    queryKey: ['transfer-analytics', dateRange, refreshKey],
    queryFn: () => apiClient.get(`admin/analytics/transfers?range=${dateRange}`).then(response => response.data),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  const handleExport = () => {
    // Export analytics data as CSV
    window.open(`/api/v1/admin/analytics/transfers/export?range=${dateRange}`, '_blank');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  const stats = analyticsData?.stats || {};
  const charts = analyticsData?.charts || {};

  return (
    <Fragment>
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold">
              <Trans message="Transfer Analytics" />
            </h1>
            <p className="text-muted mt-1">
              <Trans message="Comprehensive insights into your transfer service performance" />
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Select
              value={dateRange}
              onSelectionChange={setDateRange}
              className="min-w-150"
            >
              <Item value="last_7_days">
                <Trans message="Last 7 days" />
              </Item>
              <Item value="last_30_days">
                <Trans message="Last 30 days" />
              </Item>
              <Item value="last_90_days">
                <Trans message="Last 90 days" />
              </Item>
              <Item value="last_year">
                <Trans message="Last year" />
              </Item>
            </Select>
            <Tooltip label={<Trans message="Export data" />}>
              <IconButton onClick={handleExport}>
                <DownloadIcon />
              </IconButton>
            </Tooltip>
            <Tooltip label={<Trans message="Refresh data" />}>
              <IconButton onClick={handleRefresh}>
                <RefreshIcon />
              </IconButton>
            </Tooltip>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title={<Trans message="Total Transfers" />}
            value={<FormattedNumber value={stats.total_transfers || 0} />}
            change={stats.transfers_change}
            icon={<CloudUploadIcon className="text-primary" />}
            trend={stats.transfers_trend}
          />
          <StatCard
            title={<Trans message="Total Data Transferred" />}
            value={<FormattedBytes bytes={stats.total_bytes || 0} />}
            change={stats.bytes_change}
            icon={<StorageIcon className="text-success" />}
            trend={stats.bytes_trend}
          />
          <StatCard
            title={<Trans message="Active Users" />}
            value={<FormattedNumber value={stats.active_users || 0} />}
            change={stats.users_change}
            icon={<PeopleIcon className="text-info" />}
            trend={stats.users_trend}
          />
          <StatCard
            title={<Trans message="Total Downloads" />}
            value={<FormattedNumber value={stats.total_downloads || 0} />}
            change={stats.downloads_change}
            icon={<DownloadIcon className="text-warning" />}
            trend={stats.downloads_trend}
          />
        </div>

        {/* Performance Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <SpeedIcon className="text-primary" />
                <Trans message="Average Transfer Speed" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                <FormattedBytes bytes={stats.avg_transfer_speed || 0} />
                <span className="text-sm text-muted">/s</span>
              </div>
              <div className="text-sm text-muted mt-1">
                <Trans message="Based on completed transfers" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <SecurityIcon className="text-success" />
                <Trans message="Success Rate" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">
                {((stats.successful_transfers / stats.total_transfers) * 100 || 0).toFixed(1)}%
              </div>
              <div className="text-sm text-muted mt-1">
                <Trans message="Successful transfers" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShareIcon className="text-info" />
                <Trans message="Avg. Downloads per Transfer" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {(stats.total_downloads / stats.total_transfers || 0).toFixed(1)}
              </div>
              <div className="text-sm text-muted mt-1">
                <Trans message="Downloads per transfer" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Transfer Volume Over Time */}
          <Card>
            <CardHeader>
              <CardTitle>
                <Trans message="Transfer Volume Over Time" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <LineChart
                data={charts.transfer_volume || []}
                className="h-80"
                hideLegend={false}
              />
            </CardContent>
          </Card>

          {/* File Size Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>
                <Trans message="File Size Distribution" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <PieChart
                data={charts.file_size_distribution || []}
                className="h-80"
              />
            </CardContent>
          </Card>
        </div>

        {/* Additional Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Top File Types */}
          <Card>
            <CardHeader>
              <CardTitle>
                <Trans message="Most Popular File Types" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <BarChart
                data={charts.file_types || []}
                className="h-80"
                layout="horizontal"
              />
            </CardContent>
          </Card>

          {/* User Activity */}
          <Card>
            <CardHeader>
              <CardTitle>
                <Trans message="User Activity Patterns" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <LineChart
                data={charts.user_activity || []}
                className="h-80"
                hideLegend={false}
              />
            </CardContent>
          </Card>
        </div>

        {/* System Health */}
        <Card>
          <CardHeader>
            <CardTitle>
              <Trans message="System Health & Performance" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-success mb-2">
                  {stats.system_uptime || '99.9'}%
                </div>
                <div className="text-sm text-muted">
                  <Trans message="System Uptime" />
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-info mb-2">
                  <FormattedBytes bytes={stats.storage_used || 0} />
                </div>
                <div className="text-sm text-muted">
                  <Trans message="Storage Used" />
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-warning mb-2">
                  {stats.avg_response_time || 0}ms
                </div>
                <div className="text-sm text-muted">
                  <Trans message="Avg Response Time" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Fragment>
  );
}

function StatCard({ title, value, change, icon, trend }) {
  const isPositive = change > 0;
  const isNegative = change < 0;

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted">{title}</p>
            <div className="text-2xl font-bold mt-2">{value}</div>
            {change !== undefined && (
              <div className={`flex items-center gap-1 text-sm mt-2 ${
                isPositive ? 'text-success' : isNegative ? 'text-danger' : 'text-muted'
              }`}>
                {isPositive && <TrendingUpIcon className="w-4 h-4" />}
                {isNegative && <TrendingDownIcon className="w-4 h-4" />}
                <span>
                  {Math.abs(change)}% from last period
                </span>
              </div>
            )}
          </div>
          <div className="text-3xl opacity-80">
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}