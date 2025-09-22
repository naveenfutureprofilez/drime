import React, { useState, useEffect } from 'react';
import { apiClient } from '@common/http/query-client';
import { Trans } from '@ui/i18n/trans';
import { Button } from '@ui/buttons/button';
import { DeleteIcon } from '@ui/icons/material/Delete';
import { DeleteSweepIcon } from '@ui/icons/material/DeleteSweep';
import { IconButton } from '@ui/buttons/icon-button';
import { Link } from 'react-router';
import { LinkIcon } from '@ui/icons/material/Link';
import { FileUploadIcon } from '@ui/icons/material/FileUpload';
import { Tooltip } from '@ui/tooltip/tooltip';
import { VisibilityIcon } from '@ui/icons/material/Visibility';
import { DownloadIcon } from '@ui/icons/material/Download';
import { SecurityIcon } from '@ui/icons/material/Security';
import { EmailIcon } from '@ui/icons/material/Email';
import { PersonIcon } from '@ui/icons/material/Person';
import { SearchIcon } from '@ui/icons/material/Search';
import { FormattedDate } from '@ui/i18n/formatted-date';
import { FormattedRelativeTime } from '@ui/i18n/formatted-relative-time';
import { TextField } from '@ui/forms/input-field/text-field/text-field';
import { Checkbox } from '@ui/forms/toggle/checkbox';
import { Select } from '@ui/forms/select/select';
import { Item } from '@ui/forms/listbox/item';
import { FilterListIcon } from '@ui/icons/material/FilterList';

// Simple utility functions
function getStatusInfo(status) {
  switch (status) {
    case 'expired':
      return { color: 'bg-red-100 text-red-800', text: 'Expired' };
    case 'download_limit_reached':
      return { color: 'bg-yellow-100 text-yellow-800', text: 'Limit Reached' };
    default:
      return { color: 'bg-green-100 text-green-800', text: 'Active' };
  }
}

function SimpleTable({ transfers, selectedIds, onSelectionChange, onDelete }) {
  const handleSelectAll = (checked) => {
    if (checked) {
      onSelectionChange(transfers.map(t => t.id));
    } else {
      onSelectionChange([]);
    }
  };

  const handleRowSelect = (id, checked) => {
    if (checked) {
      onSelectionChange([...selectedIds, id]);
    } else {
      onSelectionChange(selectedIds.filter(selectedId => selectedId !== id));
    }
  };

  const isAllSelected = transfers.length > 0 && selectedIds.length === transfers.length;
  const isIndeterminate = selectedIds.length > 0 && selectedIds.length < transfers.length;

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <table className="min-w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left">
              <Checkbox
                checked={isAllSelected}
                isIndeterminate={isIndeterminate}
                onChange={handleSelectAll}
              />
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              File Details
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Sender & Recipient
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status & Activity
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Timeline
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {transfers.map((transfer) => {
            const statusInfo = getStatusInfo(transfer.status);
            const isSelected = selectedIds.includes(transfer.id);
            
            return (
              <tr key={transfer.id} className={`hover:bg-gray-50 ${isSelected ? 'bg-blue-50' : ''}`}>
                <td className="px-6 py-4">
                  <Checkbox
                    checked={isSelected}
                    onChange={(checked) => handleRowSelect(transfer.id, checked)}
                  />
                </td>
                <td className="px-6 py-4">
                  <div className=" items-center">
                      <div className="text-sm line-clamp-1 max-w-[200px] font-medium text-gray-900">
                        {transfer.original_filename || 'Untitled Transfer'}
                      </div>
                      <div className="text-sm text-gray-500">
                        {transfer.formatted_size || transfer.file_size || 'Unknown size'}
                        {(transfer.files_count > 1 || transfer.file_count > 1) && ` • ${transfer.files_count || transfer.file_count} files`}
                        {transfer.has_password && (
                          <span className="ml-2 inline-flex items-center">
                            <SecurityIcon className="h-3 w-3 mr-1" />
                            Protected
                          </span>
                        )}
                      </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="space-y-1">
                    <div className="flex items-center text-sm text-gray-900">
                      <PersonIcon className="h-4 w-4 mr-2 text-gray-400" />
                      {transfer.sender_email || <span className="italic text-gray-400">Anonymous</span>}
                    </div>
                    {transfer.recipient_emails && (
                      <div className="flex items-center text-sm text-gray-500">
                        <EmailIcon className="h-4 w-4 mr-2 text-gray-400" />
                        {transfer.recipient_emails}
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="space-y-2">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusInfo.color}`}>
                      {statusInfo.text}
                    </span>
                    <div className="flex items-center text-xs text-gray-500">
                      <DownloadIcon className="h-3 w-3 mr-1" />
                      {transfer.download_count || transfer.downloads_count || 0} downloads
                      {(transfer.max_downloads || transfer.download_limit) && <span> / {transfer.max_downloads || transfer.download_limit}</span>}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900">
                    <FormattedDate date={transfer.created_at} />
                  </div>
                  <div className="text-sm text-gray-500">
                    <FormattedRelativeTime date={transfer.created_at} />
                  </div>
                  {transfer.expires_at && (
                    <div className="text-xs text-gray-400 mt-1">
                      Expires: <FormattedDate date={transfer.expires_at} preset="short" />
                    </div>
                  )}
                </td>
                <td className="px-6 py-4">
                  <div className="">
                      <ul>
                      <li>
                        <Link to={`/admin/transfer-files/${transfer.id}`}>
                          <button className=" text-primary  hover:text-blue-800">
                            <VisibilityIcon className=" text-primary h-4 w-4 text-2xl" /> 
                            <span className='ml-2'>View Transfer</span>
                          </button>
                        </Link>
                      </li>
                      {/* <li>
                        <button
                          onClick={() => navigator.clipboard.writeText(transfer.share_url)}
                          className="text-gray-600 hover:text-gray-800" >
                          <LinkIcon className="h-4 w-4" />
                        </button>
                      </li> */}

                      <li className='mt-2'>
                        <button
                          onClick={() => onDelete(transfer.id, transfer.original_filename)}
                          className="text-danger hover:text-red-800"
                        >
                          <DeleteIcon className="h-4 w-4 text-danger font-bold text-2xl" /> Delete Transfer
                        </button>
                      </li>
                    </ul>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export function NewTransferFilesPage() {
  const [transfers, setTransfers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Fetch transfers from API
  useEffect(() => {
    const fetchTransfers = async () => {
      try {
        setLoading(true);
        console.log('Fetching transfers with params:', {
          page: currentPage,
          query: searchQuery,
          status: statusFilter !== 'all' ? statusFilter : undefined,
          per_page: 15
        });
        
        const params = {
          page: currentPage,
          per_page: 15
        };
        
        if (searchQuery) {
          params.search = searchQuery;
        }
        
        if (statusFilter && statusFilter !== 'all') {
          params.status = statusFilter;
        }
        
        const response = await apiClient.get('admin/transfer-files', { params });
        
        console.log('API Response:', response.data);
        
        // Handle the specific backend response structure
        if (response.data && response.data.pagination) {
          const paginationData = response.data.pagination;
          
          console.log('Pagination data:', paginationData);
          
          setTransfers(paginationData.data || []);
          setTotalCount(paginationData.total || 0);
          setTotalPages(paginationData.last_page || 1);
        } else {
          console.warn('Unexpected API response structure:', response.data);
          setTransfers([]);
          setTotalCount(0);
          setTotalPages(1);
        }
      } catch (error) {
        console.error('Error fetching transfers:', error);
        console.error('Error details:', error.response?.data);
        setTransfers([]);
        setTotalCount(0);
      } finally {
        setLoading(false);
      }
    };

    fetchTransfers();
  }, [currentPage, searchQuery, statusFilter]);

  // Handle delete transfer
  const handleDelete = async (id, filename) => {
    if (window.confirm(`Delete "${filename || 'this transfer'}"?\n\nThis action cannot be undone.`)) {
      try {
        await apiClient.delete(`admin/transfer-files/${id}`);
        setTransfers(transfers.filter(t => t.id !== id));
        setSelectedIds(selectedIds.filter(selectedId => selectedId !== id));
      } catch (error) {
        console.error('Error deleting transfer:', error);
        alert('Failed to delete transfer');
      }
    }
  };

  // Handle bulk delete
  const handleBulkDelete = async () => {
    if (window.confirm(`Delete ${selectedIds.length} selected transfers?\n\nThis action cannot be undone.`)) {
      try {
        await apiClient.post('admin/transfer-files/bulk-delete', {
          ids: selectedIds
        });
        setTransfers(transfers.filter(t => !selectedIds.includes(t.id)));
        setSelectedIds([]);
      } catch (error) {
        console.error('Error deleting transfers:', error);
        alert('Failed to delete transfers');
      }
    }
  };

  // Handle cleanup expired
  const handleCleanup = async () => {
    if (window.confirm('Clean up all expired transfers?\n\nThis will permanently delete all expired transfers.')) {
      try {
        await apiClient.post('admin/transfer-files/cleanup');
        // Refresh the list
        window.location.reload();
      } catch (error) {
        console.error('Error cleaning up transfers:', error);
        alert('Failed to cleanup transfers');
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading transfers...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Transfer Files Management
          </h1>
          <p className="text-lg text-gray-600">
            Monitor and manage all file transfers in your WeTransfer service
          </p>
        </div>

        {/* Search and Actions */}
        <div className="mb-6 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            <div className="relative flex-1 max-w-md">
              <TextField
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by filename, sender, or recipient..."
                className="max-w-[300px]"
              />
            </div>
            {/* <div className="min-w-48">
              <select 
                defaultValue={statusFilter}
                onChange={(value) => {
                  setStatusFilter(value);
                  setCurrentPage(1);
                }}
                placeholder="Filter by status" className="!p-4" >
                <option className='!p-4' value="all">All Transfers</option>
                <option className='!p-4' value="active">Active Only</option>
                <option className='!p-4' value="expired">Expired Only</option>
              </select>
            </div> */}
          </div>
          
          <div className="flex items-center gap-3">
            {selectedIds.length > 0 && (
              <>
                <span className="text-sm text-gray-600">
                  {selectedIds.length} selected
                </span>
                <Button
                  onClick={handleBulkDelete}
                  variant="outline"
                  color="danger"
                  size="sm" className='px-3 rounded-xl'
                  startIcon={<DeleteIcon className='!m-0 !mr-3' />}
                >
                  Delete Selected
                </Button>
              </>
            )}
            
            <Button
              onClick={handleCleanup}
              variant="outline"
              color="primary"
              size="sm" className='px-3 rounded-xl'
              startIcon={<DeleteSweepIcon className='!m-0 !mr-3' />} >
              Cleanup Expired
            </Button>
          </div>
        </div>

        {/* Summary */}
        {!loading && (
          <div className="mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <div className="text-sm text-gray-600">
              {totalCount > 0 ? (
                <>Showing {transfers.length} of {totalCount} transfers</>
              ) : (
                <>No transfers found</>
              )}
              {statusFilter !== 'all' && (
                <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                  Filter: {statusFilter === 'active' ? 'Active' : 'Expired'}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Table */}
        {transfers.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <FileUploadIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchQuery || statusFilter !== 'all' ? 'No matching transfers found' : 'No transfer files found'}
            </h3>
            <p className="text-gray-600">
              {searchQuery || statusFilter !== 'all' ? (
                <>
                  Try adjusting your search terms or filters.
                  {statusFilter !== 'all' && (
                    <button 
                      onClick={() => setStatusFilter('all')}
                      className="ml-2 text-blue-600 hover:text-blue-800 underline"
                    >
                      Show all transfers
                    </button>
                  )}
                </>
              ) : (
                'Transfers will appear here once users start uploading files.'
              )}
            </p>
          </div>
        ) : (
          <>
            <SimpleTable
              transfers={transfers}
              selectedIds={selectedIds}
              onSelectionChange={setSelectedIds}
              onDelete={handleDelete}
            />
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-6 flex justify-center">
                <div className="flex items-center space-x-2">
                  <Button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    variant="outline"
                    size="sm"
                  >
                    Previous
                  </Button>
                  
                  <span className="px-4 py-2 text-sm text-gray-700">
                    Page {currentPage} of {totalPages}
                  </span>
                  
                  <Button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    variant="outline"
                    size="sm"
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

