import { useForm } from 'react-hook-form';
import { useId } from 'react';
import { Form } from '@ui/forms/form';
import { AccountSettingsPanel } from '@common/auth/ui/account-settings/account-settings-panel';
import { useUpdateAccountDetails } from '@common/auth/ui/account-settings/basic-info-panel/update-account-details';
import { Button } from '@ui/buttons/button';
import { useValueLists } from '@common/http/value-lists';
import { FormSelect } from '@ui/forms/select/select';
import { useChangeLocale } from '@common/locale-switcher/change-locale';
import { AccountSettingsId } from '@common/auth/ui/account-settings/account-settings-sidenav';
import { TimezoneSelect } from '@common/auth/ui/account-settings/timezone-select';
import { Trans } from '@ui/i18n/trans';
import { useTrans } from '@ui/i18n/use-trans';
import { message } from '@ui/i18n/message';
import { Item } from '@ui/forms/listbox/item';
export function LocalizationPanel({
  user
}) {
  const formId = useId();
  const {
    trans
  } = useTrans();
  const form = useForm({
    defaultValues: {
      language: user.language || '',
      country: user.country || '',
      timezone: user.timezone || 'UTC'
    }
  });
  const updateDetails = useUpdateAccountDetails(user.id, form);
  const changeLocale = useChangeLocale();
  const {
    data
  } = useValueLists(['timezones', 'countries', 'localizations']);
  const countries = data?.countries || [];
  const localizations = data?.localizations || [];
  const timezones = data?.timezones || {};
  return <AccountSettingsPanel id={AccountSettingsId.LocationAndLanguage} title={<Trans message="Date, time and language" />} actions={<Button type="submit" variant="flat" color="primary" form={formId} disabled={updateDetails.isPending || !form.formState.isValid}>
          <Trans message="Save" />
        </Button>}>
<div className="flex justify-center items-center ">
    <Form 
      className="w-full max-w-xl p-4 bg-white "
    form={form} onSubmit={newDetails => {
      updateDetails.mutate(newDetails);
      changeLocale.mutate({
        locale: newDetails.language
      });
    }} id={formId}>
        <FormSelect className="mb-4" selectionMode="single" name="language" label={<Trans message="Language" />}>
          {localizations.map(localization => <Item key={localization.language} value={localization.language}>
              {localization.name}
            </Item>)}
        </FormSelect>
        <FormSelect className="mb-4" selectionMode="single" name="country" label={<Trans message="Country" />} showSearchField searchPlaceholder={trans(message('Search countries'))}>
          {countries.map(country => <Item key={country.code} value={country.code}>
              {country.name}
            </Item>)}
        </FormSelect>
        <TimezoneSelect label={<Trans message="Timezone" />} name="timezone" timezones={timezones} />
      </Form>
  </div>
    </AccountSettingsPanel>;
}