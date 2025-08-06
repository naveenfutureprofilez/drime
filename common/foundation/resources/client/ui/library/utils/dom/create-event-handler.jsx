export function createEventHandler(handler) {
  if (!handler) return handler;
  return e => {
    // ignore events bubbling up from portals
    if (e.currentTarget.contains(e.target)) {
      handler(e);
    }
  };
}