import useClipboard from 'react-use-clipboard';
import { useEntryShareableLink } from '../../shareable-link/queries/use-entry-shareable-link';
import { useCreateShareableLink } from '../../shareable-link/queries/create-shareable-link';
import { useDeleteShareableLink } from '../../shareable-link/queries/use-delete-shareable-link';
import { Button } from '@ui/buttons/button';
import { TextField } from '@ui/forms/input-field/text-field/text-field';
import { Switch } from '@ui/forms/toggle/switch';
import { Trans } from '@ui/i18n/trans';
import { useTrans } from '@ui/i18n/use-trans';
import { useActiveDialogEntry } from '../../drive-store';
import { useSettings } from '@ui/settings/use-settings';
import { randomString } from '@ui/utils/string/random-string';
export function ShareableLinkPanel({
  setActivePanel,
  entry,
  focusInput
}) {
  const query = useEntryShareableLink(entry.id);
  const linkExists = !!query.data?.link;
  const createLink = useCreateShareableLink();
  const deleteLink = useDeleteShareableLink();
  const isLoading = query.isLoading || createLink.isPending || deleteLink.isPending;
  return <div>
      <div className="mb-10">
        <Trans message="Share link" />
      </div>
      <div className="flex items-center justify-between gap-14 px-2 pb-4">
        <Switch checked={linkExists} disabled={isLoading} onChange={() => {
        if (linkExists) {
          deleteLink.mutate({
            entryId: entry.id
          });
        } else {
          createLink.mutate({
            entryId: entry.id
          });
        }
      }}>
          {linkExists ? <Trans message="Shareable link is created" /> : <Trans message="Create shareable link" />}
        </Switch>
        {linkExists && <Button variant="link" color="primary" onClick={() => {
        setActivePanel('linkSettings');
      }}>
            <Trans message="Link settings" />
          </Button>}
      </div>
      <ShareableLinkInput autoFocus={focusInput} link={query.data?.link} />
    </div>;
}
function ShareableLinkInput({
  link,
  autoFocus
}) {
  const {
    base_url
  } = useSettings();
  const {
    trans
  } = useTrans();
  const entry = useActiveDialogEntry();
  const hash = link?.hash || entry?.hash || randomString();
  const linkUrl = `${base_url}/drive/s/${hash}`;
  const [isCopied, setCopied] = useClipboard(linkUrl, {
    successDuration: 1000
  });
  return <TextField autoFocus={autoFocus} disabled={!link} className="mt-10" readOnly value={linkUrl} aria-label={trans({
    message: 'Shareable link'
  })} onFocus={e => {
    e.target.select();
  }} endAppend={<Button className="min-w-100" variant="flat" color="primary" onClick={setCopied}>
          {isCopied ? <Trans message="Copied!" /> : <Trans message="Copy" />}
        </Button>} />;
}