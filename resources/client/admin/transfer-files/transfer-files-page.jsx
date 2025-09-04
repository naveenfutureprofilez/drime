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

const columnConfig = [
  {
    key: 'original_filename',
    allowsSorting: true,
    header: () => <Trans message="File Name" />,
    body: (file) => (
      <div>
        <div className="font-medium">
          {file.original_filename || 'Untitled'}
        </div>
        <div className="text-sm text-muted">
          {file.formatted_size}
          {file.files_count > 1 && <span> • {file.files_count} files</span>}
          {file.has_password && <span> • 🔒 Protected</span>}
        </div>
      </div>
    ),
  },
  {
    key: 'title',
    allowsSorting: false,
    header: () => <Trans message="Title" />,
    body: (file) => (
      <div className="text-sm">
        {file.title || <span className="text-muted">No title</span>}
      </div>
    ),
  },
  {
    key: 'recipient_emails',
    allowsSorting: false,
    header: () => <Trans message="Recipient Email" />,
    body: (file) => (
      <div className="text-sm">
        {file.recipient_emails || <span className="text-muted">No recipient</span>}
      </div>
    ),
  },
  {
    key: 'message',
    allowsSorting: false,
    header: () => <Trans message="Message" />,
    body: (file) => (
      <div className="text-sm">
        {file.message ? (
          <Tooltip label={file.message}>
            <div className="truncate ">
              {file.message}
            </div>
          </Tooltip>
        ) : (
          <span className="text-muted">No message</span>
        )}
      </div>
    ),
  },
  {
    key: 'sender_email',
    allowsSorting: false,
    header: () => <Trans message="Sender" />,
    body: (file) => (
      <div className="text-sm">
        {file.sender_email || <span className="text-muted">Anonymous</span>}
      </div>
    ),
  },
  {
    key: 'status',
    allowsSorting: false,
    header: () => <Trans message="Status" />,
    body: (file) => {
      let color = 'positive';
      let message = 'Active';
      
      if (file.status === 'expired') {
        color = 'danger';
        message = 'Expired';
      } else if (file.status === 'download_limit_reached') {
        color = 'warning';
        message = 'Limit Reached';
      }
      
      return <Chip color={color} size="xs">{message}</Chip>;
    },
  },
  {
    key: 'download_count',
    allowsSorting: true,
    header: () => <Trans message="Downloads" />,
    body: (file) => (
      <div className="text-sm">
        {file.download_count}
        {file.max_downloads && <span className="text-muted"> / {file.max_downloads}</span>}
      </div>
    ),
  },
  {
    key: 'created_at',
    allowsSorting: true,
    header: () => <Trans message="Created" />,
    body: (file) => (
      <div className="text-sm">
        {file.created_at ? new Date(file.created_at).toLocaleDateString('en-US') : '-'}
      </div>
    ),
  },
  {
    key: 'expires_at',
    allowsSorting: true,
    header: () => <Trans message="Expires" />,
    body: (file) => (
      <div className="text-sm">
        {file.expires_at ? (
          new Date(file.expires_at).toLocaleDateString('en-US')
        ) : (
          <span className="text-muted">Never</span>
        )}
      </div>
    ),
  },
  {
    key: 'actions',
    header: () => <Trans message="Actions" />,
    hideHeader: true,
    align: 'end',
    body: (file) => <RowActions file={file} />,
  },
];

function RowActions({ file }) {
  const deleteFiles = useDeleteTransferFiles();

  return (
    <div className="flex items-center gap-4">
      <IconButton
        size="md"
        elementType={Link}
        to={file.share_url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-primary hover:bg-primary/10"
      >
        <LinkIcon />
      </IconButton>
      
      <IconButton
        size="md"
        color="danger"
        onClick={() => {
          if (window.confirm(`Delete "${file.original_filename}"?\n\nThis action cannot be undone.`)) {
            deleteFiles.mutate({ id: file.id });
          }
        }}
        disabled={deleteFiles.isPending}
        className="text-danger hover:bg-danger/10"
      >
        <DeleteIcon />
      </IconButton>
    </div>
  );
}

export function TransferFilesPage() {

  return (
   <>
    <DataTablePage
      endpoint="admin/transfer-files"
      title={<Trans message="Transfer Files " />}
      queryKey={DatatableDataQueryKey('admin-transfer-files')}
      columns={columnConfig}
      searchPlaceholder={<Trans message="Search files..." />}
      filters={[
        {
          key: 'status',
          label: <Trans message="Status" />,
          description: <Trans message="Filter by file status" />,
          defaultOperator: '=',
          control: {
            type: 'Select',
            defaultValue: 'active',
            options: [
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
            ],
          },
        },
      ]}
      actions={<PageActions />}
      selectedActions={<SelectedItemsActions />}
      emptyStateMessage={
        <DataTableEmptyStateMessage
          image={<FileUploadIcon size="xl" className="text-muted" />}
          title={<Trans message="No transfer files uploaded yet" />}
          filteringTitle={<Trans message="No matching files" />}
        />
      }
    />
   </>
  );
}

function PageActions() {
  const cleanupFiles = useCleanupTransferFiles();

  return (
    <div className="flex items-center gap-8">
      <Button
        variant="flat"
        color="primary"
        startIcon={<DeleteSweepIcon />}
        onClick={() => cleanupFiles.mutate()}
        disabled={cleanupFiles.isPending}
      >
        <Trans message="Cleanup Expired" />
      </Button>
    </div>
  );
}

function SelectedItemsActions() {
  const { selectedRows } = React.useContext(DataTableContext);
  console.log("selectedRows", selectedRows)
  const bulkDeleteFiles = useBulkDeleteTransferFiles();

  return (
    <Button
      variant="flat"
      color="danger"
      startIcon={<DeleteIcon />}
      onClick={() => {
        const ids = selectedRows.map((row) => row.id);
        bulkDeleteFiles.mutate({ ids });
      }}
      disabled={bulkDeleteFiles.isPending}
    >
      <Trans message="Delete selected" />
    </Button>
  );
}

