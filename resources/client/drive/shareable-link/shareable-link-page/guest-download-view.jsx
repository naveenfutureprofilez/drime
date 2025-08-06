import React from 'react';
import { Button } from '@ui/buttons/button';
import { Trans } from '@ui/i18n/trans';
import { prettyBytes } from '@ui/utils/files/pretty-bytes';
export const GuestDownloadView = ({
  files,
  totalSize,
  expiresAt
}) => {
  return <div className="space-y-6">
      {/* File List */}
      <div className="bg-gray-50 rounded-xl p-4">
        <h3 className="font-medium text-gray-900 mb-3">
          <Trans message="Download Files" />
        </h3>
        <div className="space-y-2">
          {files?.map((file, index) => <div key={index} className="flex items-center gap-3 bg-white rounded-lg p-3">
              <div className="flex-1 text-left">
                <div className="text-sm font-medium text-gray-900">{file.name || file.filename || file.original_filename}</div>
                <div className="text-xs text-gray-500">{prettyBytes(file.file_size || file.size || 0)}</div>
              </div>
            </div>) || []}
        </div>

        <div className="mt-3 pt-3 border-t border-gray-200 flex justify-between text-sm">
          <span className="text-gray-600">
            <Trans message="Total size:" />
          </span>
          <span className="font-medium">{prettyBytes(totalSize)}</span>
        </div>

        {expiresAt && <div className="mt-2 text-xs text-gray-500">
            <Trans message="Expires on :date" values={{
          date: new Date(expiresAt).toLocaleDateString()
        }} />
          </div>}
      </div>

      {/* Download Button */}
      <div className="flex justify-center pt-4">
        <Button variant="flat" color="primary" onClick={() => {
        if (files && files.length === 1) {
          // Single file - direct download
          const file = files[0];
          const downloadUrl = file.download_url || `/download/${file.hash}`;
          window.open(downloadUrl, '_blank');
        } else if (files && files.length > 1) {
          // Multiple files - ZIP download (for future enhancement)
          alert('ZIP download for multiple files will be implemented soon.');
        } else {
          alert('No files available for download.');
        }
      }}>
          <Trans message="Download all" />
        </Button>
      </div>
    </div>;
};