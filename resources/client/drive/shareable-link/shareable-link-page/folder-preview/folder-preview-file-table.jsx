import React from 'react';
import { Table } from '@common/ui/tables/table';
import { linkPageState, useLinkPageStore } from '@app/drive/shareable-link/shareable-link-page/link-page-store';
import { fileTableColumns } from '@app/drive/file-view/file-table/file-table-columns';
import { useIsMobileMediaQuery } from '@ui/utils/hooks/is-mobile-media-query';
const mobileColumns = fileTableColumns.filter(config => config.key !== 'updated_at');
export function FolderPreviewFileTable({
  entries,
  onEntrySelected
}) {
  const sortDescriptor = useLinkPageStore(s => s.activeSort);
  const isMobile = useIsMobileMediaQuery();
  return <Table columns={isMobile ? mobileColumns : fileTableColumns} data={entries} sortDescriptor={sortDescriptor} onSortChange={value => {
    linkPageState().setActiveSort(value);
  }} onAction={(item, index) => {
    onEntrySelected(item, index);
  }} enableSelection={false} />;
}