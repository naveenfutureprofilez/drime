import { useLocation } from 'react-router';
import { useState } from 'react';
export function useUrlBackedTabs(config) {
  const {
    pathname
  } = useLocation();
  const tabName = pathname.split('/').pop();
  return useState(() => {
    const index = config.findIndex(tab => tab.uri === tabName);
    return index === -1 ? 0 : index;
  });
}