import { Fragment, useState } from 'react';
import { AnimatePresence, m } from 'framer-motion';
import { SharePanel } from './share-panel';
import { ShareableLinkPanel } from './link-panel/shareable-link-panel';
import { LinkSettingsDialog } from './link-panel/link-settings-dialog';
import { Dialog } from '@ui/overlays/dialog/dialog';
import { DialogHeader } from '@ui/overlays/dialog/dialog-header';
import { DialogBody } from '@ui/overlays/dialog/dialog-body';
import { Trans } from '@ui/i18n/trans';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@common/http/query-client';
import { DriveQueryKeys } from '../drive-query-keys';
export function ShareDialog({
  entry: initialEntry,
  focusLinkInput
}) {
  const {
    data: {
      fileEntry
    }
  } = useQuery({
    queryKey: DriveQueryKeys.fetchFileEntry(initialEntry.id),
    queryFn: () => apiClient.get(`drive/file-entries/${initialEntry.id}/model`).then(response => response.data),
    initialData: {
      fileEntry: initialEntry
    }
  });
  const [activePanel, setActivePanel] = useState('main');
  return <Dialog size="lg">
      <AnimatePresence initial={false} mode="wait">
        {activePanel === 'linkSettings' ? <LinkSettingsDialog key="one" setActivePanel={setActivePanel} entry={fileEntry} /> : <MainDialog key="two" setActivePanel={setActivePanel} entry={fileEntry} focusLinkInput={focusLinkInput} />}
      </AnimatePresence>
    </Dialog>;
}
function MainDialog({
  setActivePanel,
  entry,
  focusLinkInput
}) {
  return <Fragment>
      <DialogHeader>
        <Trans message="Share ‘:name’" values={{
        name: entry.name
      }} />
      </DialogHeader>
      <DialogBody className="relative">
        <m.div key="share-content" animate={{
        opacity: 1,
        y: 0
      }} initial={{
        opacity: 0,
        y: 20
      }} exit={{
        opacity: 0,
        y: -20
      }} transition={{
        duration: 0.1
      }}>
          <SharePanel className="mb-30 border-b pb-30" entry={entry} />
          <ShareableLinkPanel setActivePanel={setActivePanel} entry={entry} focusInput={!!focusLinkInput} />
        </m.div>
      </DialogBody>
    </Fragment>;
}