import { useInfiniteData } from '@common/ui/infinite-scroll/use-infinite-data';
export function commentsQueryKey(commentable, params = {}) {
  return ['comment', `${commentable.id}-${commentable.model_type}`, params];
}
export function useComments(commentable, params = {}) {
  return useInfiniteData({
    queryKey: commentsQueryKey(commentable, params),
    endpoint: 'commentable/comments',
    //paginate: 'cursor',
    queryParams: {
      commentable_type: commentable.model_type,
      commentable_id: commentable.id,
      ...params
    }
  });
}