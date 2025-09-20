import clsx from 'clsx';
import { useContext } from 'react';
import { TableContext } from '@common/ui/tables/table-context';
export function useTableCellStyle({
  index,
  isHeader
}) {
  const {
    columns,
    cellHeight = 'h-24',
    headerCellHeight = 'h-24'
  } = useContext(TableContext);
  const column = columns[index];
  const userPadding = column?.padding;
  let justify = 'justify-start';
  if (column?.align === 'center') {
    justify = 'justify-center';
  } else if (column?.align === 'end') {
    justify = 'justify-end';
  }
  return clsx('flex items-center whitespace-nowrap overflow-ellipsis outline-none focus-visible:outline focus-visible:outline-offset-2', isHeader ? headerCellHeight : cellHeight, column?.width ?? 'flex-1', column?.maxWidth, column?.minWidth, justify, userPadding, column?.className);
}