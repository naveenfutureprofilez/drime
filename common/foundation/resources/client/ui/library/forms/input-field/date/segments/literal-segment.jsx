import { useFocusManager } from '@react-aria/focus';
export function LiteralDateSegment({
  segment,
  domProps
}) {
  const focusManager = useFocusManager();
  return <div {...domProps} onPointerDown={e => {
    if (e.pointerType === 'mouse') {
      e.preventDefault();
      const res = focusManager?.focusNext({
        from: e.target
      });
      if (!res) {
        focusManager?.focusPrevious({
          from: e.target
        });
      }
    }
  }} aria-hidden className="min-w-4 cursor-default select-none">
      {segment.text}
    </div>;
}