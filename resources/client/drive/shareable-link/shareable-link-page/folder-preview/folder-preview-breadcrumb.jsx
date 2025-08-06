import React from 'react';
import clsx from 'clsx';
import { useFolderPath } from '../../../files/queries/use-folder-path';
import { Breadcrumb } from '@ui/breadcrumbs/breadcrumb';
import { useLinkPageStore } from '../link-page-store';
import { BreadcrumbItem } from '@ui/breadcrumbs/breadcrumb-item';
import { useNavigateToSubfolder } from './use-navigate-to-subfolder';
export function FolderPreviewBreadcrumb({
  className,
  folder,
  link
}) {
  const navigateToSubfolder = useNavigateToSubfolder();
  const password = useLinkPageStore(s => s.password);
  const query = useFolderPath({
    hash: folder?.hash,
    params: {
      shareable_link: link.id,
      password
    }
  });
  let content;
  if (query.isLoading) {
    content = null;
  } else {
    const items = [];
    if (query.data) {
      query.data.path.forEach(parent => {
        items.push({
          folder: parent,
          label: <>{parent.name}</>
        });
      });
    }
    content = <Breadcrumb size="lg" isNavigation>
        {items.map(item => {
        return <BreadcrumbItem onSelected={() => {
          navigateToSubfolder(item.folder.hash);
        }} key={item.folder.hash}>
              {item.label}
            </BreadcrumbItem>;
      })}
      </Breadcrumb>;
  }
  return <div className={clsx('h-36 flex-shrink-0', className)}>{content}</div>;
}