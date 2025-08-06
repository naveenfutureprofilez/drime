import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { nanoid } from 'nanoid';
import { ToastTimer } from '@ui/toast/toast-timer';
const maximumVisible = 1;
function getDefaultDuration(type) {
  switch (type) {
    case 'danger':
      return 8000;
    case 'loading':
      return 0;
    default:
      return 3000;
  }
}
export const useToastStore = create()(immer((set, get) => ({
  toasts: [],
  add: (message, opts) => {
    const amountToRemove = get().toasts.length + 1 - maximumVisible;
    if (amountToRemove > 0) {
      set(state => {
        state.toasts.splice(0, amountToRemove);
      });
    }
    const toastId = opts?.id || nanoid(6);
    const toastType = opts?.type || 'positive';
    const duration = opts?.duration ?? getDefaultDuration(toastType);
    const toast = {
      timer: duration > 0 ? new ToastTimer(() => get().remove(toastId), duration) : null,
      message,
      ...opts,
      id: toastId,
      type: toastType,
      position: opts?.position || 'bottom-center',
      duration,
      disableExitAnimation: opts?.disableExitAnimation,
      disableEnterAnimation: opts?.disableEnterAnimation
    };
    const toastIndex = get().toasts.findIndex(t => t.id === toast.id);
    if (toastIndex > -1) {
      set(state => {
        state.toasts[toastIndex] = toast;
      });
    } else {
      set(state => {
        state.toasts.push(toast);
      });
    }
  },
  remove: toastId => {
    const newToasts = get().toasts.filter(toast => {
      if (toastId === toast.id) {
        toast.timer?.clear();
        return false;
      }
      return true;
    });
    set(state => {
      state.toasts = newToasts;
    });
  }
})));
export function toastState() {
  return useToastStore.getState();
}