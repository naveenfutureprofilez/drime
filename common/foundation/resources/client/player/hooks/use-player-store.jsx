import { useContext } from 'react';
import { PlayerStoreContext } from '@common/player/player-context';
import { useStoreWithEqualityFn } from 'zustand/traditional';
// @ts-ignore
export const usePlayerStore = (selector, equalityFn) => {
  const store = useContext(PlayerStoreContext);
  return useStoreWithEqualityFn(store, selector, equalityFn);
};