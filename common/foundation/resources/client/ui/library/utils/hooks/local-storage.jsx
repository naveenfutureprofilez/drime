import { useEffect, useState } from 'react';
export function useLocalStorage(key, initialValue = null) {
  const [storedValue, setStoredValue] = useState(() => {
    return getFromLocalStorage(key, initialValue);
  });
  const setValue = value => {
    const valueToStore = value instanceof Function ? value(storedValue) : value;
    setStoredValue(valueToStore);
    setInLocalStorage(key, valueToStore);
  };

  // update state value using custom storage event. This will re-render
  // component even if local storage value was set from different hook instance
  useEffect(() => {
    const handleStorageChange = event => {
      if (event.detail?.key === key) {
        setStoredValue(event.detail.newValue);
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [key]);
  return [storedValue, setValue];
}
export function getFromLocalStorage(key, initialValue = null) {
  if (typeof window === 'undefined') {
    return initialValue;
  }
  try {
    const item = window.localStorage.getItem(key);
    return item != null ? JSON.parse(item) : initialValue;
  } catch (error) {
    return initialValue;
  }
}
export function setInLocalStorage(key, value) {
  try {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(key, JSON.stringify(value));
      window.dispatchEvent(new CustomEvent('storage', {
        detail: {
          key,
          newValue: value
        }
      }));
    }
  } catch (error) {
    //
  }
}
export function removeFromLocalStorage(key) {
  try {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(key);
    }
  } catch (error) {
    //
  }
}