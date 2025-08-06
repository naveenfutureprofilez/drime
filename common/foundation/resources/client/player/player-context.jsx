import { createContext, useState } from 'react';
import { createPlayerStore } from '@common/player/state/player-store';
export const PlayerStoreContext = createContext(null);
export function PlayerContext({
  children,
  id,
  options
}) {
  //lazily create store object only once
  const [store] = useState(() => {
    return createPlayerStore(id, options);
  });
  return <PlayerStoreContext.Provider value={store}>
      {children}
    </PlayerStoreContext.Provider>;
}