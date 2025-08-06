import { isCtrlKeyPressed } from '@ui/utils/keybinds/is-ctrl-key-pressed';
export function isCtrlOrShiftPressed(e) {
  return e.shiftKey || isCtrlKeyPressed(e);
}