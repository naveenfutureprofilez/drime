import { useEffect, useId, useRef } from 'react';
import { dragMonitors } from './drag-state';
export function useDragMonitor(monitor) {
  const monitorRef = useRef(monitor);
  const id = useId();
  useEffect(() => {
    dragMonitors.set(id, monitorRef.current);
    return () => {
      dragMonitors.delete(id);
    };
  }, [id]);
}