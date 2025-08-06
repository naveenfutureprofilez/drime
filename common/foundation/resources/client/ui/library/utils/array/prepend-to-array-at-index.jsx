export function prependToArrayAtIndex(array, toAdd, index = 0) {
  const copyOfArray = [...array];
  const tail = copyOfArray.splice(index + 1);
  return [...copyOfArray, ...toAdd, ...tail];
}