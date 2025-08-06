import { useShareableLinkPage } from '../../queries/use-shareable-link-page';
import { useNavigate } from 'react-router';
function buildFolderHash(link, folderHash) {
  let hash = link.hash;
  if (folderHash && link.entry?.hash !== folderHash) {
    hash = `${hash}:${folderHash}`;
  }
  return hash;
}
export function useNavigateToSubfolder() {
  const {
    link
  } = useShareableLinkPage();
  const navigate = useNavigate();
  return hash => {
    if (!link) return;
    navigate(`/drive/s/${buildFolderHash(link, hash)}`);
  };
}