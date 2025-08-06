import React, { useContext } from 'react';
export const DialogContext = React.createContext(null);
export function useDialogContext() {
  return useContext(DialogContext);
}