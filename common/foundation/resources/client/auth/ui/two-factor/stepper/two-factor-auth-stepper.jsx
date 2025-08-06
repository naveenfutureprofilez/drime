import { useState } from 'react';
import { TwoFactorDisabledStep } from '@common/auth/ui/two-factor/stepper/two-factor-disabled-step';
import { TwoFactorConfirmationStep } from '@common/auth/ui/two-factor/stepper/two-factor-confirmation-step';
import { TwoFactorEnabledStep } from '@common/auth/ui/two-factor/stepper/two-factor-enabled-step';
var Status = /*#__PURE__*/function (Status) {
  Status[Status["Disabled"] = 0] = "Disabled";
  Status[Status["WaitingForConfirmation"] = 1] = "WaitingForConfirmation";
  Status[Status["Enabled"] = 2] = "Enabled";
  return Status;
}(Status || {});
export function TwoFactorStepper({
  user
}) {
  const [status, setStatus] = useState(getStatus(user));
  switch (status) {
    case Status.Disabled:
      return <TwoFactorDisabledStep onEnabled={() => setStatus(Status.WaitingForConfirmation)} />;
    case Status.WaitingForConfirmation:
      return <TwoFactorConfirmationStep onCancel={() => {
        setStatus(Status.Disabled);
      }} onConfirmed={() => {
        setStatus(Status.Enabled);
      }} />;
    case Status.Enabled:
      return <TwoFactorEnabledStep user={user} onDisabled={() => setStatus(Status.Disabled)} />;
  }
}
function getStatus(user) {
  if (user.two_factor_confirmed_at) {
    return Status.Enabled;
  } else if (user.two_factor_recovery_codes) {
    return Status.WaitingForConfirmation;
  }
  return Status.Disabled;
}