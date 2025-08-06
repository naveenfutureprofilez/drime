import React from 'react';
import { AuthRoute } from '../auth/guards/auth-route';
import { NotificationsPage } from './notifications-page';
import { NotificationSettingsPage } from './subscriptions/notification-settings-page';
import { ActiveWorkspaceProvider } from '../workspace/active-workspace-id-context';
export const notificationRoutes = [{
  path: '/notifications',
  element: <AuthRoute>
        <ActiveWorkspaceProvider>
          <NotificationsPage />
        </ActiveWorkspaceProvider>
      </AuthRoute>
}, {
  path: '/notifications/settings',
  element: <AuthRoute>
        <NotificationSettingsPage />
      </AuthRoute>
}];