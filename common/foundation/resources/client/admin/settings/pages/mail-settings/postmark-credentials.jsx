import { FormTextField } from '@ui/forms/input-field/text-field/text-field';
import { Trans } from '@ui/i18n/trans';
export function PostmarkCredentials({
  isInvalid
}) {
  return <FormTextField invalid={isInvalid} name="server.postmark_token" label={<Trans message="Postmark token" />} required />;
}