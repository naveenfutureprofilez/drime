import { useQuery } from '@tanstack/react-query';
import { apiClient, queryClient } from '@common/http/query-client';
export function useTaggableTags(params) {
  return useQuery({
    queryKey: getQueryKey(params),
    queryFn: () => fetchTaggableTags(params),
    initialData: params.initialData ? {
      tags: params.initialData
    } : undefined
  });
}
function getQueryKey(params) {
  const {
    taggableType,
    taggableId,
    type,
    notType
  } = params;
  const key = ['tags', 'taggable', taggableType, `${taggableId}`];
  if (type != null) {
    key.push(type);
  }
  if (notType != null) {
    key.push(notType);
  }
  return key;
}
export function invalidateTaggableTagsQuery({
  taggableType,
  taggableIds
}) {
  return Promise.allSettled(taggableIds.map(taggableId => queryClient.invalidateQueries({
    queryKey: getQueryKey({
      taggableType,
      taggableId
    })
  })));
}
async function fetchTaggableTags({
  taggableType,
  taggableId,
  notType,
  type
}) {
  return apiClient.get(`taggable/${taggableType}/${taggableId}/list-tags`, {
    params: {
      notType,
      type
    }
  }).then(response => response.data);
}