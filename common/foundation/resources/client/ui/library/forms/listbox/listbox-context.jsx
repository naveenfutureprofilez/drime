import { createContext, useContext } from 'react';
export const ListBoxContext = createContext(null);
export function useListboxContext() {
  return useContext(ListBoxContext);
}