import { themeEl } from '@ui/root-el';
export function setThemeValue(key, value) {
  themeEl?.style.setProperty(key, value);
}
export function removeThemeValue(key) {
  themeEl?.style.removeProperty(key);
}