import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { TransferFilesPage } from './transfer-files-page';

// Mock the API calls
jest.mock('./requests/use-delete-transfer-files', () => ({
  useDeleteTransferFiles: () => ({
    mutate: jest.fn(),
    isPending: false
  })
}));

jest.mock('./requests/use-bulk-delete-transfer-files', () => ({
  useBulkDeleteTransferFiles: () => ({
    mutate: jest.fn(),
    isPending: false
  })
}));

jest.mock('./requests/use-cleanup-transfer-files', () => ({
  useCleanupTransferFiles: () => ({
    mutate: jest.fn(),
    isPending: false
  })
}));

// Mock API client
jest.mock('@common/http/query-client', () => ({
  apiClient: {
    get: jest.fn().mockResolvedValue({
      data: {
        pagination: {
          data: [],
          current_page: 1,
          per_page: 15,
          total: 0
        }
      }
    })
  }
}));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      cacheTime: 0,
    },
  },
});

const renderWithProviders = (component) => {
  return render(
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        {component}
      </BrowserRouter>
    </QueryClientProvider>
  );
};

describe('TransferFilesPage', () => {
  beforeEach(() => {
    queryClient.clear();
    jest.clearAllMocks();
  });

  test('renders the page title and description', () => {
    renderWithProviders(<TransferFilesPage />);
    
    expect(screen.getByText('Transfer Files Management')).toBeInTheDocument();
    expect(screen.getByText('Monitor and manage all file transfers in your WeTransfer service')).toBeInTheDocument();
  });

  test('renders the search input', () => {
    renderWithProviders(<TransferFilesPage />);
    
    const searchInput = screen.getByPlaceholderText(/search by filename, sender, or recipient/i);
    expect(searchInput).toBeInTheDocument();
  });

  test('renders the cleanup expired button', () => {
    renderWithProviders(<TransferFilesPage />);
    
    const cleanupButton = screen.getByRole('button', { name: /cleanup expired/i });
    expect(cleanupButton).toBeInTheDocument();
  });

  test('renders table headers', () => {
    renderWithProviders(<TransferFilesPage />);
    
    expect(screen.getByText('File Details')).toBeInTheDocument();
    expect(screen.getByText('Sender & Recipient')).toBeInTheDocument();
    expect(screen.getByText('Status & Activity')).toBeInTheDocument();
    expect(screen.getByText('Timeline')).toBeInTheDocument();
    expect(screen.getByText('Actions')).toBeInTheDocument();
  });

  test('can type in search input', async () => {
    renderWithProviders(<TransferFilesPage />);
    
    const searchInput = screen.getByPlaceholderText(/search by filename, sender, or recipient/i);
    
    fireEvent.change(searchInput, { target: { value: 'test search' } });
    
    expect(searchInput.value).toBe('test search');
  });

  test('renders add filter button', () => {
    renderWithProviders(<TransferFilesPage />);
    
    // The AddFilterButton should be present
    const filterButton = screen.getByRole('button', { name: /add filter/i });
    expect(filterButton).toBeInTheDocument();
  });

  test('has proper table structure', () => {
    renderWithProviders(<TransferFilesPage />);
    
    // Should have a table element
    const table = screen.getByRole('table');
    expect(table).toBeInTheDocument();
    
    // Should have table headers
    const tableHeaders = screen.getAllByRole('columnheader');
    expect(tableHeaders).toHaveLength(6); // 5 columns + selection column
  });

  test('shows empty state when no data', async () => {
    renderWithProviders(<TransferFilesPage />);
    
    await waitFor(() => {
      expect(screen.getByText('No transfer files found')).toBeInTheDocument();
    });
  });
});