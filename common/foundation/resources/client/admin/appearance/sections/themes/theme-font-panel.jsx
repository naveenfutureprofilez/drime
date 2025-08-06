import { FontSelector } from '@common/ui/font-selector/font-selector';
import { useFormContext } from 'react-hook-form';
import { appearanceState } from '@common/admin/appearance/appearance-store';
import { useParams } from 'react-router';
export function ThemeFontPanel() {
  const {
    setValue,
    watch
  } = useFormContext();
  const {
    themeIndex
  } = useParams();
  const key = `appearance.themes.${themeIndex}.font`;
  return <FontSelector value={watch(key)} onChange={font => {
    setValue(key, font, {
      shouldDirty: true
    });
    appearanceState().preview.setThemeFont(font);
  }} />;
}