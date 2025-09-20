import React from 'react';
import { Trans } from '@ui/i18n/trans';
import { useAuth } from '@common/auth/use-auth';
import { TwoFactorStepper } from '@common/auth/ui/two-factor/stepper/two-factor-auth-stepper';
import { MdSecurity } from 'react-icons/md';

export function AdminTwoFactorAuthPage() {
  const { user } = useAuth();

  return (
    <div className="w-full px-4 sm:px-6 md:px-8 mx-auto pt-20 md:pt-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          <Trans message="Two-Factor Authentication" />
        </h1>
        <p className="text-gray-600">
          <Trans message="Enhance your account security by enabling two-factor authentication." />
        </p>
      </div>

      <div className="rounded-panel border bg-paper shadow-sm">
        <div className="p-4 pb-2">
          <div className="flex items-center gap-3">
            <MdSecurity className="text-2xl text-primary" />
            <div>
              <h3 className="text-lg font-semibold">
                <Trans message="Security Settings" />
              </h3>
              <p className="text-sm text-muted">
                <Trans message="Manage your two-factor authentication settings" />
              </p>
            </div>
          </div>
        </div>
        <div className="p-4 pt-0">
          <TwoFactorStepper user={user} />
        </div>
      </div>
    </div>
  );
}