import { useMutation } from '@tanstack/react-query';
import { apiClient } from '@common/http/query-client';
import { onFormQueryError } from '@common/errors/on-form-query-error';
import { invalidateEntryQueries } from '../../drive-query-keys';
function createFolder({
  name,
  parentId
}) {
  return apiClient.post('folders', {
    name,
    parentId: parentId === 0 ? null : parentId
  }).then(response => response.data);
}
export function useCreateFolder(form) {
  return useMutation({
    mutationFn: ({
      name,
      parentId
    }) => {
      return createFolder({
        name,
        parentId
      });
    },
    onSuccess: () => invalidateEntryQueries(),
    onError: r => onFormQueryError(r, form)
  });
}