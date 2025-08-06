import { enableMapSet } from 'immer';
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { getFromLocalStorage, setInLocalStorage } from '@ui/utils/hooks/local-storage';
import { getBootstrapData } from '@ui/bootstrap-data/bootstrap-data-store';
const stableArray = [];
enableMapSet();
const initialState = {
  uploadQueueIsOpen: false,
  contextMenuData: null,
  selectedEntries: new Set(),
  entriesBeingDragged: [],
  activeActionDialog: null,
  sidebarExpandedKeys: [],
  viewMode: getFromLocalStorage('drive.viewMode', getBootstrapData().settings?.drive?.default_view || 'grid'),
  sortDescriptor: {
    orderBy: 'updated_at',
    orderDir: 'desc'
  }
};
export const useDriveStore = create()(immer((set, get) => ({
  ...initialState,
  setUploadQueueIsOpen: isOpen => {
    set(state => {
      state.uploadQueueIsOpen = isOpen;
    });
  },
  setContextMenuData: data => {
    set(state => {
      state.contextMenuData = data;
    });
  },
  setSortDescriptor: value => {
    set(state => {
      const activePageId = get().activePage?.uniqueId;
      if (activePageId) {
        setInLocalStorage('selectedSorting', {
          ...getFromLocalStorage('selectedSorting'),
          [activePageId]: value
        });
      }
      state.sortDescriptor = value;
    });
  },
  setActivePage: value => {
    set(state => {
      state.activePage = value;
      const storedDescriptor = getFromLocalStorage('selectedSorting')?.[value.uniqueId];
      state.sortDescriptor = storedDescriptor ? storedDescriptor : value.sortDescriptor;

      // deselect entries when page changes
      if (value.uniqueId !== get().activePage?.uniqueId && state.selectedEntries.size) {
        state.selectedEntries.clear();
      }
    });
  },
  setEntriesBeingDragged: value => {
    set(state => {
      state.entriesBeingDragged = value;
    });
  },
  setActiveActionDialog: (name, entries = stableArray) => {
    set(state => {
      const current = get().activeActionDialog;
      // prevent creating a new object, if neither name nor entries changed
      if (current?.name !== name || current.entries !== entries) {
        state.activeActionDialog = name ? {
          name,
          entries
        } : null;
      }
    });
  },
  setViewMode: mode => {
    set(state => {
      state.viewMode = mode;
      setInLocalStorage('drive.viewMode', mode);
    });
  },
  setSidebarExpandedKeys: value => set(state => {
    state.sidebarExpandedKeys = value;
  }),
  expandSidebarItem: key => set(state => {
    if (!state.sidebarExpandedKeys.includes(key)) {
      state.sidebarExpandedKeys.push(key);
    }
  }),
  collapseSidebarItem: key => set(state => {
    const index = state.sidebarExpandedKeys.indexOf(key);
    if (index > -1) {
      state.sidebarExpandedKeys.splice(index, 1);
    }
  }),
  toggleSidebarItem: key => set(state => {
    if (state.sidebarExpandedKeys.includes(key)) {
      state.expandSidebarItem(key);
    } else {
      state.collapseSidebarItem(key);
    }
  }),
  selectEntries: (entries, merge) => {
    set(state => {
      if (!merge) {
        state.selectedEntries.clear();
      }
      entries.forEach(e => e && state.selectedEntries.add(e));
    });
  },
  deselectEntries: entries => {
    set(state => {
      if (!state.selectedEntries.size) return;
      if (entries === 'all') {
        state.selectedEntries = new Set();
      } else {
        entries.forEach(e => state.selectedEntries.delete(e));
      }
    });
  },
  reset: () => {
    set(initialState);
  }
})));
export function driveState() {
  return useDriveStore.getState();
}
export function useActiveDialogEntry() {
  const dialog = useDriveStore(s => s.activeActionDialog);
  // this will only be used inside dialog, so entry will always be set in that case
  return dialog?.entries[0];
}