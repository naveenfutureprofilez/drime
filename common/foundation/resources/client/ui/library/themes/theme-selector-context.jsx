import { createContext, useContext } from 'react';
export const ThemeSelectorContext = createContext(null);
export function useThemeSelector() {
  return useContext(ThemeSelectorContext);
}