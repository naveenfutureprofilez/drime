export function decodeBackendFilters(encodedFilters) {
  if (!encodedFilters) return [];
  let filtersFromQuery = [];
  try {
    filtersFromQuery = JSON.parse(atob(decodeURIComponent(encodedFilters)));
    filtersFromQuery.map(filterValue => {
      // set value key as value so selects work properly
      if (filterValue.valueKey != null) {
        filterValue.value = filterValue.valueKey;
      }
      return filterValue;
    });
  } catch (e) {
    //
  }
  return filtersFromQuery;
}