import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@ui/card/card';
import { Button } from '@ui/buttons/button';
import { TextField } from '@ui/forms/input-field/text-field';
import { Form } from '@ui/forms/form';
import { useForm } from 'react-hook-form';
import { Trans } from '@ui/i18n/trans';
import { useAuth } from '@common/auth/use-auth';
import { MdPerson, MdSecurity, MdSettings, MdEmail, MdLock, MdEdit } from 'react-icons/md';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@ui/tabs/tabs';
import { Switch } from '@ui/forms/toggle/switch';
import { FormSwitch } from '@ui/forms/toggle/form-switch';

export function AdminProfilePage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  
  const profileForm = useForm({
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      avatar: user?.avatar || ''
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
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          <Trans message="Admin Profile" />
        </h1>
        <p className="text-gray-600">
          <Trans message="Manage your admin account settings and system configuration" />
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <MdPerson className="h-4 w-4" />
            <Trans message="Profile" />
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <MdSecurity className="h-4 w-4" />
            <Trans message="Security" />
          </TabsTrigger>
          <TabsTrigger value="admin" className="flex items-center gap-2">
            <MdSettings className="h-4 w-4" />
            <Trans message="Admin Settings" />
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MdPerson className="h-5 w-5" />
                <Trans message="Profile Information" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Form form={profileForm} onSubmit={handleProfileUpdate}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <TextField
                    name="name"
                    label={<Trans message="Full Name" />}
                    required
                    className="mb-4"
                  />
                  <TextField
                    name="email"
                    type="email"
                    label={<Trans message="Email Address" />}
                    required
                    className="mb-4"
                  />
                  <TextField
                    name="avatar"
                    label={<Trans message="Avatar URL" />}
                    className="mb-4"
                  />
                </div>
                <div className="flex justify-end mt-6">
                  <Button type="submit" variant="flat" color="primary">
                    <MdEdit className="mr-2 h-4 w-4" />
                    <Trans message="Update Profile" />
                  </Button>
                </div>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MdSecurity className="h-5 w-5" />
                <Trans message="Security Settings" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Form form={securityForm} onSubmit={handleSecurityUpdate}>
                <div className="space-y-6">
                  <div className="border-b pb-6">
                    <h3 className="text-lg font-medium mb-4">
                      <Trans message="Change Password" />
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <TextField
                        name="current_password"
                        type="password"
                        label={<Trans message="Current Password" />}
                        required
                      />
                      <TextField
                        name="new_password"
                        type="password"
                        label={<Trans message="New Password" />}
                        required
                      />
                      <TextField
                        name="confirm_password"
                        type="password"
                        label={<Trans message="Confirm Password" />}
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium mb-4">
                      <Trans message="Two-Factor Authentication" />
                    </h3>
                    <FormSwitch
                      name="two_factor_enabled"
                      description={<Trans message="Enable two-factor authentication for enhanced security" />}
                    >
                      <Trans message="Enable 2FA" />
                    </FormSwitch>
                  </div>
                </div>
                <div className="flex justify-end mt-6">
                  <Button type="submit" variant="flat" color="primary">
                    <MdLock className="mr-2 h-4 w-4" />
                    <Trans message="Update Security" />
                  </Button>
                </div>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="admin">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MdSettings className="h-5 w-5" />
                <Trans message="Admin System Settings" />
              </CardTitle>
            </CardHeader>
            <CardContent>
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
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default AdminProfilePage;