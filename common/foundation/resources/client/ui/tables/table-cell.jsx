import { useContext, useMemo } from 'react';
import { TableContext } from './table-context';
import { useTableCellStyle } from '@common/ui/tables/style/use-table-cell-style';
export function TableCell({
  rowIndex,
  rowIsHovered,
  index,
  item,
  id
}) {
  const {
    columns
  } = useContext(TableContext);
  const column = columns[index];
  const rowContext = useMemo(() => {
    return {
      index: rowIndex,
      isHovered: rowIsHovered,
      isPlaceholder: item.isPlaceholder
    };
  }, [rowIndex, rowIsHovered, item.isPlaceholder]);
  const style = useTableCellStyle({
    index: index,
    isHeader: false
  });
  return <div tabIndex={-1} role="gridcell" aria-colindex={index + 1} id={id} className={style}>
    <div className="w-full overflow-hidden overflow-ellipsis">
      {column.body(item, rowContext)}
    </div>
  </div>;
}