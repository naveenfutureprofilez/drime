export function removeEmptyValuesFromObject(obj, options) {
  const shouldCopy = options?.copy ?? true;
  const newObj = shouldCopy ? {
    ...obj
  } : obj;
  Object.keys(newObj).forEach(_key => {
    const key = _key;
    if (options?.arrays && Array.isArray(newObj[key]) && newObj[key].length === 0) {
      delete newObj[key];
    } else if (options?.deep && newObj[key] && typeof newObj[key] === 'object') {
      newObj[key] = removeEmptyValuesFromObject(newObj[key], options);
      if (Object.keys(newObj[key]).length === 0) {
        delete newObj[key];
      }
    } else if (newObj[key] == null || newObj[key] === '') {
      delete newObj[key];
    }
  });
  return shouldCopy ? newObj : obj;
}