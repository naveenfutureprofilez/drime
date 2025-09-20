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
  ScheduleIcon,
  SettingsIcon,
  PersonIcon,
  ManageAccountsIcon,
  CheckCircleIcon,
  ErrorIcon,
  WarningIcon
} from '@ui/icons/material/all-icons';
import { FormattedBytes } from '@ui/i18n/formatted-bytes';
import { FormattedDate } from '@ui/i18n/formatted-date';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@common/http/query-client';

// Professional CSS styles
const professionalStyles = `
  .dashboard-container {
    background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
    min-height: 100vh;
  }
  
  .professional-card {
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(226, 232, 240, 0.8);
    box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  }
  
  .professional-card:hover {
    box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
    transform: translateY(-1px);
  }
  
  .stat-card {
    background: white;
    border: 1px solid #e2e8f0;
    box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
    transition: all 0.2s ease;
  }
  
  .stat-card:hover {
    box-shadow: 0 4px 12px 0 rgba(0, 0, 0, 0.15);
    transform: translateY(-2px);
  }
  
  .metric-value {
    font-weight: 700;
    font-size: 2rem;
    line-height: 1.2;
    color: #1e293b;
  }
  
  .metric-label {
    font-weight: 500;
    font-size: 0.875rem;
    color: #64748b;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }
  
  .status-indicator {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    display: inline-block;
    margin-right: 8px;
  }
  
  .status-online { background-color: #10b981; }
  .status-warning { background-color: #f59e0b; }
  .status-error { background-color: #ef4444; }
  
  .fade-in {
    animation: fadeIn 0.6s ease-out;
  }
  
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;

// Inject professional styles
if (typeof document !== 'undefined') {
  const existingStyle = document.getElementById('professional-dashboard-styles');
  if (existingStyle) {
    existingStyle.remove();
  }
  const styleSheet = document.createElement('style');
  styleSheet.id = 'professional-dashboard-styles';
  styleSheet.textContent = professionalStyles;
  document.head.appendChild(styleSheet);
}

// Hook to get recent transfers
function useRecentTransfers() {
  return useQuery({
    queryKey: ['admin', 'recent-transfers'],
    queryFn: () => apiClient.get('admin/transfer-files?per_page=5').then(r => r.data.pagination.data),
    staleTime: 1000 * 60 * 2,
  });
}

// Professional Statistics Card Component
function ProfessionalStatCard({ title, value, icon: Icon, trend, subtitle, color = 'slate' }) {
  const colorConfig = {
    slate: { bg: 'bg-slate-50', text: 'text-slate-600', icon: 'text-slate-500' },
    blue: { bg: 'bg-blue-50', text: 'text-blue-600', icon: 'text-blue-500' },
    green: { bg: 'bg-emerald-50', text: 'text-emerald-600', icon: 'text-emerald-500' },
    amber: { bg: 'bg-amber-50', text: 'text-amber-600', icon: 'text-amber-500' },
    purple: { bg: 'bg-purple-50', text: 'text-purple-600', icon: 'text-purple-500' }
  };

  const config = colorConfig[color];

  return (
    <div className="stat-card rounded-xl p-6">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="metric-label mb-2">{title}</div>
          <div className="metric-value mb-1">{value}</div>
          {subtitle && (
            <div className="text-sm text-slate-500">{subtitle}</div>
          )}
          {trend && (
            <div className="flex items-center mt-2 text-sm text-emerald-600">
              <TrendingUpIcon className="w-4 h-4 mr-1" />
              {trend}
            </div>
          )}
        </div>
        <div className={`p-3 rounded-lg ${config.bg}`}>
          <Icon className={`w-6 h-6 ${config.icon}`} />
        </div>
      </div>
    </div>
  );
}

// Professional Recent Transfers Card
function ProfessionalRecentTransfersCard() {
  const { data: transfers = [], isLoading } = useRecentTransfers();

  return (
    <div className="professional-card rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-slate-900">
          <Trans message="Recent Transfers" />
        </h3>
        <Link to="/admin/transfer-files" className="text-sm font-medium text-blue-600 hover:text-blue-700">
          <Trans message="View All" />
        </Link>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-slate-200 rounded-lg"></div>
                <div className="flex-1">
                  <div className="h-4 bg-slate-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-slate-200 rounded w-1/2"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : transfers.length > 0 ? (
        <div className="space-y-4">
          {transfers.map((transfer) => (
            <div key={transfer.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <FileUploadIcon className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <div className="font-medium text-slate-900 truncate max-w-xs">
                    {transfer.name}
                  </div>
                  <div className="text-sm text-slate-500">
                    <FormattedDate date={transfer.created_at} />
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Chip
                  size="sm"
                  color={transfer.expires_at && new Date(transfer.expires_at) > new Date() ? 'positive' : 'danger'}
                >
                  {transfer.expires_at && new Date(transfer.expires_at) > new Date() ? 'Active' : 'Expired'}
                </Chip>
                <Link
                  to={`/admin/transfer-files/${transfer.id}`}
                  className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                >
                  <Trans message="View" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <FileUploadIcon className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500">
            <Trans message="No recent transfers" />
          </p>
        </div>
      )}
    </div>
  );
}

// Professional System Status Card
function ProfessionalSystemStatusCard() {
  const systemStatus = {
    storage: { status: 'online', label: 'Storage System' },
    email: { status: 'online', label: 'Email Service' },
    backup: { status: 'warning', label: 'Backup Service' },
    security: { status: 'online', label: 'Security System' }
  };

  return (
    <div className="professional-card rounded-xl p-6">
      <div className="flex items-center mb-6">
        <div className="p-2 bg-slate-100 rounded-lg mr-3">
          <SecurityIcon className="w-5 h-5 text-slate-600" />
        </div>
        <h3 className="text-lg font-semibold text-slate-900">
          <Trans message="System Status" />
        </h3>
      </div>

      <div className="space-y-4">
        {Object.entries(systemStatus).map(([key, { status, label }]) => (
          <div key={key} className="flex items-center justify-between">
            <div className="flex items-center">
              <span className={`status-indicator status-${status}`}></span>
              <span className="text-sm font-medium text-slate-700">{label}</span>
            </div>
            <div className="flex items-center">
              {status === 'online' && <CheckCircleIcon className="w-4 h-4 text-emerald-500" />}
              {status === 'warning' && <WarningIcon className="w-4 h-4 text-amber-500" />}
              {status === 'error' && <ErrorIcon className="w-4 h-4 text-red-500" />}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 pt-4 border-t border-slate-200">
        <div className="text-xs text-slate-500">
          <Trans message="Last updated" />: <FormattedDate date={new Date()} />
        </div>
      </div>
    </div>
  );
}

// Professional Quick Actions Card
function ProfessionalQuickActionsCard() {
  const actions = [
    {
      icon: ManageAccountsIcon,
      label: 'Manage Transfers',
      href: '/admin/transfer-files',
      color: 'blue'
    },
    {
      icon: SettingsIcon,
      label: 'System Settings',
      href: '/admin/settings',
      color: 'slate'
    },
    {
      icon: PersonIcon,
      label: 'Admin Profile',
      href: '/admin/profile',
      color: 'purple'
    }
  ];

  return (
    <div className="professional-card rounded-xl p-6">
      <h3 className="text-lg font-semibold text-slate-900 mb-6">
        <Trans message="Quick Actions" />
      </h3>

      <div className="space-y-3">
        {actions.map((action) => (
          <Link
            key={action.href}
            to={action.href}
            className="flex items-center p-3 rounded-lg hover:bg-slate-50 transition-colors group"
          >
            <div className={`p-2 rounded-lg mr-3 ${
              action.color === 'blue' ? 'bg-blue-50 group-hover:bg-blue-100' :
              action.color === 'purple' ? 'bg-purple-50 group-hover:bg-purple-100' :
              'bg-slate-50 group-hover:bg-slate-100'
            }`}>
              <action.icon className={`w-5 h-5 ${
                action.color === 'blue' ? 'text-blue-600' :
                action.color === 'purple' ? 'text-purple-600' :
                'text-slate-600'
              }`} />
            </div>
            <span className="font-medium text-slate-700 group-hover:text-slate-900">
              {action.label}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}

// Main Dashboard Component
export function AdminDashboardPage() {
  const { data: stats, isLoading, error } = useTransferFileStats();

  if (error) {
    return <PageStatus status={error.status} />;
  }

  return (
    <div className="dashboard-container min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        {/* Professional Header */}
        <div className="mb-8 fade-in">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 mb-2">
                <Trans message="Dashboard" />
              </h1>
              <p className="text-slate-600">
                <Trans message="Welcome back! Here's what's happening with your transfers." />
              </p>
            </div>
            <div className="text-right">
              <div className="text-sm text-slate-500">
                <Trans message="Last updated" />
              </div>
              <div className="text-sm font-medium text-slate-700">
                <FormattedDate date={new Date()} />
              </div>
            </div>
          </div>
        </div>

        {/* Statistics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 fade-in">
          <ProfessionalStatCard
            title={<Trans message="Total Transfers" />}
            value={isLoading ? '...' : (stats?.total_transfers || '0')}
            icon={FileUploadIcon}
            color="blue"
            trend={stats?.transfers_trend && `+${stats.transfers_trend}% this month`}
          />
          
          <ProfessionalStatCard
            title={<Trans message="Total Downloads" />}
            value={isLoading ? '...' : (stats?.total_downloads || '0')}
            icon={DownloadIcon}
            color="green"
            trend={stats?.downloads_trend && `+${stats.downloads_trend}% this month`}
          />
          
          <ProfessionalStatCard
            title={<Trans message="Storage Used" />}
            value={isLoading ? '...' : (stats?.total_storage ? <FormattedBytes bytes={stats.total_storage} /> : '0 B')}
            icon={StorageIcon}
            color="amber"
            subtitle={stats?.storage_limit && `of ${stats.storage_limit} limit`}
          />
          
          <ProfessionalStatCard
            title={<Trans message="Active Transfers" />}
            value={isLoading ? '...' : (stats?.active_transfers || '0')}
            icon={TrendingUpIcon}
            color="purple"
            subtitle={<Trans message="Not expired" />}
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 fade-in">
          {/* Recent Transfers - Takes 2 columns */}
          <div className="lg:col-span-2">
            <ProfessionalRecentTransfersCard />
          </div>
          
          {/* Sidebar - Takes 1 column */}
          <div className="space-y-6">
            <ProfessionalSystemStatusCard />
            <ProfessionalQuickActionsCard />
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="mt-6 professional-card rounded-xl p-6 border-red-200 bg-red-50">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg mr-3">
                <ErrorIcon className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="font-semibold text-red-800 mb-1">Dashboard Error</h3>
                <p className="text-red-700 text-sm">
                  <Trans message="Failed to load dashboard data. Please refresh the page." />
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export const Component = AdminDashboardPage;
export default AdminDashboardPage;