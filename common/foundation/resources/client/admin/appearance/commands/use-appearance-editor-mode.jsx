import { isSsr } from '@ui/utils/dom/is-ssr';
export function useAppearanceEditorMode() {
  const iframe = window.frameElement || undefined;
  if (!iframe?.src || isSsr()) {
    return {
      isAppearanceEditorActive: false,
      appearanceEditorParams: {}
    };
  }
  const search = new URL(iframe.src).searchParams;
  return {
    isAppearanceEditorActive: !isSsr() && search.get('appearanceEditor') === 'true',
    appearanceEditorParams: Object.fromEntries(search)
  };
}