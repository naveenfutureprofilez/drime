import React from 'react';
import { Trans } from '@ui/i18n/trans';
import { useTransferFileStats } from '../transfer-files/requests/use-transfer-file-stats';
import { PageStatus } from '@common/http/page-status';
import { Chip } from '@ui/forms/input-field/chip-field/chip';
import { Link } from 'react-router';
import { Button } from '@ui/buttons/button';
import { 
  FileUploadIcon, 
  DownloadIcon, 
  PeopleIcon, 
  StorageIcon,
  TrendingUpIcon,
  VisibilityIcon,
  SecurityIcon,
  ScheduleIcon
} from '@ui/icons/material/all-icons';
import { FormattedBytes } from '@ui/i18n/formatted-bytes';
import { FormattedDate } from '@ui/i18n/formatted-date';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@common/http/query-client';

// Hook to get recent transfers
function useRecentTransfers() {
  return useQuery({
    queryKey: ['admin', 'recent-transfers'],
    queryFn: () => apiClient.get('admin/transfer-files?per_page=5').then(r => r.data.pagination.data),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

// Statistics Card Component
function StatCard({ title, value, icon: Icon, color = 'primary', trend, subtitle }) {
  return (
    <div className="rounded-panel border bg-paper shadow-sm p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-muted">{title}</p>
          <p className="text-2xl font-bold mt-1">{value}</p>
          {subtitle && <p className="text-sm text-muted mt-1">{subtitle}</p>}
        </div>
        <div className={`p-3 rounded-full bg-${color}/10`}>
          <Icon className={`h-6 w-6 text-${color}`} />
        </div>
      </div>
      {trend && (
        <div className="mt-4 flex items-center">
          <TrendingUpIcon className="h-4 w-4 text-positive mr-1" />
          <span className="text-sm text-positive">{trend}</span>
        </div>
      )}
    </div>
  );
}

// Recent Transfers Component
function RecentTransfersCard() {
  const { data: transfers, isLoading, error } = useRecentTransfers();

  if (isLoading || error) {
    return (
      <div className="rounded-panel border bg-paper shadow-sm">
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">
            <Trans message="Recent Transfers" />
          </h3>
          <PageStatus query={{ isLoading, error }} loaderClassName="h-32" />
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-panel border bg-paper shadow-sm">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">
            <Trans message="Recent Transfers" />
          </h3>
          <Button
            variant="outline"
            size="sm"
            elementType={Link}
            to="/admin/transfer-files"
          >
            <Trans message="View All" />
          </Button>
        </div>
        
        <div className="space-y-4">
          {transfers?.length > 0 ? (
            transfers.map((transfer) => (
              <div key={transfer.id} className="flex items-center justify-between p-3 rounded-md bg-alt/50">
                <div className="flex items-center space-x-3">
                  <FileUploadIcon className="h-5 w-5 text-muted" />
                  <div>
                    <p className="font-medium text-sm">
                      {transfer.original_filename || 'Untitled'}
                    </p>
                    <div className="flex items-center space-x-2 text-xs text-muted">
                      <span>{transfer.formatted_size}</span>
                      {transfer.files_count > 1 && (
                        <span>• {transfer.files_count} files</span>
                      )}
                      <span>• <FormattedDate date={transfer.created_at} /></span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Chip 
                    color={transfer.status === 'active' ? 'positive' : 'danger'} 
                    size="xs"
                  >
                    {transfer.status === 'active' ? 'Active' : 'Expired'}
                  </Chip>
                  <Button
                    variant="text"
                    size="xs"
                    elementType={Link}
                    to={`/admin/transfer-files/${transfer.id}`}
                  >
                    <VisibilityIcon className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-muted">
              <FileUploadIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p><Trans message="No transfers yet" /></p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// System Status Component
function SystemStatusCard() {
  return (
    <div className="rounded-panel border bg-paper shadow-sm">
      <div className="p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <SecurityIcon className="h-5 w-5 mr-2" />
          <Trans message="System Status" />
        </h3>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm"><Trans message="Storage System" /></span>
            <Chip color="positive" size="xs">Online</Chip>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm"><Trans message="Email Service" /></span>
            <Chip color="positive" size="xs">Online</Chip>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm"><Trans message="File Processing" /></span>
            <Chip color="positive" size="xs">Online</Chip>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm"><Trans message="Cleanup Service" /></span>
            <Chip color="positive" size="xs">Online</Chip>
          </div>
        </div>
        
        <div className="mt-4 pt-4 border-t">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted">Last Updated</span>
            <span><FormattedDate date={new Date()} /></span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Quick Actions Component
function QuickActionsCard() {
  return (
    <div className="rounded-panel border bg-paper shadow-sm">
      <div className="p-6">
        <h3 className="text-lg font-semibold mb-4">
          <Trans message="Quick Actions" />
        </h3>
        
        <div className="grid grid-cols-1 gap-3">
          <Button
            variant="outline"
            className="justify-start"
            elementType={Link}
            to="/admin/transfer-files"
          >
            <FileUploadIcon className="h-4 w-4 mr-2" />
            <Trans message="Manage Transfers" />
          </Button>
          
          <Button
            variant="outline"
            className="justify-start"
            elementType={Link}
            to="/admin/settings"
          >
            <SecurityIcon className="h-4 w-4 mr-2" />
            <Trans message="System Settings" />
          </Button>
          
          <Button
            variant="outline"
            className="justify-start"
            elementType={Link}
            to="/admin/profile"
          >
            <PeopleIcon className="h-4 w-4 mr-2" />
            <Trans message="Admin Profile" />
          </Button>
        </div>
      </div>
    </div>
  );
}

// Main Dashboard Component
export function AdminDashboardPage() {
  const { data: stats, isLoading, error } = useTransferFileStats();

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          <Trans message="Transfer Service Dashboard" />
        </h1>
        <p className="text-gray-600">
          <Trans message="Monitor your WeTransfer service performance and manage transfers" />
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title={<Trans message="Total Transfers" />}
          value={isLoading ? '...' : (stats?.total_transfers || '0')}
          icon={FileUploadIcon}
          color="primary"
          trend={stats?.transfers_trend && `+${stats.transfers_trend}% this month`}
        />
        
        <StatCard
          title={<Trans message="Total Downloads" />}
          value={isLoading ? '...' : (stats?.total_downloads || '0')}
          icon={DownloadIcon}
          color="positive"
          trend={stats?.downloads_trend && `+${stats.downloads_trend}% this month`}
        />
        
        <StatCard
          title={<Trans message="Storage Used" />}
          value={isLoading ? '...' : (stats?.total_storage ? <FormattedBytes bytes={stats.total_storage} /> : '0 B')}
          icon={StorageIcon}
          color="warning"
          subtitle={stats?.storage_limit && `of ${stats.storage_limit} limit`}
        />
        
        <StatCard
          title={<Trans message="Active Transfers" />}
          value={isLoading ? '...' : (stats?.active_transfers || '0')}
          icon={TrendingUpIcon}
          color="info"
          subtitle={<Trans message="Not expired" />}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Transfers - Takes 2 columns */}
        <div className="lg:col-span-2">
          <RecentTransfersCard />
        </div>
        
        {/* Sidebar - Takes 1 column */}
        <div className="space-y-6">
          <SystemStatusCard />
          <QuickActionsCard />
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="mt-6 rounded-panel border border-danger/20 bg-danger/5 p-4">
          <p className="text-danger text-sm">
            <Trans message="Failed to load dashboard data. Please refresh the page." />
          </p>
        </div>
      )}
    </div>
  );
}

// For lazy loading compatibility
export const Component = AdminDashboardPage;
export default AdminDashboardPage;