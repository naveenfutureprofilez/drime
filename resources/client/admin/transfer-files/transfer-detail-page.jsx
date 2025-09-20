import React from 'react';
import { useParams, Link } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@common/http/query-client';
import { Trans } from '@ui/i18n/trans';
import { PageStatus } from '@common/http/page-status';
import { Button } from '@ui/buttons/button';
import { ArrowBackIcon } from '@ui/icons/material/ArrowBack';
import { Chip } from '@ui/forms/input-field/chip-field/chip';
import { FormattedDate } from '@ui/i18n/formatted-date';
import { FormattedBytes } from '@ui/i18n/formatted-bytes';
// Using simple div elements instead of Card components
// Removed Divider import - using simple div instead
import { LinkIcon } from '@ui/icons/material/Link';
import { DownloadIcon } from '@ui/icons/material/Download';
import { EmailIcon } from '@ui/icons/material/Email';
import { PersonIcon } from '@ui/icons/material/Person';
import { ScheduleIcon } from '@ui/icons/material/Schedule';
import { SecurityIcon } from '@ui/icons/material/Security';
import { MessageIcon } from '@ui/icons/material/Message';
import { TitleIcon } from '@ui/icons/material/Title';
import { FolderIcon } from '@ui/icons/material/Folder';
import { IconButton } from '@ui/buttons/icon-button';
import { Tooltip } from '@ui/tooltip/tooltip';
import { InsertDriveFileIcon } from '@ui/icons/material/InsertDriveFile';
import { VideoFileIcon } from '@ui/icons/material/VideoFile';
import { AudioFileIcon } from '@ui/icons/material/AudioFile';
import { ImageIcon } from '@ui/icons/material/Image';
import { PictureAsPdfIcon } from '@ui/icons/material/PictureAsPdf';
import { useState } from 'react';
import { DialogTrigger } from '@ui/overlays/dialog/dialog-trigger';
import { FilePreviewDialog } from '@common/uploads/components/file-preview/file-preview-dialog';
import { Dialog } from '@ui/overlays/dialog/dialog';
import { DialogHeader } from '@ui/overlays/dialog/dialog-header';
import { DialogBody } from '@ui/overlays/dialog/dialog-body';
import { CloseIcon } from '@ui/icons/material/Close';
import { VisibilityIcon } from '@ui/icons/material/Visibility';
import { DeleteIcon } from '@ui/icons/material/Delete';
import { AccessTimeIcon } from '@ui/icons/material/AccessTime';
import { ConfirmationDialog } from '@ui/overlays/dialog/confirmation-dialog';
import { toast } from '@ui/toast/toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';

function useTransferDetail(transferId) {
  return useQuery({
    queryKey: ['transfer-files', transferId],
    queryFn: async () => {
      console.log('Fetching transfer details for ID:', transferId);
      try {
        const response = await apiClient.get(`admin/transfer-files/${transferId}`);
        console.log('Transfer API response:', response.data);
        return response.data;
      } catch (error) {
        console.error('Transfer API error:', error);
        throw error;
      }
    },
    enabled: !!transferId,
    retry: (failureCount, error) => {
      console.log('Query retry attempt:', failureCount, 'Error:', error);
      return failureCount < 2;
    },
    onError: (error) => {
      console.error('useTransferDetail error:', error);
    },
    onSuccess: (data) => {
      console.log('useTransferDetail success:', data);
    }
  });
}

// Custom preview component for transfer files
function TransferFilePreview({ file, transfer, isOpen, onClose }) {
  const isImage = file.mime?.startsWith('image/');
  const isVideo = file.mime?.startsWith('video/');
  const isAudio = file.mime?.startsWith('audio/');
  const isPdf = file.mime === 'application/pdf';
  const isText = file.mime?.startsWith('text/') ||
    ['application/json', 'application/xml'].includes(file.mime);

  // Generate preview URL based on transfer hash and file ID
  const previewUrl = `/download/${transfer.hash}/${file.id}`;
  const downloadUrl = previewUrl;

  const renderPreview = () => {
    if (isImage) {
      return (
        <div className="flex items-center justify-center h-full">
          <img
            src={previewUrl}
            alt={file.name}
            className="max-w-full max-h-full object-contain"
            onError={(e) => {
              e.currentTarget.style.display = "none";
              e.currentTarget.nextElementSibling?.classList.remove("hidden");
            }}
          />
          <div className="hidden text-center text-muted">
            <InsertDriveFileIcon className="h-16 w-16 mx-auto mb-4" />
            <p>Image preview not available</p>
          </div>
        </div>
      );
    }

    if (isVideo) {
      return (
        <div className="flex items-center justify-center h-full">
          <video
            controls
            className="max-w-full max-h-full rounded"
            onError={(e) => {
              e.currentTarget.style.display = "none";
              e.currentTarget.nextElementSibling?.classList.remove("hidden");
            }}
          >
            <source src={previewUrl} type={file.mime} />
            Your browser does not support the video tag.
          </video>
          <div className="hidden text-center text-muted">
            <VideoFileIcon className="h-16 w-16 mx-auto mb-4" />
            <p>Video preview not available</p>
          </div>
        </div>
      );
    }

    if (isAudio) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <AudioFileIcon className="h-16 w-16 mx-auto mb-4 text-primary" />
            <audio controls className="mb-4 w-full max-w-md">
              <source src={previewUrl} type={file.mime} />
              Your browser does not support the audio element.
            </audio>
            <p className="text-sm text-muted truncate">{file.name}</p>
          </div>
        </div>
      );
    }

    if (isPdf) {
      return (
        <div className="h-full flex flex-col">
          <iframe
            src={previewUrl}
            className="flex-1 w-full border-0 rounded"
            title={file.name}
            onError={(e) => {
              e.currentTarget.style.display = "none";
              e.currentTarget.nextElementSibling?.classList.remove("hidden");
            }}
          />
          <div className="hidden text-center text-muted p-8">
            <PictureAsPdfIcon className="h-16 w-16 mx-auto mb-4" />
            <p>PDF preview not available</p>
          </div>
        </div>
      );
    }

    if (isText) {
      return (
        <div className="h-full flex flex-col">
          <iframe
            src={previewUrl}
            className="flex-1 w-full border border-divider rounded"
            title={file.name}
            onError={(e) => {
              e.currentTarget.style.display = "none";
              e.currentTarget.nextElementSibling?.classList.remove("hidden");
            }}
          />
          <div className="hidden text-center text-muted p-8">
            <InsertDriveFileIcon className="h-16 w-16 mx-auto mb-4" />
            <p>Text preview not available</p>
          </div>
        </div>
      );
    }

    // Default fallback
    return (
      <div className="flex items-center justify-between h-full">
        <div className="text-center text-muted max-w-sm">
          <InsertDriveFileIcon className="h-16 w-16 mx-auto mb-4" />
          <p className="mb-4">Preview not available for this file type</p>
          <p className="text-sm mb-4 truncate">{file.name}</p>
          <a
            href={downloadUrl}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark"
            download
          >
            <DownloadIcon className="h-4 w-4" />
            Download File
          </a>
        </div>
      </div>
    );
  };


  return (
    <DialogTrigger
      type="modal"
      isOpen={isOpen}
      onClose={onClose}
    >
      <Dialog size="fullScreen">
        <DialogHeader>
          <div className="flex items-center justify-between w-full gap-4">
            {/* File info */}
            <div className="min-w-0">
              <h3 className="text-lg font-semibold truncate">{file.name}</h3>
              <p className="text-sm text-muted truncate">
                {file.formatted_size} • {file.mime}
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <a
                href={downloadUrl}
                className="inline-flex items-center gap-2 px-3 py-1.5 text-sm bg-primary text-white rounded hover:bg-primary-dark"
                download
              >
                <DownloadIcon className="h-4 w-4" />
                <span className="hidden sm:inline">Download</span>
              </a>
            </div>
          </div>
        </DialogHeader>

        <DialogBody className="p-0 h-full">
          {renderPreview()}
        </DialogBody>
      </Dialog>
    </DialogTrigger>
  );
}

export function TransferDetailPage() {
  const { transferId } = useParams();
  const { data: transfer, isLoading, error } = useTransferDetail(transferId);
  const [activePreviewIndex, setActivePreviewIndex] = useState(null);
  const [previewFile, setPreviewFile] = useState(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const queryClient = useQueryClient();

  console.log('TransferDetailPage render:', { transferId, isLoading, error, transfer });

  // Mutation for expiring transfer
  const expireTransferMutation = useMutation({
    mutationFn: (transferId) =>
      apiClient.post(`admin/transfer-files/${transferId}/expire`),
    onSuccess: () => {
      toast.positive('Transfer has been expired successfully');
      queryClient.invalidateQueries(['admin-transfer-detail', transferId]);
    },
    onError: (error) => {
      toast.danger(error?.response?.data?.message || 'Failed to expire transfer');
    }
  });

  // Mutation for deleting transfer
  const deleteTransferMutation = useMutation({
    mutationFn: (transferId) =>
      apiClient.delete(`admin/transfer-files/${transferId}`),
    onSuccess: () => {
      toast.positive('Transfer has been deleted successfully');
      // Redirect to transfers list after successful deletion
      window.location.href = '/admin/transfer-files';
    },
    onError: (error) => {
      toast.danger(error?.response?.data?.message || 'Failed to delete transfer');
    }
  });

  const handleExpireTransfer = () => {
    expireTransferMutation.mutate(transferId);
  };

  const handleDeleteTransfer = () => {
    deleteTransferMutation.mutate(transferId);
  };

  const handleFilePreview = (file, index) => {
    setPreviewFile(file);
    setActivePreviewIndex(index);
    setIsPreviewOpen(true);
  };

  const handleClosePreview = () => {
    setIsPreviewOpen(false);
    setPreviewFile(null);
    setActivePreviewIndex(null);
  };

  if (isLoading) {
    console.log('Showing loading state');
    return <PageStatus query={{ isLoading, error }} loaderClassName="absolute inset-0 m-auto" />;
  }

  if (error) {
    console.log('Showing error state:', error);
    return <PageStatus query={{ isLoading, error }} loaderClassName="absolute inset-0 m-auto" />;
  }

  if (!transfer) {
    console.log('No transfer data found');
    return (
      <div className="p-24 text-center">
        <Trans message="Transfer not found" />
      </div>
    );
  }

  console.log('Rendering transfer details:', transfer);
  const getStatusColor = (status) => {
    switch (status) {
      case 'expired':
        return 'danger';
      case 'download_limit_reached':
        return 'warning';
      default:
        return 'positive';
    }
  };

  const getStatusMessage = (status) => {
    switch (status) {
      case 'expired':
        return <Trans message="Expired" />;
      case 'download_limit_reached':
        return <Trans message="Download limit reached" />;
      case 'active':
      default:
        return <Trans message="Active" />;
    }
  };

  const getFileIcon = (mimeType) => {
    if (!mimeType) return <InsertDriveFileIcon className="text-muted" />;

    if (mimeType.startsWith('image/')) {
      return <ImageIcon className="text-blue-500" />;
    } else if (mimeType.startsWith('video/')) {
      return <VideoFileIcon className="text-red-500" />;
    } else if (mimeType.startsWith('audio/')) {
      return <AudioFileIcon className="text-green-500" />;
    } else if (mimeType === 'application/pdf') {
      return <PictureAsPdfIcon className="text-red-600" />;
    } else {
      return <InsertDriveFileIcon className="text-muted" />;
    }
  };

  const isPreviewable = (mimeType) => {
    if (!mimeType) return false;
    return mimeType.startsWith('image/') ||
      mimeType.startsWith('video/') ||
      mimeType.startsWith('audio/') ||
      mimeType === 'application/pdf' ||
      mimeType.startsWith('text/');
  };
  console.log("transfer", transfer)
  return (
    <div className="mb-2 w-full rounded-panel bg px-4 py-4 md:px-8 md:py-8 pt-20 md:pt-5">
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl font-semibold mb-4">
          Transfer File Details
        </h1>

      </div>

      {/* Header */}
      <div className="mb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Left Section */}
        <div className="flex flex-wrap items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            elementType={Link}
            to="/admin/transfer-files"
            startIcon={<ArrowBackIcon />}
          >
            <Trans message="Back to transfers" />
          </Button>
        </div>

        {/* Right Section */}
        <div className="flex flex-wrap items-center gap-3 sm:gap-4">
          {/* Expire Transfer */}
          {transfer.status !== 'expired' && (
            <DialogTrigger
              type="modal"
              onClose={(isConfirmed) => {
                if (isConfirmed) handleExpireTransfer();
              }}
            >
              <Button
                variant="outline"
                color="warning"
                size="sm"
                startIcon={<AccessTimeIcon />}
                disabled={expireTransferMutation.isPending}
              >
                <Trans message="Expire Transfer" />
              </Button>
              <ConfirmationDialog
                title={<Trans message="Expire Transfer" />}
                body={
                  <Trans message="Are you sure you want to expire this transfer? This action cannot be undone and will make the transfer inaccessible." />
                }
                confirm={<Trans message="Expire Transfer" />}
                isDanger
              />
            </DialogTrigger>
          )}

          {/* Delete Transfer */}
          <DialogTrigger
            type="modal"
            onClose={(isConfirmed) => {
              if (isConfirmed) handleDeleteTransfer();
            }}
          >
            <Button
              variant="outline"
              color="danger"
              size="sm"
              startIcon={<DeleteIcon />}
              disabled={deleteTransferMutation.isPending}
            >
              <Trans message="Delete Transfer" />
            </Button>
            <ConfirmationDialog
              title={<Trans message="Delete Transfer" />}
              body={
                <Trans message="Are you sure you want to delete this transfer? This action cannot be undone and will permanently remove all transfer data and files." />
              }
              confirm={<Trans message="Delete Transfer" />}
              isDanger
            />
          </DialogTrigger>

          {/* Share Links */}
          {transfer.share_url && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(transfer.share_url, "_blank")}
                startIcon={<LinkIcon />}
              >
                <Trans message="Open share link" />
              </Button>
              <Tooltip label={<Trans message="Copy share link" />}>
                <IconButton
                  size="sm"
                  onClick={() => navigator.clipboard.writeText(transfer.share_url)}
                >
                  <LinkIcon />
                </IconButton>
              </Tooltip>
            </>
          )}
        </div>
      </div>

      {transfer.files && transfer.files.length > 0 && (
        <div className="rounded-panel border bg-paper shadow-sm mt-8 mb-4 ">
          <div className="p-4 pb-2">
            <h2 className="text-lg font-semibold flex items-center gap-2 md:gap-4">
              <FolderIcon />
              <Trans message="Files" />
              <Chip color="primary" size="sm">
                {transfer.files.length}
              </Chip>
            </h2>
          </div>

          <div className="p-4 pt-0">
            <div className="space-y-4">
              {transfer.files.map((file, index) => (
                <div
                  key={file.id}
                  className={`flex flex-col md:flex-row md:items-center md:justify-between p-4 rounded-md bg-alt/30 hover:bg-alt/50 transition-colors ${isPreviewable(file.mime) ? 'cursor-pointer' : ''
                    }`}
                  onClick={() => isPreviewable(file.mime) && handleFilePreview(file, index)}
                >
                  {/* Left: File details */}
                  <div className="flex items-start md:items-center gap-4 md:gap-8 min-w-0 flex-1">
                    <div className="flex-shrink-0">{getFileIcon(file.mime)}</div>
                    <div className="min-w-0 flex-1">
                      <div
                        className="font-medium text-sm truncate"
                        title={file.name}
                      >
                        {file.name}
                        {isPreviewable(file.mime) && (
                          <span className="ml-2 text-xs text-primary opacity-70">
                            <Trans message="Click to preview" />
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-muted mt-1">
                        <span>{file.formatted_size}</span>
                        <span>•</span>
                        <span>{file.mime || 'Unknown type'}</span>
                        <span>•</span>
                        <span>
                          <Trans message="Uploaded" />{' '}
                          <FormattedDate date={file.created_at} />
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Index chip */}
                  <div className="mt-2 md:mt-0 flex items-center md:ml-4">
                    <Chip color="chip" size="xs">
                      #{index + 1}
                    </Chip>
                  </div>
                </div>
              ))}
            </div>

            {/* Files Summary */}
            <div className="mt-2 pt-2 md:mt-8 md:pt-8 border-t">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-12 text-sm">
                <div className="text-center">
                  <div className="font-medium text-muted">
                    <Trans message="Total Files" />
                  </div>
                  <div className="text-lg font-semibold mt-1">
                    {transfer.files.length}
                  </div>
                </div>

                <div className="text-center">
                  <div className="font-medium text-muted">
                    <Trans message="Total Size" />
                  </div>
                  <div className="text-lg font-semibold mt-1">
                    <FormattedBytes bytes={transfer.file_size} />
                  </div>
                </div>

                <div className="text-center">
                  <div className="font-medium text-muted">
                    <Trans message="Average Size" />
                  </div>
                  <div className="text-lg font-semibold mt-1">
                    <FormattedBytes
                      bytes={Math.round(transfer.file_size / transfer.files.length)}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Main Information */}
      <div className="rounded-panel border bg-paper shadow-sm mt-8 mb-4 ">
        <div className="p-4 flex flex-col md:flex-row justify-between items-center">
          {/* Left: Title */}
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <FolderIcon className="h-5 w-5" />
            <Trans message="Transfer Information" />
          </h2>

          {/* Right: Chips */}
          <div className="mt-2 md:mt-0 flex flex-wrap items-center gap-2">
            <Chip color={getStatusColor(transfer.status)} size="sm">
              {getStatusMessage(transfer.status)}
            </Chip>
            {transfer.has_password && (
              <Chip color="primary" size="sm" startIcon={<SecurityIcon />}>
                <Trans message="Password Protected" />
              </Chip>
            )}
          </div>
        </div>

        <div className="p-4 pt-0">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3 text-sm">
            {/* File Name */}
            <div>
              <label className="text-sm font-medium text-muted flex items-center gap-2">
                <Trans message="File Name" />
              </label>
              <div className="mt-2">{transfer.original_filename || 'Untitled'}</div>
            </div>

            {/* File Size */}
            <div>
              <label className="text-sm font-medium text-muted flex items-center gap-2">
                <Trans message="File Size" />
              </label>
              <div className="mt-2">
                <FormattedBytes bytes={transfer.file_size} />
                {transfer.files_count > 1 && (
                  <span className="text-muted"> • {transfer.files_count} files</span>
                )}
              </div>
            </div>

            {/* Downloads */}
            <div>
              <label className="text-sm font-medium text-muted flex items-center gap-2">
                <Trans message="Downloads" />
              </label>
              <div className="mt-2 flex items-center gap-2">
                <DownloadIcon className="text-muted" />
                {transfer.download_count}
                {transfer.max_downloads && (
                  <span className="text-muted"> / {transfer.max_downloads}</span>
                )}
              </div>
            </div>

            {/* Created */}
            <div>
              <label className="text-sm font-medium text-muted flex items-center gap-2">
                <Trans message="Created" />
              </label>
              <div className="mt-2 flex items-center gap-2">
                <ScheduleIcon className="text-muted" />
                <FormattedDate date={transfer.created_at} />
              </div>
            </div>

            {/* Expires */}
            {transfer.expires_at && (
              <div>
                <label className="text-sm font-medium text-muted flex items-center gap-2">
                  <Trans message="Expires" />
                </label>
                <div className="mt-2 flex items-center gap-2">
                  <ScheduleIcon className="text-muted" />
                  <FormattedDate date={transfer.expires_at} />
                </div>
              </div>
            )}

            {/* Sender */}
            <div>
              <label className="text-sm font-medium text-muted flex items-center gap-2">
                <Trans message="Sender" />
              </label>
              <div className="mt-2 flex items-center gap-2">
                {transfer.sender_email ? (
                  <>
                    <EmailIcon className="text-muted" />
                    {transfer.sender_email}
                  </>
                ) : (
                  <span className="text-muted">
                    <Trans message="Anonymous sender" />
                  </span>
                )}
              </div>
            </div>

            {/* Recipients */}
            {transfer.recipient_emails && (
              <div>
                <label className="text-sm font-medium text-muted flex items-center gap-2">
                  <Trans message="Recipients" />
                </label>
                <div className="mt-2 flex items-start gap-2 min-w-0">
                  <EmailIcon className="text-muted flex-shrink-0" />
                  <span className="text-sm break-all leading-relaxed">
                    {transfer.recipient_emails}
                  </span>
                </div>
              </div>

            )}

            {/* {Message} */}
            {transfer.message && (
              <div>
                <label className="text-sm font-medium text-muted flex items-center gap-2">
                  <Trans message="Message" />
                </label>
                <div className="mt-2 flex items-center gap-2">
                  <MessageIcon className="text-muted" />
                  {transfer.message}
                </div>
              </div>
            )}

            <div className="col-span-2">
              <div className="flex items-center gap-2 mb-2">
                <SecurityIcon className="h-4 w-4 text-muted" />
                <span className="text-sm font-medium text-muted">
                  <Trans message="Security" />
                </span>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span><Trans message="Password Protected" /></span>
                  <Chip color={transfer.has_password ? 'positive' : 'chip'} size="xs">
                    {transfer.has_password ? 'Yes' : 'No'}
                  </Chip>
                </div>
                {transfer.max_downloads && (
                  <div className="flex items-center justify-between">
                    <span><Trans message="Download Limit" /></span>
                    <Chip color="primary" size="xs">{transfer.max_downloads}</Chip>
                  </div>
                )}
                {transfer.expires_at && (
                  <div className="flex items-center justify-between">
                    <span><Trans message="Auto Expires" /></span>
                    <Chip color="warning" size="xs">
                      <Trans message="Yes" />
                    </Chip>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>


      {/* Sidebar Information */}
      {/* <div className="space-y-24">
          <div className="rounded-panel border bg-paper shadow-sm">
            <div className="p-4 pb-2">
              <h3 className="text-base font-semibold flex items-center gap-8">
                <PersonIcon />
                <Trans message="Sender" />
              </h3>
            </div>
            <div className="p-4 pt-0">
              <div className="text-sm">
                {transfer.sender_email ? (
                  <div className="flex items-center gap-8">
                    <EmailIcon className="text-muted" />
                    {transfer.sender_email}
                  </div>
                ) : (
                  <span className="text-muted">
                    <Trans message="Anonymous sender" />
                  </span>
                )}
              </div>
            </div>
          </div>

          {transfer.recipient_emails && (
            <div className="rounded-panel border bg-paper shadow-sm">
              <div className="p-4 pb-2">
                <h3 className="text-base font-semibold flex items-center gap-8">
                  <EmailIcon />
                  <Trans message="Recipients" />
                </h3>
              </div>
              <div className="p-4 pt-0">
                <div className="space-y-8">
                  {transfer.recipient_emails.split(',').map((email, index) => (
                    <div key={index} className="text-sm flex items-center gap-8">
                      <EmailIcon className="text-muted" />
                      {email.trim()}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className="rounded-panel border bg-paper shadow-sm">
            <div className="p-4 pb-2">
              <h3 className="text-base font-semibold flex items-center gap-8">
                <SecurityIcon />
                <Trans message="Security" />
              </h3>
            </div>
            <div className="p-4 pt-0">
              <div className="space-y-8 text-sm">
                <div className="flex items-center justify-between">
                  <span><Trans message="Password Protected" /></span>
                  <Chip color={transfer.has_password ? 'positive' : 'chip'} size="xs">
                    {transfer.has_password ? 'Yes' : 'No'}
                  </Chip>
                </div>

                {transfer.max_downloads && (
                  <div className="flex items-center justify-between">
                    <span><Trans message="Download Limit" /></span>
                    <Chip color="primary" size="xs">
                      {transfer.max_downloads}
                    </Chip>
                  </div>
                )}

                {transfer.expires_at && (
                  <div className="flex items-center justify-between">
                    <span><Trans message="Auto Expires" /></span>
                    <Chip color="warning" size="xs">
                      <Trans message="Yes" />
                    </Chip>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div> */}
      {/* </div> */}

      {previewFile && (
        <TransferFilePreview
          file={previewFile}
          transfer={transfer}
          isOpen={isPreviewOpen}
          onClose={handleClosePreview}
        />
      )}
    </div>
  );
}