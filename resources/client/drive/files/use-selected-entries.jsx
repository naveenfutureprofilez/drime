import { driveState, useDriveStore } from '../drive-store';
import { getAllEntries } from './queries/use-paginated-entries';
import { useEntries } from './queries/use-entries';
import { useFolders } from './queries/use-folders';
export function useSelectedEntries() {
  const ids = useDriveStore(s => s.selectedEntries);
  const entries = useEntries();
  return Array.from(ids).map(id => entries.find(entry => entry.id === id)).filter(e => !!e);
}
export function useSelectedEntry() {
  const entries = useSelectedEntries();
  return entries[0];
}
export function useSelectedEntryParent() {
  const entry = useSelectedEntry();
  const {
    data
  } = useFolders();
  if (!entry || !data?.folders) return;
  return data.folders.find(e => e.id === entry.parent_id);
}
export function getSelectedEntries() {
  const ids = Array.from(driveState().selectedEntries);
  const allEntries = getAllEntries();
  return ids.map(id => allEntries.find(entry => entry.id === id)).filter(e => !!e);
}