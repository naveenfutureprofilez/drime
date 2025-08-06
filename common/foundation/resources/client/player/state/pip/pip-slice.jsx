import { createChromePipAdapter } from '@common/player/state/pip/chrome-pip-adapter';
import { createSafariPipAdapter } from '@common/player/state/pip/safari-pip-adapter';
const adapterFactories = [createChromePipAdapter, createSafariPipAdapter];
export const createPipSlice = (set, get) => {
  let subscription;
  let adapters = [];
  const onPipChange = () => {
    set({
      isPip: adapters.some(a => a.isPip())
    });
  };
  const isSupported = () => {
    if (get().providerName !== 'htmlVideo') {
      return false;
    }
    return adapters.some(adapter => adapter.isSupported());
  };
  return {
    isPip: false,
    canPip: false,
    enterPip: async () => {
      if (get().isPip || !isSupported()) return;
      await adapters.find(a => a.isSupported())?.enter();
    },
    exitPip: async () => {
      if (!get().isPip) return;
      await adapters.find(a => a.isSupported())?.exit();
    },
    togglePip: () => {
      if (get().isPip) {
        get().exitPip();
      } else {
        get().enterPip();
      }
    },
    initPip: () => {
      subscription = get().subscribe({
        providerReady: ({
          el
        }) => {
          // when changing adapters, remove previous adapter events and exit pip
          adapters.every(a => a.unbindEvents());
          if (get().isPip) {
            adapters.every(a => a.exit());
          }
          // create new adapters, and if pip is supported on at least one, bind events
          adapters = adapterFactories.map(factory => factory(el, onPipChange));
          const canPip = isSupported();
          if (canPip) {
            adapters.every(a => a.bindEvents());
          }
          set({
            canPip
          });
        }
      });
    },
    destroyPip: () => {
      get().exitPip();
      subscription?.();
    }
  };
};