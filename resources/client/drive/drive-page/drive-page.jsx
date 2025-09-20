import { message } from '@ui/i18n/message';
import addFilesSvg from './add-files.svg';
import timeManagement from './time-management.svg';
import fileSearching from './file-searching.svg';
import throwAwaySvg from './throw-away.svg';
import lovingItSvg from './loving-it.svg';
import shareSvg from '../shareable-link/shareable-link-page/folder-preview/share.svg';
import { getBootstrapData } from '@ui/bootstrap-data/bootstrap-data-store';
const defaultSortDescriptor = {
  orderBy: 'updated_at',
  orderDir: 'desc'
};
export function makeAllFilesPage(folder) {
  return {
    name: 'allChildren',
    uniqueId: `${folder.hash}-all`,
    label: `All files in ${folder.name}`,
    path: `/drive/folders/${folder.hash}/all`,
    hasActions: false,
    canUpload: false,
    sortDescriptor: defaultSortDescriptor,
    queryParams: {
      section: 'allChildren',
      folderId: folder.hash
    },
    folder,
    noContentMessage: () => ({
      title: message('No files found'),
      description: message('This folder and its subfolders contain no files'),
      image: addFilesSvg
    })
  };
}

export function makeFolderPage(folder) {
  return {
    ...makePartialFolderPage(folder.hash),
    canUpload: folder.permissions['files.create'] || folder.permissions['files.update'],
    label: folder.name,
    folder
  };
}
export function makePartialFolderPage(hash) {
  return {
    name: 'folder',
    uniqueId: hash,
    label: '',
    path: getPathForFolder(hash),
    hasActions: true,
    canUpload: false,
    sortDescriptor: defaultSortDescriptor,
    isFolderPage: true,
    noContentMessage: () => ({
      title: message('Drop files or folders here'),
      description: message('Or use the "Upload" button'),
      image: addFilesSvg
    })
  };
}
export function getPathForFolder(hash) {
  if (hash === '0') {
    return '/drive';
  }
  return `/drive/folders/${hash}`;
}

// bootstrap data will always be available at this point

const rootFolder = getBootstrapData().rootFolder;
export const RootFolderPage = {
  ...makeFolderPage(rootFolder),
  name: 'home'
};
export const RecentPage = {
  name: 'recent',
  uniqueId: 'recent',
  label: message('Recent'),
  path: '/drive/recent',
  disableSort: true,
  sortDescriptor: {
    orderBy: 'created_at',
    orderDir: 'desc'
  },
  queryParams: {
    recentOnly: true
  },
  noContentMessage: () => ({
    title: message('No recent entries'),
    description: message('You have not uploaded any files or folders yet'),
    image: timeManagement
  })
};
export const SearchPage = {
  name: 'search',
  uniqueId: 'search',
  label: message('Search results'),
  path: '/drive/search',
  sortDescriptor: defaultSortDescriptor,
  noContentMessage: isSearchingOrFiltering => {
    if (isSearchingOrFiltering) {
      return {
        title: message('No matching results'),
        description: message('Try changing your search query or filters'),
        image: fileSearching
      };
    }
    return {
      title: message('Begin typing or select a filter to search'),
      description: message('Search for files, folders and other content'),
      image: fileSearching
    };
  }
};
export const SharesPage = {
  name: 'sharedWithMe',
  uniqueId: 'sharedWithMe',
  label: message('Shared'),
  path: '/drive/shares',
  sortDescriptor: defaultSortDescriptor,
  queryParams: {
    sharedOnly: true
  },
  noContentMessage: () => ({
    title: message('Shared with me'),
    description: message('Files and folders other people have shared with you'),
    image: shareSvg
  })
};
export const TrashPage = {
  name: 'trash',
  uniqueId: 'trash',
  label: message('Trash'),
  path: '/drive/trash',
  sortDescriptor: defaultSortDescriptor,
  hasActions: true,
  queryParams: {
    deletedOnly: true
  },
  noContentMessage: () => ({
    title: message('Trash is empty'),
    description: message('There are no files or folders in your trash currently'),
    image: throwAwaySvg
  })
};
export const StarredPage = {
  name: 'starred',
  uniqueId: 'starred',
  label: message('Starred'),
  path: '/drive/starred',
  sortDescriptor: defaultSortDescriptor,
  queryParams: {
    starredOnly: true
  },
  noContentMessage: () => ({
    title: message('Nothing is starred'),
    description: message('Add stars to files and folders that you want to easily find later'),
    image: lovingItSvg
  })
};
export const DRIVE_PAGES = [RootFolderPage, RecentPage, SearchPage, SharesPage, TrashPage, StarredPage];