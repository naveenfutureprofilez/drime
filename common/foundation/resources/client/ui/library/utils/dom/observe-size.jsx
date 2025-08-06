export function observeSize(ref, callback) {
  const observer = new ResizeObserver(entries => {
    const rect = entries[0].contentRect;
    callback({
      width: rect.width,
      height: rect.height
    });
  });
  if (ref.current) {
    observer.observe(ref.current);
  }
  return () => {
    if (ref.current) {
      observer.unobserve(ref.current);
    }
  };
}