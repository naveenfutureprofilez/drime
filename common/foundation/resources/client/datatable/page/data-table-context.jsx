import React, { useContext } from 'react';
export const DataTableContext = React.createContext(null);
export function useDataTable() {
  return useContext(DataTableContext);
}