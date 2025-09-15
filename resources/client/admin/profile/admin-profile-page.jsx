import React, { useState } from 'react';
import { Trans } from '@ui/i18n/trans';
import { useAuth } from '@common/auth/use-auth';
import { MdPerson, MdSecurity, MdSettings, MdEmail } from 'react-icons/md';
import { Tabs } from '@ui/tabs/tabs';
import { TabPanels, TabPanel } from '@ui/tabs/tab-panels';
import { TabList } from '@ui/tabs/tab-list';
import { Tab } from '@ui/tabs/tab';
import { useForm } from 'react-hook-form';
import { Form } from '@ui/forms/form';
import { FormSwitch } from '@ui/forms/toggle/switch';
import { Button } from '@ui/buttons/button';
import { BasicInfoPanel } from '@common/auth/ui/account-settings/basic-info-panel/basic-info-panel';
import { ChangePasswordPanel } from '@common/auth/ui/account-settings/change-password-panel/change-password-panel';
import { AdminTwoFactorAuthPage } from '@app/admin/2fa/admin-2fa-page';

export function AdminProfilePage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  
  const adminForm = useForm({
    defaultValues: {
      maintenance_mode: false,
      debug_mode: false,
      registration_enabled: true,
      email_verification: true
    }
  });

  const handleAdminSettingsUpdate = (data) => {
    console.log('Admin settings update:', data);
    // TODO: Implement admin settings update API call
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          <Trans message="Admin Profile" />
        </h1>
        <p className="text-gray-600">
          <Trans message="Manage your admin account settings and system configuration" />
        </p>
      </div>

      <Tabs selectedTab={activeTab === 'profile' ? 0 : activeTab === 'security' ? 1 : 2} onTabChange={(index) => setActiveTab(index === 0 ? 'profile' : index === 1 ? 'security' : 'admin')} className="w-full">
        <TabList className="grid w-full grid-cols-3">
          <Tab className="flex items-center gap-2">
            <MdPerson className="h-4 w-4" />
            <Trans message="Profile" />
          </Tab>
          <Tab className="flex items-center gap-2">
            <MdSecurity className="h-4 w-4" />
            <Trans message="Security" />
          </Tab>
          <Tab className="flex items-center gap-2">
            <MdSettings className="h-4 w-4" />
            <Trans message="Admin Settings" />
          </Tab>
        </TabList>

        <TabPanels className="mt-6">
          <TabPanel>
            <BasicInfoPanel user={user} />
          </TabPanel>

          <TabPanel>
            <div className="space-y-6">
              <ChangePasswordPanel />
              <AdminTwoFactorAuthPage />
            </div>
          </TabPanel>

          <TabPanel>
            <div className="rounded-panel border bg-paper shadow-sm">
              <div className="p-4 pb-2">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <MdSettings className="h-5 w-5" />
                  <Trans message="Admin System Settings" />
                </h2>
              </div>
              <div className="p-4 pt-0">
                <Form form={adminForm} onSubmit={handleAdminSettingsUpdate}>
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormSwitch
                        name="maintenance_mode"
                        description={<Trans message="Put the site in maintenance mode" />}
                      >
                        <Trans message="Maintenance Mode" />
                      </FormSwitch>
                      
                      <FormSwitch
                        name="debug_mode"
                        description={<Trans message="Enable debug mode for development" />}
                      >
                        <Trans message="Debug Mode" />
                      </FormSwitch>
                      
                      <FormSwitch
                        name="registration_enabled"
                        description={<Trans message="Allow new user registrations" />}
                      >
                        <Trans message="User Registration" />
                      </FormSwitch>
                      
                      <FormSwitch
                        name="email_verification"
                        description={<Trans message="Require email verification for new users" />}
                      >
                        <Trans message="Email Verification" />
                      </FormSwitch>
                    </div>
                    
                    <div className="border-t pt-6">
                      <h3 className="text-lg font-medium mb-4">
                        <Trans message="Quick Actions" />
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Button variant="outline" className="flex items-center gap-2">
                          <MdSettings className="h-4 w-4" />
                          <Trans message="Clear Cache" />
                        </Button>
                        <Button variant="outline" className="flex items-center gap-2">
                          <MdEmail className="h-4 w-4" />
                          <Trans message="Test Email" />
                        </Button>
                        <Button variant="outline" className="flex items-center gap-2">
                          <MdSecurity className="h-4 w-4" />
                          <Trans message="System Info" />
                        </Button>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end mt-6">
                    <Button type="submit" variant="flat" color="primary">
                      <MdSettings className="mr-2 h-4 w-4" />
                      <Trans message="Update Settings" />
                    </Button>
                  </div>
                </Form>
              </div>
            </div>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </div>
  );
}

export default AdminProfilePage;