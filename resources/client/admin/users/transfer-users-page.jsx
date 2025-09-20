import React, { Fragment } from 'react';
import { DataTablePage } from '@common/datatable/page/data-table-page';
import { Trans } from '@ui/i18n/trans';
import { DeleteSelectedItemsAction } from '@common/datatable/page/delete-selected-items-action';
import { DataTableEmptyStateMessage } from '@common/datatable/page/data-table-emty-state-message';
import { DataTableAddItemButton } from '@common/datatable/data-table-add-item-button';
import { DataTableExportCsvButton } from '@common/datatable/csv-export/data-table-export-csv-button';
import { DialogTrigger } from '@ui/overlays/dialog/dialog-trigger';
import { CreateUserDialog } from '@common/admin/users/create-user-dialog';
import { NameWithAvatar } from '@common/datatable/column-templates/name-with-avatar';
import { FormattedDate } from '@ui/i18n/formatted-date';
import { FormattedBytes } from '@ui/i18n/formatted-bytes';
import { Tooltip } from '@ui/tooltip/tooltip';
import { IconButton } from '@ui/buttons/icon-button';
import { EditIcon } from '@ui/icons/material/Edit';
import { PersonOffIcon } from '@ui/icons/material/PersonOff';
import { LoginIcon } from '@ui/icons/material/Login';
import { CloudUploadIcon } from '@ui/icons/material/CloudUpload';
import { ShareIcon } from '@ui/icons/material/Share';
import { DownloadIcon } from '@ui/icons/material/Download';
import { Link } from 'react-router';
import { Chip } from '@ui/forms/input-field/chip-field/chip';
import { ChipList } from '@ui/forms/input-field/chip-field/chip-list';
import { Badge } from '@ui/badge/badge';
import { Button } from '@ui/buttons/button';
import { FilterAltIcon } from '@ui/icons/material/FilterAlt';
import { SearchIcon } from '@ui/icons/material/Search';
import { TextField } from '@ui/forms/input-field/text-field/text-field';
import { Select } from '@ui/forms/select/select';
import { Item } from '@ui/forms/listbox/item';
import { DateRangeIcon } from '@ui/icons/material/DateRange';
import teamSvg from '@common/admin/roles/team.svg';

const transferUserColumns = [
  {
    key: 'name',
    allowsSorting: true,
    sortingKey: 'email',
    width: 'flex-3 min-w-200',
    visibleInMode: 'all',
    header: () => <Trans message="User" />,
    body: user => (
      <NameWithAvatar 
        image={user.image} 
        label={user.name || user.email} 
        description={user.email}
        alwaysShowAvatar 
        avatarCircle 
      />
    )
  },
  {
    key: 'transfer_stats',
    header: () => <Trans message="Transfer Activity" />,
    width: 'w-200',
    body: user => (
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-xs">
          <CloudUploadIcon className="text-primary icon-sm" />
          <span>{user.transfers_count || 0} transfers</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted">
          <FormattedBytes bytes={user.total_upload_size || 0} />
          <span>uploaded</span>
        </div>
      </div>
    )
  },
  {
    key: 'recent_activity',
    header: () => <Trans message="Recent Activity" />,
    width: 'w-160',
    body: user => (
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-xs">
          <ShareIcon className="text-success icon-sm" />
          <span>{user.shares_count || 0} shares</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted">
          <DownloadIcon className="text-info icon-sm" />
          <span>{user.downloads_count || 0} downloads</span>
        </div>
      </div>
    )
  },
  {
    key: 'status',
    header: () => <Trans message="Status" />,
    width: 'w-120',
    body: user => {
      const isActive = user.last_login && new Date(user.last_login.created_at) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      return (
        <Badge 
          variant={isActive ? 'positive' : 'outline'}
          className="capitalize"
        >
          {isActive ? 'Active' : 'Inactive'}
        </Badge>
      );
    }
  },
  {
    key: 'last_transfer',
    allowsSorting: true,
    header: () => <Trans message="Last Transfer" />,
    width: 'w-140',
    body: user => user.last_transfer_at ? (
      <time>
        <FormattedDate date={user.last_transfer_at} />
      </time>
    ) : (
      <span className="text-muted">Never</span>
    )
  },
  {
    key: 'created_at',
    allowsSorting: true,
    width: 'w-120',
    header: () => <Trans message="Joined" />,
    body: user => (
      <time>
        <FormattedDate date={user.created_at} />
      </time>
    )
  },
  {
    key: 'actions',
    header: () => <Trans message="Actions" />,
    width: 'w-128 flex-shrink-0',
    hideHeader: true,
    align: 'end',
    visibleInMode: 'all',
    body: user => (
      <div className="text-muted flex items-center">
        <Link to={`/admin/users/${user.id}/details`}>
          <Tooltip label={<Trans message="Edit user" />}>
            <IconButton size="md">
              <EditIcon />
            </IconButton>
          </Tooltip>
        </Link>
        <Link to={`/admin/transfer-files?user_id=${user.id}`}>
          <Tooltip label={<Trans message="View transfers" />}>
            <IconButton size="md">
              <CloudUploadIcon />
            </IconButton>
          </Tooltip>
        </Link>
        <Tooltip label={<Trans message="Suspend user" />}>
          <IconButton size="md">
            <PersonOffIcon />
          </IconButton>
        </Tooltip>
      </div>
    )
  }
];

const TransferUserFilters = [
  {
    key: 'email',
    label: <Trans message="Email" />,
    description: <Trans message="Find users by email address" />,
    defaultOperator: 'has',
    control: {
      type: 'input',
      inputType: 'text',
      placeholder: 'Enter email...'
    }
  },
  {
    key: 'status',
    label: <Trans message="Status" />,
    description: <Trans message="Filter by user activity status" />,
    defaultOperator: '=',
    control: {
      type: 'select',
      defaultValue: 'all',
      options: [
        { key: 'all', label: <Trans message="All users" />, value: 'all' },
        { key: 'active', label: <Trans message="Active users" />, value: 'active' },
        { key: 'inactive', label: <Trans message="Inactive users" />, value: 'inactive' }
      ]
    }
  },
  {
    key: 'has_transfers',
    label: <Trans message="Transfer Activity" />,
    description: <Trans message="Filter by transfer activity" />,
    defaultOperator: '=',
    control: {
      type: 'select',
      defaultValue: 'all',
      options: [
        { key: 'all', label: <Trans message="All users" />, value: 'all' },
        { key: 'with_transfers', label: <Trans message="Users with transfers" />, value: 'with_transfers' },
        { key: 'without_transfers', label: <Trans message="Users without transfers" />, value: 'without_transfers' }
      ]
    }
  },
  {
    key: 'created_at',
    label: <Trans message="Registration Date" />,
    description: <Trans message="Filter by user registration date" />,
    defaultOperator: '=',
    control: {
      type: 'date'
    }
  }
];

export function TransferUsersPage() {
  return (
    <Fragment>
      <DataTablePage
        endpoint="users"
        title={<Trans message="Transfer Service Users" />}
        filters={TransferUserFilters}
        columns={transferUserColumns}
        actions={<Actions />}
        queryParams={{
          with: 'lastLogin',
          withCount: 'transfers,shares,downloads',
          orderBy: 'created_at',
          orderDir: 'desc'
        }}
        selectedActions={<DeleteSelectedItemsAction />}
        emptyStateMessage={
          <DataTableEmptyStateMessage
            image={teamSvg}
            title={<Trans message="No users found" />}
            filteringTitle={<Trans message="No matching users" />}
          />
        }
      />
    </Fragment>
  );
}

function Actions() {
  return (
    <Fragment>
      <DataTableExportCsvButton endpoint="users/csv/export" />
      <DialogTrigger type="modal">
        <DataTableAddItemButton>
          <Trans message="Add new user" />
        </DataTableAddItemButton>
        <CreateUserDialog />
      </DialogTrigger>
    </Fragment>
  );
}