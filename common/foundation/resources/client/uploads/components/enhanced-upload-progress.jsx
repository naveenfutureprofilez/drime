import React from 'react';
import { ProgressCircle } from '@ui/progress/progress-circle';
import { useUploadAnalytics } from '../uploader/use-upload-analytics';
import { prettyBytes } from '@ui/utils/files/pretty-bytes';
import { Trans } from '@ui/i18n/trans';
/**
 * Enhanced upload progress component that displays detailed analytics
 * including speed, ETA, and progress information
 */
export function EnhancedUploadProgress({
  file,
  showDetails = true,
  variant = 'detailed'
}) {
  const analytics = useUploadAnalytics(file.id);
  if (variant === 'compact') {
    return <div className="flex items-center gap-8">
        <ProgressCircle size="w-16 h-16" value={analytics.percentage} trackWidth={2} />
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium truncate">{file.name}</div>
          {showDetails && <div className="text-xs text-muted flex items-center gap-4">
              <span>{analytics.percentage.toFixed(0)}%</span>
              {analytics.speedFormatted && <span>{analytics.speedFormatted}</span>}
              {analytics.etaFormatted && <span>ETA: {analytics.etaFormatted}</span>}
            </div>}
        </div>
      </div>;
  }
  return <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="font-medium truncate">{file.name}</div>
        <div className="text-sm text-muted">
          {analytics.percentage.toFixed(1)}%
        </div>
      </div>

      <div className="w-full bg-chip rounded-full h-2">
        <div className="bg-primary h-2 rounded-full transition-all duration-300" style={{
        width: `${analytics.percentage}%`
      }} />
      </div>

      {showDetails && <div className="flex items-center justify-between text-xs text-muted">
          <div className="flex items-center gap-4">
            <Trans message=":uploaded of :total" values={{
          uploaded: prettyBytes(analytics.bytesUploaded),
          total: prettyBytes(file.size)
        }} />
            {analytics.speedFormatted && <>
                <span>•</span>
                <span>{analytics.speedFormatted}</span>
              </>}
          </div>
          {analytics.etaFormatted && <div>
              <Trans message="ETA: :eta" values={{
          eta: analytics.etaFormatted
        }} />
            </div>}
        </div>}
    </div>;
}