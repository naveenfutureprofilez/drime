import React from 'react';
import { DatatableDataQueryKey } from '@common/datatable/requests/paginated-resources';
import { DataTableEmptyStateMessage } from '@common/datatable/page/data-table-emty-state-message';
import { Trans } from '@ui/i18n/trans';
import { DataTableContext } from '@common/datatable/page/data-table-context';
import { useDeleteTransferFiles } from './requests/use-delete-transfer-files';
import { useBulkDeleteTransferFiles } from './requests/use-bulk-delete-transfer-files';
import { useCleanupTransferFiles } from './requests/use-cleanup-transfer-files';
import { Button } from '@ui/buttons/button';
import { DeleteIcon } from '@ui/icons/material/Delete';
import { DeleteSweepIcon } from '@ui/icons/material/DeleteSweep';
import { IconButton } from '@ui/buttons/icon-button';
import { Chip } from '@ui/forms/input-field/chip-field/chip';
import { Link } from 'react-router';
import { LinkIcon } from '@ui/icons/material/Link';
import { FileUploadIcon } from '@ui/icons/material/FileUpload';
import { Tooltip } from '@ui/tooltip/tooltip';
import { VisibilityIcon } from '@ui/icons/material/Visibility';
import { DownloadIcon } from '@ui/icons/material/Download';
import { SecurityIcon } from '@ui/icons/material/Security';
import { EmailIcon } from '@ui/icons/material/Email';
import { CalendarTodayIcon } from '@ui/icons/material/CalendarToday';
import { PersonIcon } from '@ui/icons/material/Person';
import { FormattedDate } from '@ui/i18n/formatted-date';
import { FormattedRelativeTime } from '@ui/i18n/formatted-relative-time';
import { useTransferFilesTable } from './hooks/use-transfer-files-table';
import { TransferFilesCustomTable } from './components/transfer-files-custom-table';

const columnConfig = [
  {
    key: 'original_filename',
    allowsSorting: true,
    header: () => <Trans message="File Details" />,
    width: 'w-80',
    body: (file) => (
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0 w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
          <FileUploadIcon className="h-5 w-5 text-primary" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="font-medium text-sm truncate">
            {file.original_filename || 'Untitled Transfer'}
          </div>
          <div className="flex items-center space-x-2 text-xs text-muted mt-1">
            <span className="font-medium">{file.formatted_size}</span>
            {file.files_count > 1 && (
              <>
                <span>•</span>
                <span>{file.files_count} files</span>
              </>
            )}
            {file.has_password && (
              <>
                <span>•</span>
                <div className="flex items-center space-x-1">
                  <SecurityIcon className="h-3 w-3" />
                  <span>Protected</span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    ),
  },
  {
    key: 'sender_recipient',
    allowsSorting: false,
    header: () => <Trans message="Sender & Recipient" />,
    width: 'w-64',
    body: (file) => (
      <div className="space-y-2">
        <div className="flex items-center space-x-2 text-sm">
          <PersonIcon className="h-4 w-4 text-muted flex-shrink-0" />
          <span className="truncate">
            {file.sender_email || <span className="text-muted italic">Anonymous</span>}
          </span>
        </div>
        {file.recipient_emails && (
          <div className="flex items-center space-x-2 text-sm">
            <EmailIcon className="h-4 w-4 text-muted flex-shrink-0" />
            <span className="truncate">{file.recipient_emails}</span>
          </div>
        )}
      </div>
    ),
  },
  {
    key: 'status',
    allowsSorting: true,
    header: () => <Trans message="Status & Activity" />,
    width: 'w-48',
    body: (file) => {
      let statusColor = 'positive';
      let statusMessage = 'Active';
      
      if (file.status === 'expired') {
        statusColor = 'danger';
        statusMessage = 'Expired';
      } else if (file.status === 'download_limit_reached') {
        statusColor = 'warning';
        statusMessage = 'Limit Reached';
      }
      
      return (
        <div className="space-y-2">
          <Chip color={statusColor} size="xs" className="font-medium">
            {statusMessage}
          </Chip>
          <div className="flex items-center space-x-2 text-xs text-muted">
            <DownloadIcon className="h-3 w-3" />
            <span>
              {file.download_count} downloads
              {file.max_downloads && <span> / {file.max_downloads}</span>}
            </span>
          </div>
        </div>
      );
    },
  },
  {
    key: 'created_at',
    allowsSorting: true,
    header: () => <Trans message="Timeline" />,
    width: 'w-48',
    body: (file) => (
    <div className="space-y-2">
  <div className="flex items-center space-x-2 text-sm">
    <CalendarTodayIcon className="h-4 w-4 text-muted flex-shrink-0 mt-0.5" /> 
    <div className="flex flex-col leading-tight">
      <span className="font-semibold">
        <FormattedDate date={file.created_at} preset="short" /> <FormattedRelativeTime date={file.created_at} />
      </span>
    </div>
  </div>

  {/* Expires at */}
  {file.expires_at && (
    <div className="text-xs text-muted ml-2">
      Expires: <FormattedDate date={file.expires_at} preset="short" />
    </div>
  )}
</div>

    ),
  },
  {
    key: 'actions',
    header: () => <Trans message="Actions" />,
    width: 'w-48',
    body: (file) => <RowActions file={file} />,
  },
];

function RowActions({ file }) {
  const deleteFiles = useDeleteTransferFiles();

  return (
    <div className="flex items-center justify-center gap-2">
      <Tooltip label={<Trans message="View details" />}>
        <IconButton
          size="sm"
          elementType={Link}
          to={`/admin/transfer-files/${file.id}`}
          className="text-muted hover:text-primary hover:bg-primary/10"
        >
          <VisibilityIcon />
        </IconButton>
      </Tooltip>
      
      <Tooltip label={<Trans message="Copy share link" />}>
        <IconButton
          size="sm"
          onClick={() => {
            navigator.clipboard.writeText(file.share_url);
          }}
          className="text-muted hover:text-info hover:bg-info/10"
        >
          <LinkIcon />
        </IconButton>
      </Tooltip>
      
      <Tooltip label={<Trans message="Delete transfer" />}>
        <IconButton
          size="sm"
          color="danger"
          onClick={() => {
            if (window.confirm(`Delete "${file.original_filename || 'this transfer'}"?\n\nThis action cannot be undone and will remove all associated files.`)) {
              deleteFiles.mutate({ id: file.id });
            }
          }}
          disabled={deleteFiles.isPending}
          className="text-danger hover:bg-danger/10"
        >
          <DeleteIcon />
        </IconButton>
      </Tooltip>
    </div>
  );
}

export function NewTransferFilesPage() {
  // Define filters
  const filters = [
    {
      key: 'status',
      label: <Trans message="Status" />,
      description: <Trans message="Filter transfers by their current status" />,
      defaultOperator: '=',
      control: {
        type: 'Select',
        defaultValue: 'all',
        options: [
          {
            key: 'all',
            label: <Trans message="All Statuses" />,
            value: '',
          },
          {
            key: 'active',
            label: <Trans message="Active" />,
            value: 'active',
          },
          {
            key: 'expired',
            label: <Trans message="Expired" />,
            value: 'expired',
          },
          {
            key: 'download_limit_reached',
            label: <Trans message="Download Limit Reached" />,
            value: 'download_limit_reached',
          },
        ],
      },
    },
    {
      key: 'has_password',
      label: <Trans message="Protection" />,
      description: <Trans message="Filter by password protection" />,
      defaultOperator: '=',
      control: {
        type: 'Select',
        defaultValue: '',
        options: [
          {
            key: 'all',
            label: <Trans message="All Transfers" />,
            value: '',
          },
          {
            key: 'protected',
            label: <Trans message="Password Protected" />,
            value: '1',
          },
          {
            key: 'unprotected',
            label: <Trans message="No Password" />,
            value: '0',
          },
        ],
      },
    },
    {
      key: 'created_at',
      label: <Trans message="Created Date" />,
      description: <Trans message="Filter by creation date" />,
      defaultOperator: '>=',
      control: {
        type: 'DatePicker',
      },
    },
  ];

  // Create empty state message component
  const emptyStateMessage = (
    <DataTableEmptyStateMessage
      image={<FileUploadIcon size="xl" className="text-muted" />}
      title={<Trans message="No transfer files found" />}
      filteringTitle={<Trans message="No transfers match your filters" />}
      description={<Trans message="Transfers will appear here once users start uploading files through your WeTransfer service." />}
    />
  );
  
  // Use custom hook for table state management
  const {
    contextValue,
    query,
    data,
    pagination,
    isFiltering,
    params,
    setParams,
    selectedRows,
    setSelectedRows,
    encodedFilters
  } = useTransferFilesTable(
    filters, 
    {}, 
    DatatableDataQueryKey('admin-transfer-files')
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Transfer Files Management
          </h1>
          <p className="text-lg text-gray-600">
            Monitor and manage all file transfers in your WeTransfer service
          </p>
        </div>

      <TransferFilesCustomTable
        filters={filters}
        columns={columnConfig}
        searchPlaceholder={<Trans message="Search by filename, sender, or recipient..." />}
        actions={<PageActions />}
        selectedActions={<SelectedItemsActions />}
        emptyStateMessage={emptyStateMessage}
        contextValue={contextValue}
        query={query}
        data={data}
        pagination={pagination}
        isFiltering={isFiltering}
        params={params}
        setParams={setParams}
        selectedRows={selectedRows}
        setSelectedRows={setSelectedRows}
        encodedFilters={encodedFilters}
      />
      </div>
    </div>
  );
}

function PageActions() {
  const cleanupFiles = useCleanupTransferFiles();
  
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Button
        variant="outline"
        color="primary"
        startIcon={<DeleteSweepIcon className="!m-0 !text-2xl me-2" />}
        onClick={() => {
          if (window.confirm('Clean up all expired transfers?\n\nThis will permanently delete all expired transfers and their files.')) {
            cleanupFiles.mutate();
          }
        }}
        disabled={cleanupFiles.isPending}
        className="hover:bg-primary/5 rounded-xl !px-3"
      >
        <p className='ms-2'>Cleanup Expired</p>
      </Button>
    </div>
  );
}

function SelectedItemsActions() {
  const { selectedRows } = React.useContext(DataTableContext);
  const bulkDeleteFiles = useBulkDeleteTransferFiles();

  if (!selectedRows?.length) return null;

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-muted">
        <Trans message=":count transfers selected" values={{ count: selectedRows.length }} />
      </span>
      <Button
        variant="flat"
        color="danger"
        startIcon={<DeleteIcon />}
        onClick={() => {
          if (window.confirm(`Delete ${selectedRows.length} selected transfers?\n\nThis action cannot be undone and will remove all associated files.`)) {
            const ids = selectedRows.map((row) => row.id);
            bulkDeleteFiles.mutate({ ids });
          }
        }}
        disabled={bulkDeleteFiles.isPending}
      >
        <Trans message="Delete Selected" />
      </Button>
    </div>
  );
}