export function groupArrayBy(arr, cb, options) {
  const result = {};
  for (let i = 0; i < arr.length; i++) {
    let item = arr[i];
    const bucketCategory = cb(item);
    const bucket = result[bucketCategory];
    item = options?.map ? options.map(arr[i], i) : arr[i];
    if (!Array.isArray(bucket)) {
      result[bucketCategory] = [item];
    } else {
      result[bucketCategory].push(item);
    }
  }
  return result;
}