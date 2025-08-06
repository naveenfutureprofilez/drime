export const EMPTY_PAGINATION_RESPONSE = {
  pagination: {
    data: [],
    from: 0,
    to: 0,
    per_page: 15,
    current_page: 1
  }
};
export function hasPreviousPage(pagination) {
  if ('prev_cursor' in pagination) {
    return pagination.prev_cursor != null;
  }
  if ('prev_page' in pagination) {
    return pagination.prev_page != null;
  }
  return pagination.current_page > 1;
}
export function hasNextPage(pagination) {
  if ('next_cursor' in pagination) {
    return pagination.next_cursor != null;
  }
  if ('last_page' in pagination) {
    return pagination.current_page < pagination.last_page;
  }
  if ('next_page' in pagination) {
    return pagination.next_page != null;
  }
  return pagination.data.length > 0 && pagination.data.length >= pagination.per_page;
}