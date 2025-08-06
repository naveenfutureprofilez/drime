import { FilePreviewContainer } from './file-preview-container';
import { useDialogContext } from '@ui/overlays/dialog/dialog-context';
import { Dialog } from '@ui/overlays/dialog/dialog';
export function FilePreviewDialog(props) {
  return <Dialog size="fullscreenTakeover" background="bg-alt" className="flex flex-col">
      <Content {...props} />
    </Dialog>;
}
function Content(props) {
  const {
    close
  } = useDialogContext();
  return <FilePreviewContainer onClose={close} {...props} />;
}