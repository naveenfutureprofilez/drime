import { memo, useMemo, useState } from 'react';
import { AnimatePresence, m } from 'framer-motion';
import { IconButton } from '@ui/buttons/icon-button';
import { CloseIcon } from '@ui/icons/material/Close';
import { ProgressCircle } from '@ui/progress/progress-circle';
import { CheckCircleIcon } from '@ui/icons/material/CheckCircle';
import { useFileUploadStore } from '@common/uploads/uploader/file-upload-provider';
import { Trans } from '@ui/i18n/trans';
import { MixedText } from '@ui/i18n/mixed-text';
import { Tooltip } from '@ui/tooltip/tooltip';
import { ErrorIcon } from '@ui/icons/material/Error';
import { WarningIcon } from '@ui/icons/material/Warning';
import { RefreshIcon } from '@ui/icons/material/Refresh';
import { message } from '@ui/i18n/message';
import { FileTypeIcon } from '@common/uploads/components/file-type-icon/file-type-icon';
import { prettyBytes } from '@ui/utils/files/pretty-bytes';
import { useUploadAnalytics } from '@common/uploads/uploader/use-upload-analytics';
export const UploadQueueItem = memo(({
  file,
  style
}) => {
  return <div className="absolute left-0 top-0 flex w-full items-center gap-14 p-10" style={style}>
      <div className="shrink-0 rounded border p-8">
        <FileTypeIcon className="h-22 w-22" mime={file.mime} />
      </div>
      <div className="min-w-0 flex-auto pr-10">
        <div className="mb-2 flex min-w-0 items-center gap-10">
          <div className="min-w-0 flex-auto overflow-hidden overflow-ellipsis whitespace-nowrap font-medium">
            {file.name}
          </div>
        </div>
        <SizeInfo file={file} />
      </div>
      <div className="mr-10">
        <FileStatus file={file} />
      </div>
    </div>;
});
function SizeInfo({
  file
}) {
  const analytics = useUploadAnalytics(file.id);
  const fileUpload = useFileUploadStore(s => s.fileUploads.get(file.id));
  const totalBytes = useMemo(() => prettyBytes(file.size), [file]);
  const uploadedBytes = useMemo(() => prettyBytes(analytics.bytesUploaded), [analytics.bytesUploaded]);
  let statusMessage;
  if (analytics.status === 'completed') {
    statusMessage = <Trans message="Upload complete" />;
  } else if (analytics.status === 'aborted') {
    statusMessage = <Trans message="Upload cancelled" />;
  } else if (analytics.status === 'failed') {
    const retryCount = fileUpload?.retryCount || 0;
    const maxRetries = fileUpload?.maxRetries || 0;
    const canRetry = (fileUpload?.errorType === 'network' || fileUpload?.errorType === 'server') && retryCount < maxRetries;
    let failureMessage = 'Upload failed';
    if (fileUpload?.errorType === 'network') {
      failureMessage = 'Network error - check your connection';
    } else if (fileUpload?.errorType === 'server') {
      failureMessage = 'Server error - please try again';
    } else if (fileUpload?.errorType === 'validation') {
      failureMessage = 'File validation failed';
    }
    if (canRetry && retryCount > 0) {
      failureMessage += ` (Attempt ${retryCount}/${maxRetries})`;
    }
    statusMessage = <div className="flex items-center gap-4">
        <Trans message={failureMessage} />
        {canRetry && <span className="text-primary">• Click retry button</span>}
      </div>;
  } else {
    const {
      speedFormatted,
      etaFormatted
    } = analytics;
    if (fileUpload?.isRetrying) {
      const retryCount = fileUpload?.retryCount || 0;
      statusMessage = <Trans message="Retrying... (Attempt :attempt)" values={{
        attempt: retryCount
      }} />;
    } else {
      statusMessage = <div className="flex items-center gap-4">
          <Trans message=":bytesUploaded of :totalBytes" values={{
          bytesUploaded: uploadedBytes,
          totalBytes
        }} />
          {speedFormatted && <span>-</span>}
          <span>{speedFormatted}</span>
          {etaFormatted && <span>-</span>}
          <span>{etaFormatted}</span>
        </div>;
    }
  }
  return <div className="text-xs text-muted">{statusMessage}</div>;
}
function FileStatus({
  file
}) {
  const fileUpload = useFileUploadStore(s => s.fileUploads.get(file.id));
  const abortUpload = useFileUploadStore(s => s.abortUpload);
  const retryUpload = useFileUploadStore(s => s.retryUpload);
  const analytics = useUploadAnalytics(file.id);
  const errorMessage = fileUpload?.errorMessage;
  const [isHovered, setIsHovered] = useState(false);
  const abortButton = <IconButton size="xs" iconSize="sm" onClick={() => {
    abortUpload(file.id);
  }}>
      <CloseIcon />
    </IconButton>;
  const progressButton = <ProgressCircle aria-label="Upload progress" size="w-24 h-24" value={analytics.percentage} trackWidth={3} />;
  const retryButton = <Tooltip label="Retry Upload">
        <IconButton size="xs" iconSize="sm" onClick={() => retryUpload(file.id)}>
        <RefreshIcon />
        </IconButton>
    </Tooltip>;
  let statusButton;
  if (analytics.status === 'failed') {
    const errMessage = errorMessage || message('This file could not be uploaded');
    const canRetry = fileUpload?.errorType === 'network' || fileUpload?.errorType === 'server';
    statusButton = <AnimatedStatus>
          <Tooltip variant="danger" label={<MixedText value={`${errMessage} (Error code: ${fileUpload?.errorCode || 'N/A'})`} />}>
            {canRetry ? retryButton : <ErrorIcon className="text-danger" size="md" />}
          </Tooltip>
        </AnimatedStatus>;
  } else if (analytics.status === 'aborted') {
    statusButton = <AnimatedStatus>
        <WarningIcon className="text-warning" size="md" />
      </AnimatedStatus>;
  } else if (analytics.status === 'completed') {
    statusButton = <AnimatedStatus>
        <CheckCircleIcon size="md" className="text-positive" />
      </AnimatedStatus>;
  } else {
    statusButton = <AnimatedStatus onPointerEnter={e => {
      if (e.pointerType === 'mouse') {
        setIsHovered(true);
      }
    }} onPointerLeave={e => {
      if (e.pointerType === 'mouse') {
        setIsHovered(false);
      }
    }}>
        {isHovered ? abortButton : progressButton}
      </AnimatedStatus>;
  }
  return <AnimatePresence>{statusButton}</AnimatePresence>;
}
function AnimatedStatus({
  children,
  ...domProps
}) {
  return <m.div {...domProps} initial={{
    scale: 0,
    opacity: 0
  }} animate={{
    scale: 1,
    opacity: 1
  }} exit={{
    scale: 0,
    opacity: 0
  }}>
      {children}
    </m.div>;
}