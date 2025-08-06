import clsx from 'clsx';
import { useFileEntryUrls } from '@common/uploads/file-entry-urls';
import { useTrans } from '@ui/i18n/use-trans';
import { DefaultFilePreview } from '@common/uploads/components/file-preview/file-preview/default-file-preview';
export function PdfFilePreview(props) {
  const {
    entry,
    className
  } = props;
  const {
    trans
  } = useTrans();
  const {
    previewUrl
  } = useFileEntryUrls(entry);
  if (!previewUrl) {
    return <DefaultFilePreview {...props} />;
  }
  return <iframe title={trans({
    message: 'Preview for :name',
    values: {
      name: entry.name
    }
  })} className={clsx(className, 'h-full w-full')} src={`${previewUrl}#toolbar=0`} />;
}