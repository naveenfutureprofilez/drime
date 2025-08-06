import { usePaginatedEntries } from './use-paginated-entries';
export function useEntries() {
  const query = usePaginatedEntries();
  if (!query.data) return [];
  return query.data.pages.flatMap(p => p.data);
}