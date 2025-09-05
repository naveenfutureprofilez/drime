import { AccountSettingsPanel } from '@common/auth/ui/account-settings/account-settings-panel';
import { AccountSettingsId } from '@common/auth/ui/account-settings/account-settings-sidenav';
import { Trans } from '@ui/i18n/trans';
import { TwoFactorStepper } from '@common/auth/ui/two-factor/stepper/two-factor-auth-stepper';
export function TwoFactorPanel({
  user
}) {
  return <AccountSettingsPanel id={AccountSettingsId.TwoFactor} title={<Trans message="Two factor authentication" />}>
    <div className="flex justify-center items-center ">
      <div className="w-full max-w-xl p-4 bg-white">
        <TwoFactorStepper user={user} />
      </div>
    </div>
  </AccountSettingsPanel>;
}