import React, { useState } from 'react';
import { useAuth } from '@common/auth/use-auth';
import { useForm } from 'react-hook-form';
import { Trans } from '@ui/i18n/trans';
// Using simple div elements instead of Card components
import { Tabs } from '@ui/tabs/tabs';
import { TabList } from '@ui/tabs/tab-list';
import { Tab } from '@ui/tabs/tab';
import { TabPanel, TabPanels } from '@ui/tabs/tab-panels';
import { Form, FormTextField } from '@ui/forms/form';
import { FormSwitch } from '@ui/forms/toggle/switch';
import { Button } from '@ui/buttons/button';
import { MdPerson, MdSecurity, MdSettings, MdLock, MdEmail, MdPhone } from 'react-icons/md';
import { PersonIcon } from '@ui/icons/material/Person';

export function AdminProfilePage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  
  const profileForm = useForm({
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || ''
    }
  });

  const securityForm = useForm({
    defaultValues: {
      current_password: '',
      new_password: '',
      confirm_password: '',
      two_factor_enabled: false
    }
  });

  const adminForm = useForm({
    defaultValues: {
      maintenance_mode: false,
      debug_mode: false,
      registration_enabled: true,
      email_verification: true
    }
  });

  const handleProfileUpdate = (data) => {
    console.log('Profile update:', data);
    // TODO: Implement profile update API call
  };

  const handleSecurityUpdate = (data) => {
    console.log('Security update:', data);
    // TODO: Implement security update API call
  };

  const handleAdminSettingsUpdate = (data) => {
    console.log('Admin settings update:', data);
    // TODO: Implement admin settings update API call
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          <Trans message="Admin Profile" />
        </h1>
        <p className="text-gray-600 mt-1">
          <Trans message="Manage your admin account settings and system preferences" />
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
          <div className="rounded-panel border bg-paper shadow-sm">
              <div className="p-4 pb-2">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <PersonIcon />
                  <Trans message="Profile Information" />
                </h2>
              </div>
              <div className="p-4 pt-0">
              <Form form={profileForm} onSubmit={handleProfileUpdate}>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormTextField
                      name="name"
                      label={<Trans message="Full Name" />}
                      required
                    />
                    <FormTextField
                      name="email"
                      label={<Trans message="Email Address" />}
                      type="email"
                      required
                    />
                  </div>
                  
                  <FormTextField
                    name="phone"
                    label={<Trans message="Phone Number" />}
                    type="tel"
                  />
                </div>
                
                <div className="flex justify-end mt-6">
                  <Button type="submit" variant="flat" color="primary">
                    <Trans message="Update Profile" />
                  </Button>
                </div>
              </Form>
            </div>
            </div>
          </TabPanel>
          <TabPanel>
          <div className="rounded-panel border bg-paper shadow-sm">
            <div className="p-4 pb-2">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <MdSecurity className="h-5 w-5" />
                <Trans message="Security Settings" />
              </h2>
            </div>
            <div className="p-4 pt-0">
              <Form form={securityForm} onSubmit={handleSecurityUpdate}>
                <div className="space-y-6">
                  <div className="border-b pb-6">
                    <h3 className="text-lg font-medium mb-4">
                      <Trans message="Change Password" />
                    </h3>
                    <div className="space-y-4">
                      <FormTextField
                        name="current_password"
                        label={<Trans message="Current Password" />}
                        type="password"
                        required
                      />
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormTextField
                          name="new_password"
                          label={<Trans message="New Password" />}
                          type="password"
                          required
                        />
                        <FormTextField
                          name="confirm_password"
                          label={<Trans message="Confirm Password" />}
                          type="password"
                          required
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium mb-4">
                      <Trans message="Two-Factor Authentication" />
                    </h3>
                    <FormSwitch
                      name="two_factor_enabled"
                      description={<Trans message="Add an extra layer of security to your account" />}
                    >
                      <Trans message="Enable 2FA" />
                    </FormSwitch>
                  </div>
                </div>
                
                <div className="flex justify-end mt-6">
                  <Button type="submit" variant="flat" color="primary">
                    <Trans message="Update Security" />
                  </Button>
                </div>
              </Form>
            </div>
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
                        <MdEmail className="h-4 w-4" />
                        <Trans message="Test Email" />
                      </Button>
                      <Button variant="outline" className="flex items-center gap-2">
                        <MdLock className="h-4 w-4" />
                        <Trans message="Clear Cache" />
                      </Button>
                      <Button variant="outline" className="flex items-center gap-2">
                        <MdSettings className="h-4 w-4" />
                        <Trans message="System Info" />
                      </Button>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end mt-6">
                  <Button type="submit" variant="flat" color="primary">
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