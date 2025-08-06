import { useMemo, useState } from 'react';
import { sortArrayOfObjects } from '@ui/utils/array/sort-array-of-objects';
export function useSortableTableData(data) {
  const [sortDescriptor, onSortChange] = useState({});
  const sortedData = useMemo(() => {
    if (!data) {
      return [];
    } else if (sortDescriptor?.orderBy) {
      return sortArrayOfObjects([...data], sortDescriptor.orderBy, sortDescriptor.orderDir);
    }
    return data;
  }, [sortDescriptor, data]);
  return {
    data: sortedData,
    sortDescriptor,
    onSortChange
  };
}