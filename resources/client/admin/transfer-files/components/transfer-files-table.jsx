import React from 'react';
import { Checkbox } from '@ui/forms/toggle/checkbox';
import clsx from 'clsx';
import { ArrowUpwardIcon } from '@ui/icons/material/ArrowUpward';
import { ArrowDownwardIcon } from '@ui/icons/material/ArrowDownward';

export function TransferFilesTable({
  columns,
  data,
  selectedRows,
  onSelectionChange,
  sortDescriptor,
  onSortChange,
  enableSelection = true,
  className
}) {
  const isAllSelected = data.length > 0 && selectedRows.length === data.length;
  const isIndeterminate = selectedRows.length > 0 && selectedRows.length < data.length;

  const handleSelectAll = (checked) => {
    if (checked) {
      onSelectionChange(data);
    } else {
      onSelectionChange([]);
    }
  };

  const handleRowSelect = (row, checked) => {
    if (checked) {
      onSelectionChange([...selectedRows, row]);
    } else {
      onSelectionChange(selectedRows.filter(selectedRow => selectedRow.id !== row.id));
    }
  };

  const isRowSelected = (row) => {
    return selectedRows.some(selectedRow => selectedRow.id === row.id);
  };

  const handleSort = (columnKey) => {
    const column = columns.find(col => col.key === columnKey);
    if (!column?.allowsSorting) return;

    let direction = 'asc';
    if (sortDescriptor?.orderBy === columnKey) {
      direction = sortDescriptor.orderDir === 'asc' ? 'desc' : 'asc';
    }

    onSortChange({
      orderBy: columnKey,
      orderDir: direction
    });
  };

  return (
    <div className={clsx('overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm', className)}>
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-200">
            {enableSelection && (
              <th className="w-12 px-6 py-4 text-left">
                <Checkbox 
                  checked={isAllSelected}
                  isIndeterminate={isIndeterminate}
                  onChange={handleSelectAll}
                />
              </th>
            )}
            {columns.map((column) => (
              <th 
                key={column.key}
                className={clsx(
                  'px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider',
                  column.width,
                  column.allowsSorting && 'cursor-pointer hover:bg-gray-100 transition-colors duration-150'
                )}
                onClick={() => column.allowsSorting && handleSort(column.key)}
              >
                <div className="flex items-center gap-2">
                  {column.header()}
                  {column.allowsSorting && sortDescriptor?.orderBy === column.key && (
                    <span className="text-blue-600">
                      {sortDescriptor.orderDir === 'asc' ? (
                        <ArrowUpwardIcon className="h-4 w-4" />
                      ) : (
                        <ArrowDownwardIcon className="h-4 w-4" />
                      )}
                    </span>
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((row, index) => (
            <tr 
              key={row.id} 
              className={clsx(
                'hover:bg-gray-50 transition-colors duration-150',
                isRowSelected(row) && 'bg-blue-50 hover:bg-blue-100',
                index % 2 === 0 ? 'bg-white' : 'bg-gray-25'
              )}
            >
              {enableSelection && (
                <td className="px-6 py-4">
                  <Checkbox 
                    checked={isRowSelected(row)}
                    onChange={(checked) => handleRowSelect(row, checked)}
                  />
                </td>
              )}
              {columns.map((column) => (
                <td 
                  key={column.key}
                  className={clsx(
                    'px-6 py-4 text-sm text-gray-900',
                    column.width
                  )}
                >
                  {column.body(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}