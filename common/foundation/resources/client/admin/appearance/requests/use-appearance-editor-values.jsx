import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@common/http/query-client';
import { prepareSettingsForHookForm } from '@common/admin/settings/requests/use-admin-settings';
export function useAppearanceEditorValuesQuery() {
  return useQuery({
    queryKey: ['admin/appearance/values'],
    queryFn: () => fetchAppearanceValues(),
    staleTime: Infinity,
    select: prepareSettingsForHookForm
  });
}
export function useAppearanceEditorValues() {
  const {
    data
  } = useAppearanceEditorValuesQuery();
  return data.values;
}
function fetchAppearanceValues() {
  return apiClient.get('admin/appearance/values').then(r => r.data);
}