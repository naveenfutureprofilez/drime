// use intersection observer instead of getBoundingClientRect for better performance as this will be called in onPointerMove event

export function updateRects(targets) {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      const {
        width,
        height,
        left,
        top
      } = entry.boundingClientRect;
      const [id, target] = [...targets].find(([, target]) => target.ref.current === entry.target) || [];
      if (id == null || target == null) return;
      const rect = {
        width,
        height,
        left,
        top
      };
      targets.set(id, {
        ...target,
        rect
      });
    });
    observer.disconnect();
  });
  [...targets.values()].forEach(target => {
    if (target.ref.current) {
      observer.observe(target.ref.current);
    }
  });
}