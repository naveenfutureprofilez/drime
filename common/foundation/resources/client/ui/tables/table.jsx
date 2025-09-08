import React, { cloneElement, Fragment, useCallback, useContext, useMemo } from 'react';
import { useControlledState } from '@react-stately/utils';
import { useGridNavigation } from './navigate-grid';
import { TableRow } from './table-row';
import { TableContext } from './table-context';
import clsx from 'clsx';
import { useInteractOutside } from '@react-aria/interactions';
import { mergeProps, useObjectRef } from '@react-aria/utils';
import { isCtrlKeyPressed } from '@ui/utils/keybinds/is-ctrl-key-pressed';
import { useIsMobileMediaQuery } from '@ui/utils/hooks/is-mobile-media-query';
import { CheckboxColumnConfig } from '@common/ui/tables/checkbox-column-config';
import { TableHeaderRow } from '@common/ui/tables/table-header-row';
export function Table({
  className,
  columns: userColumns,
  collapseOnMobile = true,
  hideHeaderRow = false,
  hideBorder = false,
  data,
  selectedRows: propsSelectedRows,
  defaultSelectedRows: propsDefaultSelectedRows,
  onSelectionChange: propsOnSelectionChange,
  sortDescriptor: propsSortDescriptor,
  onSortChange: propsOnSortChange,
  enableSorting = true,
  onDelete,
  enableSelection = true,
  selectionStyle = 'checkbox',
  ariaLabelledBy,
  selectRowOnContextMenu,
  onAction,
  renderRowAs,
  tableBody,
  meta,
  tableRef: propsTableRef,
  closeOnInteractOutside = false,
  cellHeight,
  headerCellHeight,
  ...domProps
}) {
  // const isMobile = useIsMobileMediaQuery();
  // const isCollapsedMode = !!isMobile && collapseOnMobile;
  // if (isCollapsedMode) {
  //   hideHeaderRow = true;
  //   hideBorder = true;
  // }
  const [selectedRows, onSelectionChange] = useControlledState(propsSelectedRows, propsDefaultSelectedRows || [], propsOnSelectionChange);
  const [sortDescriptor, onSortChange] = useControlledState(propsSortDescriptor, undefined, propsOnSortChange);
  const toggleRow = useCallback(item => {
    const newValues = [...selectedRows];
    if (!newValues.includes(item.id)) {
      newValues.push(item.id);
    } else {
      const index = newValues.indexOf(item.id);
      newValues.splice(index, 1);
    }
    onSelectionChange(newValues);
  }, [selectedRows, onSelectionChange]);
  const selectRow = useCallback(
    // allow deselecting all rows by passing in null
    (item, merge) => {
      let newValues = [];
      if (item) {
        newValues = merge ? [...selectedRows?.filter(id => id !== item.id), item.id] : [item.id];
      }
      onSelectionChange(newValues);
    }, [selectedRows, onSelectionChange]);

  const columns = useMemo(() => {
    const filteredColumns = (userColumns || []).filter(c => {
      const visibleInMode = c.visibleInMode || 'regular';
      if (visibleInMode === 'all') {
        return true;
      }
      if (visibleInMode === 'compact') {
        return true;
      }
      if (visibleInMode === 'regular') {
        return true;
      }
    });
    const showCheckboxCell = enableSelection && selectionStyle !== 'highlight';
    if (showCheckboxCell) {
      filteredColumns.unshift(CheckboxColumnConfig);
    }
    return filteredColumns;
  }, [userColumns, enableSelection, selectionStyle,]);
  const contextValue = {
    cellHeight,
    headerCellHeight,
    hideBorder,
    hideHeaderRow,
    selectedRows,
    onSelectionChange,
    enableSorting,
    enableSelection,
    selectionStyle,
    data,
    columns,
    sortDescriptor,
    onSortChange,
    toggleRow,
    selectRow,
    onAction,
    selectRowOnContextMenu,
    meta,
    collapseOnMobile
  };
  const navProps = useGridNavigation({
    cellCount: enableSelection ? columns.length + 1 : columns.length,
    rowCount: (data || []).length + 1
  });
  const tableBodyProps = {
    renderRowAs: renderRowAs
  };
  if (!tableBody) {
    tableBody = <BasicTableBody {...tableBodyProps} />;
  } else {
    tableBody = cloneElement(tableBody, tableBodyProps);
  }

  // deselect rows when clicking outside the table
  const tableRef = useObjectRef(propsTableRef);
  useInteractOutside({
    ref: tableRef,
    onInteractOutside: e => {
      if (closeOnInteractOutside && enableSelection && selectedRows?.length &&
        // don't deselect if clicking on a dialog (for example is table row has a context menu)
        !e.target.closest('[role="dialog"]')) {
        onSelectionChange([]);
      }
    }
  });
  return <TableContext.Provider value={contextValue}>
    <div {...mergeProps(domProps, navProps, {
      onKeyDown: e => {
        if (e.key === 'Escape') {
          e.preventDefault();
          e.stopPropagation();
          if (selectedRows?.length) {
            onSelectionChange([]);
          }
        } else if (e.key === 'Delete') {
          e.preventDefault();
          e.stopPropagation();
          if (selectedRows?.length) {
            onDelete?.(data.filter(item => selectedRows?.includes(item.id)));
          }
        } else if (isCtrlKeyPressed(e) && e.key === 'a') {
          e.preventDefault();
          e.stopPropagation();
          if (enableSelection) {
            onSelectionChange(data.map(item => item.id));
          }
        }
      }
    })} role="grid" tabIndex={0} aria-rowcount={(data || []).length + 1} aria-colcount={columns.length + 1} ref={tableRef} aria-multiselectable={enableSelection ? true : undefined} aria-labelledby={ariaLabelledBy} className={clsx(className, 'isolate select-none text-sm outline-none focus-visible:ring-2')}>
      {!hideHeaderRow && <TableHeaderRow />}
      {tableBody}
    </div>
  </TableContext.Provider>;
}
function BasicTableBody({
  renderRowAs
}) {
  const {
    data
  } = useContext(TableContext);

  console.log("data", data)
  return <Fragment>
    {data && data?.map((item, rowIndex) => <TableRow item={item} index={rowIndex} key={item.id} renderAs={renderRowAs} />)}
  </Fragment>;
}