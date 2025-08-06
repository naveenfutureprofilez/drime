import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
export const useDialogStore = create()(immer((set, get) => ({
  dialog: null,
  data: undefined,
  resolveClosePromise: null,
  openDialog: (dialog, data) => {
    return new Promise(resolve => {
      set(state => {
        state.dialog = dialog;
        state.data = data;
        state.resolveClosePromise = resolve;
      });
    });
  },
  closeActiveDialog: value => {
    get().resolveClosePromise?.(value);
    set(state => {
      state.dialog = null;
      state.data = undefined;
      state.resolveClosePromise = null;
    });
  }
})));
export const openDialog = useDialogStore.getState().openDialog;
export const closeDialog = value => {
  useDialogStore.getState().closeActiveDialog(value);
};