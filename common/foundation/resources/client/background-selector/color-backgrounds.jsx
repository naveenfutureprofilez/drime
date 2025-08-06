import { ColorPresets } from '@ui/color-picker/color-presets';
import { message } from '@ui/i18n/message';
export const BaseColorBg = {
  type: 'color',
  id: 'c-custom',
  label: message('Custom color')
};
export const ColorBackgrounds = ColorPresets.map((preset, index) => {
  return {
    ...BaseColorBg,
    id: `c${index}`,
    backgroundColor: preset.color,
    label: preset.name,
    color: preset.foreground
  };
});