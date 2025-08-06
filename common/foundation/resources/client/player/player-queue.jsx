export function playerQueue(state) {
  const getPointer = () => {
    if (state().cuedMedia) {
      return state().shuffledQueue.findIndex(item => item.id === state().cuedMedia?.id) || 0;
    }
    return 0;
  };
  const getCurrent = () => {
    return state().shuffledQueue[getPointer()];
  };
  const getFirst = () => {
    return state().shuffledQueue[0];
  };
  const getLast = () => {
    return state().shuffledQueue[state().shuffledQueue.length - 1];
  };
  const getNext = () => {
    return state().shuffledQueue[getPointer() + 1];
  };
  const getPrevious = () => {
    return state().shuffledQueue[getPointer() - 1];
  };
  const isLast = () => {
    return getPointer() === state().originalQueue.length - 1;
  };
  return {
    getPointer,
    getCurrent,
    getFirst,
    getLast,
    getNext,
    getPrevious,
    isLast
  };
}