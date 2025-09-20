import React from 'react';
import { DatatableDataQueryKey } from '@common/datatable/requests/paginated-resources';
import { DataTablePage } from '@common/datatable/page/data-table-page';
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
          {file.title && (
            <div className="text-xs text-muted mt-1 truncate">
              Title: {file.title}
            </div>
          )}
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
          <CalendarTodayIcon className="h-4 w-4 text-muted flex-shrink-0" />
          <div>
            <div className="font-medium">
              <FormattedDate date={file.created_at} preset="short" />
            </div>
            <div className="text-xs text-muted">
              <FormattedRelativeTime date={file.created_at} />
            </div>
          </div>
        </div>
        {file.expires_at && (
          <div className="text-xs text-muted">
            Expires: <FormattedDate date={file.expires_at} preset="short" />
          </div>
        )}
      </div>
    ),
  },
  {
    key: 'message',
    allowsSorting: false,
    header: () => <Trans message="Message" />,
    width: 'w-64',
    body: (file) => (
      <div className="text-sm">
        {file.message ? (
          <Tooltip label={file.message}>
            <div className="truncate max-w-xs p-2 bg-alt/30 rounded text-xs">
              {file.message}
            </div>
          </Tooltip>
        ) : (
          <span className="text-muted italic text-xs">No message</span>
        )}
      </div>
    ),
  },
  {
    key: 'actions',
    header: () => <Trans message="Actions" />,
    hideHeader: true,
    align: 'end',
    width: 'w-32',
    body: (file) => <RowActions file={file} />,
  },
];

function RowActions({ file }) {
  const deleteFiles = useDeleteTransferFiles();

  return (
    <div className="flex items-center gap-2">
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
            // You might want to show a toast notification here
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

export function TransferFilesPage() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          <Trans message="Transfer Files Management" />
        </h1>
        <p className="text-gray-600">
          <Trans message="Monitor and manage all file transfers in your WeTransfer service" />
        </p>
      </div>

      <DataTablePage
        endpoint="admin/transfer-files"
        title={<Trans message="All Transfers" />}
        queryKey={DatatableDataQueryKey('admin-transfer-files')}
        columns={columnConfig}
        searchPlaceholder={<Trans message="Search by filename, sender, or recipient..." />}
        filters={[
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
        ]}
        actions={<PageActions />}
        selectedActions={<SelectedItemsActions />}
        emptyStateMessage={
          <DataTableEmptyStateMessage
            image={<FileUploadIcon size="xl" className="text-muted" />}
            title={<Trans message="No transfer files found" />}
            filteringTitle={<Trans message="No transfers match your filters" />}
            description={<Trans message="Transfers will appear here once users start uploading files through your WeTransfer service." />}
          />
        }
      />
    </div>
  );
}

function PageActions() {
  const cleanupFiles = useCleanupTransferFiles();
  
  return (
    <div className="flex items-center gap-3">
      <Button
        variant="outline"
        color="primary"
        startIcon={<DeleteSweepIcon />}
        onClick={() => {
          if (window.confirm('Clean up all expired transfers?\n\nThis will permanently delete all expired transfers and their files.')) {
            cleanupFiles.mutate();
          }
        }}
        disabled={cleanupFiles.isPending}
        className="hover:bg-primary/5"
      >
        <Trans message="Cleanup Expired" />
      </Button>
      
      <Button
        variant="flat"
        color="primary"
        elementType={Link}
        to="/admin"
        startIcon={<VisibilityIcon />}
      >
        <Trans message="Dashboard" />
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

