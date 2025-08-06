import React, { useState, useCallback } from 'react';
import { Button } from '@ui/buttons/button';
import { IconButton } from '@ui/buttons/icon-button';
import { ContentCopyIcon } from '@ui/icons/material/ContentCopy';
import { EmailIcon } from '@ui/icons/material/Email';
import { CheckIcon } from '@ui/icons/material/Check';
import { InsertDriveFileIcon } from '@ui/icons/material/InsertDriveFile';
import { Trans } from '@ui/i18n/trans';
import { prettyBytes } from '@ui/utils/files/pretty-bytes';
export function ShareLinkPanel({
  shareUrl,
  files,
  onEmailTransfer
}) {
  const [copied, setCopied] = useState(false);
  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = shareUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [shareUrl]);
  const totalSize = files.reduce((sum, file) => sum + file.size, 0);
  const expiresAt = files[0]?.expires_at ? new Date(files[0].expires_at) : null;
  return <div className="space-y-6">
      {/* Files List */}
      <div className="bg-gray-50 rounded-xl p-4">
        <h3 className="font-medium  mb-3">
          <Trans message="Files ready for download" />
        </h3>
        <div className="space-y-2">
          {files.map((file, index) => <div key={index} className="flex items-center gap-3 bg-white border border-black rounded-lg p-3">
              <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center">
                <InsertDriveFileIcon className="w-4 h-4 text-blue-600" />
              </div>
              <div className="flex-1 text-left">
                <div className="text-sm font-medium ">{file.filename}</div>
                <div className="text-xs ">{prettyBytes(file.size)}</div>
              </div>
            </div>)}
        </div>
        
        <div className="mt-3 pt-3 border-t border-gray-200 flex justify-between text-sm">
          <span className="text-gray-600">
            <Trans message="Total size:" />
          </span>
          <span className="font-medium">{prettyBytes(totalSize)}</span>
        </div>
        
        {expiresAt && <div className="mt-2 text-xs ">
            <Trans message="Expires on :date" values={{
          date: expiresAt.toLocaleDateString()
        }} />
          </div>}
      </div>

      {/* Share Link */}
      <div>
        <label className="block text-sm font-medium  mb-2">
          <Trans message="Share this link" />
        </label>
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <input type="text" value={shareUrl}  className="w-full px-4 py-3 bg-white  border border-black rounded-lg text-sm font-mono" />
          </div>
          <IconButton onClick={handleCopy} className={`px-4 py-3 ${copied ? 'bg-green-500 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}>
            {copied ? <CheckIcon className="w-5 h-5" /> : <ContentCopyIcon className="w-5 h-5" />}
          </IconButton>
        </div>
        {copied && <p className="text-sm text-green-600 mt-1">
            <Trans message="Link copied to clipboard!" />
          </p>}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 justify-center pt-4">
        <button   onClick={onEmailTransfer}>
          <EmailIcon /> <Trans message="Send via email" />
        </button>
        <button  onClick={() => window.open(shareUrl, '_blank')}>
          <Trans message="Open download page" />
        </button>
      </div>
    </div>;
}