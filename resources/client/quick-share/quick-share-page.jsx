import React from 'react';
import { useDriveUploadQueue } from '@app/drive/uploading/use-drive-upload-queue';
import { FileUploadWidget } from '@app/transfer/components/file-upload-widget';
import { EmailPanel } from '@app/transfer/components/email-panel';
import { Navbar } from '@common/ui/navigation/navbar/navbar';
import { Button } from '@ui/buttons/button';
import { useState, useCallback } from 'react';
export function QuickSharePage() {
  const {
    uploadFiles
  } = useDriveUploadQueue();
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [emailPanelOpen, setEmailPanelOpen] = useState(false);
  const handleUploadComplete = useCallback(files => setUploadedFiles(files), []);
  return <div className="min-h-screen bg-gray-50">
      <Navbar color="transparent" className="bg-white shadow-sm" menuPosition="homepage-navbar" />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-4xl font-bold mb-4">Quick Share</h1>
          <p className="text-gray-600 mb-8">Easily upload and share your files with a link.</p>
          <FileUploadWidget settings={{
          password: '',
          expiresInHours: 72,
          maxDownloads: null
        }} onUploadComplete={handleUploadComplete} />
        </div>
      {uploadedFiles.length > 0 && <div>
            <h2 className="text-xl font-semibold mt-8">Your link is ready!</h2>
            <div className="bg-white p-4 rounded-lg shadow-md mt-4">
              <p>Share this link with others:</p>
              <Button variant="outline" onClick={async () => {
            navigator.clipboard.writeText(uploadedFiles[0]?.share_url);
            alert('Link copied to clipboard!');
          }} className="mt-2">Copy Link</Button>
              <Button variant="text" onClick={() => setEmailPanelOpen(true)} className="mt-2">Send via Email</Button>
            </div>
            {emailPanelOpen && <EmailPanel files={uploadedFiles} onClose={() => setEmailPanelOpen(false)} />}
          </div>}
      </main>
    </div>;
}