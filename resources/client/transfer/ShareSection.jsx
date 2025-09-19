import TransferSuccessPage from "./components/TransferSuccessPage";

export default function ShareSection({
  files,
  transferSettings,
  onNewTransfer,
  onShowEmailPanel,
  uploadResponse
}) {
  const shareUrl = files && files.length > 0 ? files[0]?.share_url || '' : '';

  if (!files || files.length === 0) {
    return (
      <div className="text-center">
        <div className="text-red-600">
          <p>No files to share. Please upload files first.</p>
        </div>
        <button onClick={onNewTransfer} className="px-8 text-primary mt-4">
          <p>Start new transfer</p>
        </button>
      </div>
    );
  }
  return   <TransferSuccessPage 
      downloadLink={shareUrl} 
      onEmailTransfer={onShowEmailPanel} 
      files={files} 
      expiresInHours={transferSettings?.expiresInHours}
      onNewTransfer={onNewTransfer}
      uploadResponse={uploadResponse}
    />;
    {/* <ShareLinkPanel shareUrl={shareUrl} files={files}  onEmailTransfer={onShowEmailPanel}  /> */}
}