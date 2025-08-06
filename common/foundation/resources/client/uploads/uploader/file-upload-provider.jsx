import { createContext, useContext, useState } from 'react';
import { createFileUploadStore } from '@common/uploads/uploader/file-upload-store';
import { useSettings } from '@ui/settings/use-settings';
import { useStoreWithEqualityFn } from 'zustand/traditional';
const FileUploadContext = createContext(null);
export function useFileUploadStore(selector, equalityFn) {
  const store = useContext(FileUploadContext);
  return useStoreWithEqualityFn(store, selector, equalityFn);
}
export function FileUploadProvider({
  children,
  options
}) {
  const settings = useSettings();

  //lazily create store object only once
  const [store] = useState(() => {
    return createFileUploadStore({
      settings,
      options
    });
  });
  return <FileUploadContext.Provider value={store}>
      {children}
    </FileUploadContext.Provider>;
}