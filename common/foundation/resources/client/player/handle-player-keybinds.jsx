import { isCtrlOrShiftPressed } from '@ui/utils/keybinds/is-ctrl-or-shift-pressed';
export function handlePlayerKeybinds(e, state) {
  if (['input', 'textarea'].includes(e.target?.tagName.toLowerCase())) return;
  if (e.key === ' ' || e.key === 'k') {
    e.preventDefault();
    if (state().isPlaying) {
      state().pause();
    } else {
      state().play();
    }
  }
  if (e.key === 'ArrowLeft') {
    e.preventDefault();
    if (isCtrlOrShiftPressed(e)) {
      state().playPrevious();
    } else {
      state().seek(state().getCurrentTime() - 10);
    }
  }
  if (e.key === 'ArrowRight') {
    e.preventDefault();
    if (isCtrlOrShiftPressed(e)) {
      state().playNext();
    } else {
      state().seek(state().getCurrentTime() + 10);
    }
  }
}