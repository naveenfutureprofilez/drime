import React from 'react';
import { useShareableLinkPage } from '@app/drive/shareable-link/queries/use-shareable-link-page';
import { useLinkPageStore } from '@app/drive/shareable-link/shareable-link-page/link-page-store';
import { useTrans } from '@ui/i18n/use-trans';
import { ProgressCircle } from '@ui/progress/progress-circle';
import { PasswordPage } from '@app/drive/shareable-link/shareable-link-page/password-page';
import { FolderPreview } from '@app/drive/shareable-link/shareable-link-page/folder-preview/folder-preview';
import { ShareableLinkPageFilePreview } from './shareable-link-page-file-preview';
import { NotFoundPage } from '@common/ui/not-found-page/not-found-page';
import { FileEntryUrlsContext } from '@common/uploads/file-entry-urls';
import { ActiveWorkspaceProvider } from '@common/workspace/active-workspace-id-context';
import { GuestDownloadView } from './guest-download-view';
import { useAuth } from '@common/auth/use-auth';
export function ShareableLinkPage() {
  const {
    status,
    link,
    entries
  } = useShareableLinkPage();
  const {
    user,
    isLoggedIn
  } = useAuth();
  const isGuest = !isLoggedIn;
  const totalSize = entries?.reduce((sum, entry) => sum + (entry.file_size || 0), 0) || 0;
  const {
    trans
  } = useTrans();
  const isPasswordProtected = useLinkPageStore(s => s.isPasswordProtected);
  const password = useLinkPageStore(s => s.password);
  let content;
  if (status === 'pending') {
    content = <div className="flex h-screen flex-auto items-center justify-center">
        <ProgressCircle aria-label={trans({
        message: 'Loading link'
      })} isIndeterminate />
      </div>;
  } else if (!link && !isPasswordProtected) {
    return <NotFoundPage />;
  } else if (isPasswordProtected && !password) {
    content = <PasswordPage />;
  } else if (link?.entry?.type === 'folder') {
    content = <FolderPreview />;
  } else if (!isGuest) {
    content = <ShareableLinkPageFilePreview />;
  } else {
    content = <GuestDownloadView files={entries} totalSize={totalSize} expiresAt={link?.expires_at} />;
  }
  return <ActiveWorkspaceProvider>
      <FileEntryUrlsContext.Provider value={{
      shareable_link: link?.id,
      password
    }}>
        {content}
      </FileEntryUrlsContext.Provider>
    </ActiveWorkspaceProvider>;
}