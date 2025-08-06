import React from 'react';
import { useFileUploadStore } from '@common/uploads/uploader/file-upload-provider';
import { useUploadAnalytics } from '@common/uploads/uploader/use-upload-analytics';
import { EnhancedUploadProgress } from '@common/uploads/components/enhanced-upload-progress';
import { prettyBytes } from '@ui/utils/files/pretty-bytes';
/**
 * Demo component showing how to use the new upload analytics features
 * This component demonstrates various ways to access and display upload metrics
 */
export function UploadAnalyticsDemo() {
  const uploads = useFileUploadStore(s => s.fileUploads);
  const activeUploads = [...uploads.values()].filter(upload => upload.status === 'inProgress');
  if (activeUploads.length === 0) {
    return <div className="p-16 text-center text-muted">
        No active uploads to display analytics for
      </div>;
  }
  return <div className="space-y-16 p-16">
      <h2 className="text-lg font-semibold">Upload Analytics Demo</h2>
      
      {activeUploads.map(upload => <UploadAnalyticsItem key={upload.file.id} fileId={upload.file.id} />)}
    </div>;
}
function UploadAnalyticsItem({
  fileId
}) {
  const fileUpload = useFileUploadStore(s => s.fileUploads.get(fileId));
  const analytics = useUploadAnalytics(fileId);
  if (!fileUpload) return null;
  return <div className="border rounded-lg p-16 space-y-12">
      <div className="font-medium">{fileUpload.file.name}</div>
      
      {/* Enhanced Progress Component */}
      <EnhancedUploadProgress file={fileUpload.file} variant="detailed" showDetails />
      
      {/* Raw Analytics Data */}
      <div className="grid grid-cols-2 gap-12 text-sm">
        <div>
          <div className="font-medium text-muted mb-4">Raw Metrics</div>
          <div className="space-y-2">
            <div>Progress: {analytics.percentage.toFixed(2)}%</div>
            <div>Bytes uploaded: {prettyBytes(analytics.bytesUploaded)}</div>
            <div>Speed: {analytics.speed.toFixed(0)} bytes/sec</div>
            <div>ETA: {analytics.eta.toFixed(1)} seconds</div>
            <div>Status: {analytics.status}</div>
          </div>
        </div>
        
        <div>
          <div className="font-medium text-muted mb-4">Formatted Metrics</div>
          <div className="space-y-2">
            <div>Speed: {analytics.speedFormatted || 'Calculating...'}</div>
            <div>ETA: {analytics.etaFormatted || 'Calculating...'}</div>
            <div>File size: {prettyBytes(fileUpload.file.size)}</div>
            <div>Remaining: {prettyBytes(fileUpload.file.size - analytics.bytesUploaded)}</div>
          </div>
        </div>
      </div>

      {/* Compact Progress Component */}
      <div>
        <div className="font-medium text-muted mb-4">Compact View</div>
        <EnhancedUploadProgress file={fileUpload.file} variant="compact" showDetails />
      </div>
    </div>;
}