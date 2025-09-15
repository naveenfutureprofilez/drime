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
import { FolderIcon } from '@ui/icons/material/Folder';
import { IconButton } from '@ui/buttons/icon-button';
import { Tooltip } from '@ui/tooltip/tooltip';

function useTransferDetail(transferId) {
  return useQuery({
    queryKey: ['transfer-files', transferId],
    queryFn: () => apiClient.get(`admin/transfer-files/${transferId}`).then(response => response.data),
  });
}

export function TransferDetailPage() {
  const { transferId } = useParams();
  const { data: transfer, isLoading, error } = useTransferDetail(transferId);

  if (isLoading || error) {
    return <PageStatus query={{ isLoading, error }} loaderClassName="absolute inset-0 m-auto" />;
  }

  if (!transfer) {
    return (
      <div className="p-24 text-center">
        <Trans message="Transfer not found" />
      </div>
    );
  }

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
        return 'Expired';
      case 'download_limit_reached':
        return 'Limit Reached';
      default:
        return 'Active';
    }
  };

  return (
    <div className="p-24">
      {/* Header */}
      <div className="mb-24 flex items-center justify-between">
        <div className="flex items-center gap-12">
          <Button
            variant="outline"
            size="sm"
            elementType={Link}
            to="/admin/transfer-files"
            startIcon={<ArrowBackIcon />}
          >
            <Trans message="Back to transfers" />
          </Button>
          <div>
            <h1 className="text-2xl font-semibold">
              {transfer.title || transfer.original_filename || 'Untitled Transfer'}
            </h1>
            <div className="mt-4 flex items-center gap-8">
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
        </div>
        
        {transfer.share_url && (
          <div className="flex items-center gap-8">
            <Tooltip label={<Trans message="Copy share link" />}>
              <IconButton
                onClick={() => navigator.clipboard.writeText(transfer.share_url)}
              >
                <LinkIcon />
              </IconButton>
            </Tooltip>
            <Button
              variant="outline"
              onClick={() => window.open(transfer.share_url, '_blank')}
              startIcon={<LinkIcon />}
            >
              <Trans message="Open share link" />
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-24 lg:grid-cols-3">
        {/* Main Information */}
        <div className="lg:col-span-2">
          <div className="rounded-panel border bg-paper shadow-sm">
            <div className="p-4 pb-2">
              <h2 className="text-lg font-semibold flex items-center gap-8">
                <FolderIcon />
                <Trans message="Transfer Information" />
              </h2>
            </div>
            <div className="p-4 pt-0">
              <div className="space-y-16">
                <div className="grid grid-cols-1 gap-16 md:grid-cols-2">
                  <div>
                    <label className="text-sm font-medium text-muted">
                      <Trans message="File Name" />
                    </label>
                    <div className="mt-4 text-sm">
                      {transfer.original_filename || 'Untitled'}
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-muted">
                      <Trans message="File Size" />
                    </label>
                    <div className="mt-4 text-sm">
                      <FormattedBytes bytes={transfer.file_size} />
                      {transfer.files_count > 1 && (
                        <span className="text-muted"> • {transfer.files_count} files</span>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-muted">
                      <Trans message="Downloads" />
                    </label>
                    <div className="mt-4 text-sm flex items-center gap-4">
                      <DownloadIcon className="text-muted" />
                      {transfer.download_count}
                      {transfer.max_downloads && (
                        <span className="text-muted"> / {transfer.max_downloads}</span>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-muted">
                      <Trans message="Created" />
                    </label>
                    <div className="mt-4 text-sm flex items-center gap-4">
                      <ScheduleIcon className="text-muted" />
                      <FormattedDate date={transfer.created_at} />
                    </div>
                  </div>
                  
                  {transfer.expires_at && (
                    <div>
                      <label className="text-sm font-medium text-muted">
                        <Trans message="Expires" />
                      </label>
                      <div className="mt-4 text-sm flex items-center gap-4">
                        <ScheduleIcon className="text-muted" />
                        <FormattedDate date={transfer.expires_at} />
                      </div>
                    </div>
                  )}
                </div>
                
                {transfer.message && (
                  <>
                    <div className="border-t my-16" />
                    <div>
                      <label className="text-sm font-medium text-muted flex items-center gap-4">
                        <MessageIcon />
                        <Trans message="Message" />
                      </label>
                      <div className="mt-8 rounded-md bg-alt p-12 text-sm">
                        {transfer.message}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Information */}
        <div className="space-y-24">
          {/* Sender Information */}
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

          {/* Recipients */}
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

          {/* Security Information */}
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
        </div>
      </div>
    </div>
  );
}