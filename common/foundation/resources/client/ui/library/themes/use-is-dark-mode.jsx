import { useThemeSelector } from '@ui/themes/theme-selector-context';
export function useIsDarkMode() {
  const {
    selectedTheme
  } = useThemeSelector();
  return selectedTheme.is_dark ?? false;
}