import { useEffect, useState } from 'react';
import { m } from 'framer-motion';
export function ActiveIndicator({
  selectedValue,
  labelsRef
}) {
  const [style, setStyle] = useState(null);
  useEffect(() => {
    if (selectedValue != null && labelsRef.current) {
      const el = labelsRef.current[selectedValue];
      if (!el) return;
      setStyle({
        width: el.offsetWidth,
        height: el.offsetHeight,
        left: el.offsetLeft
      });
    }
  }, [setStyle, selectedValue, labelsRef]);
  if (!style) {
    return null;
  }
  return <m.div animate={style} initial={false} className="bg-paper shadow rounded absolute z-10 pointer-events-none" />;
}