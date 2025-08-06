import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { getFromLocalStorage, setInLocalStorage } from '@ui/utils/hooks/local-storage';
export const useLinkPageStore = create()(immer(set => ({
  password: null,
  viewMode: getFromLocalStorage('drive.viewMode'),
  activeSort: {
    orderBy: 'updated_at',
    orderDir: 'desc'
  },
  setPassword: value => {
    set(state => {
      state.password = value;
    });
  },
  isPasswordProtected: false,
  setIsPasswordProtected: value => {
    set(state => {
      state.isPasswordProtected = value;
    });
  },
  setViewMode: mode => {
    set(state => {
      state.viewMode = mode;
      setInLocalStorage('drive.viewMode', mode);
    });
  },
  setActiveSort: value => {
    set(state => {
      state.activeSort = value;
    });
  }
})));
export function linkPageState() {
  return useLinkPageStore.getState();
}