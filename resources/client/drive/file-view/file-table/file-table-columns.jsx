import { Trans } from '@ui/i18n/trans';
import { FormattedDate } from '@ui/i18n/formatted-date';
import React, { useContext } from 'react';
import memoize from 'nano-memoize';
import { TableContext } from '@common/ui/tables/table-context';
import { Checkbox } from '@ui/forms/toggle/checkbox';
import { EntryActionMenuTrigger } from '@app/drive/entry-actions/entry-action-menu-trigger';
import { IconButton } from '@ui/buttons/icon-button';
import { MoreVertIcon } from '@ui/icons/material/MoreVert';
import clsx from 'clsx';
import { prettyBytes } from '@ui/utils/files/pretty-bytes';
import { FileThumbnail } from '@common/uploads/components/file-type-icon/file-thumbnail';
const formatFileSize = memoize(bytes => {
  return prettyBytes(bytes);
});
export const fileTableColumns = [{
  key: 'name',
  allowsSorting: true,
  header: () => <Trans message="Name" />,
  visibleInMode: 'all',
  width: 'flex-3 min-w-200',
  body: entry => <FileNameColumn entry={entry} />
}, {
  key: 'updated_at',
  allowsSorting: true,
  maxWidth: 'max-w-184',
  header: () => <Trans message="Last modified" />,
  body: user => <FormattedDate date={user.updated_at} />
}, {
  key: 'file_size',
  allowsSorting: true,
  header: () => <Trans message="Size" />,
  maxWidth: 'max-w-144',
  body: entry => formatFileSize(entry.file_size) ?? '-'
}, {
  key: 'actions',
  hideHeader: true,
  header: () => <Trans message="Actions" />,
  align: 'end',
  width: 'w-42 flex-shrink-0',
  visibleInMode: 'all',
  body: entry => <ActionsColumn entry={entry} />
}];
function FileNameColumn({
  entry
}) {
  const {
    isCollapsedMode
  } = useContext(TableContext);
  const sizeClassName = isCollapsedMode ? 'w-30 h-30' : 'w-24 h-24';
  return <div className="flex items-center gap-14">
      <FileThumbnail className={clsx('rounded', sizeClassName)} iconClassName={sizeClassName} file={entry} />
      <div className="min-w-0">
        <div className="overflow-hidden overflow-ellipsis">{entry.name}</div>
        {isCollapsedMode && <div className="mt-4 flex items-center text-xs text-muted">
            <FormattedDate date={entry.updated_at} />
            <div>·</div>
            <div>{formatFileSize(entry.file_size)}</div>
          </div>}
      </div>
    </div>;
}
function ActionsColumn({
  entry
}) {
  const {
    selectedRows
  } = useContext(TableContext);
  return selectedRows.length ? <Checkbox className="mr-8 block" checked={selectedRows.includes(entry.id)} /> : <EntryActionMenuTrigger entries={[entry]}>
      <IconButton className="text-muted">
        <MoreVertIcon />
      </IconButton>
    </EntryActionMenuTrigger>;
}