import { create } from 'zustand';
export const useBootstrapDataStore = create()(set => ({
  // set bootstrap data that was provided with initial request from backend
  data: typeof window !== 'undefined' && window.bootstrapData ? decodeBootstrapData(window.bootstrapData) : null,
  setData: data => {
    const decodedData = typeof data === 'string' ? decodeBootstrapData(data) : data;
    set({
      data: decodedData
    });
  },
  mergeData: partial => {
    set(state => ({
      data: {
        ...state.data,
        ...partial
      }
    }));
  }
}));
export const getBootstrapData = () => useBootstrapDataStore.getState().data;
export const setBootstrapData = useBootstrapDataStore.getState().setData;
export const mergeBootstrapData = useBootstrapDataStore.getState().mergeData;
export function decodeBootstrapData(data) {
  return typeof data === 'string' ? JSON.parse(data) : data;
}