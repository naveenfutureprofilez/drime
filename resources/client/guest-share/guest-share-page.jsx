import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { apiClient } from '@common/http/query-client';
import { GuestDownloadView } from '@app/drive/shareable-link/shareable-link-page/guest-download-view';
// import { MdErrorOutline, MdAccessTime } from "react-icons/md";
// import { FaExclamationTriangle } from "react-icons/fa";
// import { BiUnlink } from "react-icons/bi";
import { Trans } from '@ui/i18n/trans';
import Layout from '@app/components/Layout';
export function Component() {
  const {
    hash
  } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  useEffect(() => {
    apiClient.get(`guest/upload/${hash}`).then(response => setData(response.data)).catch(err => setError(err));
  }, [hash]);
  return <Layout>
    <main className="">
      <div className="max-w-2xl mx-auto">
        {error ? 
        <div className='p-12 h-full flex justify-center items-center'>
        <div className="text-center text-red-500">
          {/* <MdErrorOutline /> */}
          <h1 className="text-2xl font-bold mb-4 normal-heading">
            Transfer not found !!
          </h1>
          <p className='!text-green-600'>
            The link you are trying to access is either invalid or has expired.
          </p>
        </div> 
        <div className="justify-center  absolute bottom-0 mb-6 w-full left-0">
            <p className='text-black font-semibold text-[14px] text-center'>Need to send more files? <a href="/" className=" text-black underline">
                Start new transfer
            </a> </p>
        </div>
        </div>
        : data ? <GuestDownloadView files={data.files} totalSize={data.files?.reduce((sum, file) => sum + file.size, 0)} expiresAt={data.expires_at} hash={data.hash} hasPassword={data.has_password} /> : <div className="text-center">
          <h1 className="text-2xl font-bold mb-4 text-gray-900">
            <Trans message="Loading..." />
          </h1>
        </div>}
        
      </div>
    </main>
  </Layout>
    ;
}