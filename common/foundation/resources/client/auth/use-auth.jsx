import { useContext, useMemo } from 'react';
import { SiteConfigContext } from '../core/settings/site-config-context';
import { getFromLocalStorage } from '@ui/utils/hooks/local-storage';
import { getBootstrapData, useBootstrapDataStore } from '@ui/bootstrap-data/bootstrap-data-store';
export function useAuth() {
  const data = useBootstrapDataStore(s => s.data);
  const {
    auth: {
      redirectUri = '/',
      adminRedirectUri = '/admin'
    }
  } = useContext(SiteConfigContext);
  return useMemo(() => {
    const auth = new _Auth(data);
    return {
      user: auth.user,
      hasPermission: auth.hasPermission.bind(auth),
      getPermission: auth.getPermission.bind(auth),
      getRestrictionValue: auth.getRestrictionValue.bind(auth),
      checkOverQuotaOrNoPermission: auth.checkOverQuotaOrNoPermission.bind(auth),
      hasRole: auth.hasRole.bind(auth),
      isLoggedIn: auth.isLoggedIn,
      isSubscribed: auth.isSubscribed,
      // where to redirect user after successful login
      getRedirectUri: () => {
        const onboarding = getFromLocalStorage('be.onboarding.selected');
        
        if (onboarding) {
          return `/checkout/${onboarding.productId}/${onboarding.priceId}`;
        }
        
        // Check if user has admin permissions and redirect to admin area
        if (auth.hasPermission('admin.access')) {
          return adminRedirectUri;
        }
        
        return redirectUri;
      }
    };
  }, [data, redirectUri, adminRedirectUri]);
}
class _Auth {
  get data() {
    return this._data ?? getBootstrapData();
  }
  constructor(_data) {
    this._data = _data;
  }
  get user() {
    return this.data.user;
  }
  get isLoggedIn() {
    return !!this.user;
  }
  get isSubscribed() {
    return this.user?.subscriptions?.find(sub => sub.valid) != null;
  }
  get guestRole() {
    return this.data.guest_role;
  }
  getPermission(name) {
    const permissions = this.user?.permissions || this.guestRole?.permissions;
    if (!permissions) return;
    return permissions.find(p => p.name === name);
  }
  hasPermission(name) {
    const permissions = this.user?.permissions || this.guestRole?.permissions;
    const isAdmin = permissions?.find(p => p.name === 'admin') != null;
    return isAdmin || this.getPermission(name) != null;
  }
  hasRole(roleId) {
    return this.user?.roles?.find(role => role.id === roleId) != null;
  }
  checkOverQuotaOrNoPermission(permission, restrictionName, currentCount) {
    const noPermission = !this.hasPermission(permission);
    const maxCount = this.getRestrictionValue(permission, restrictionName);
    const overQuota = maxCount != null && currentCount >= maxCount;
    return {
      overQuota: maxCount != null && currentCount >= maxCount,
      noPermission,
      overQuotaOrNoPermission: overQuota || noPermission
    };
  }
  getRestrictionValue(permissionName, restrictionName) {
    const permission = this.getPermission(permissionName);
    let restrictionValue = null;
    if (permission) {
      const restriction = permission.restrictions.find(r => r.name === restrictionName);
      restrictionValue = restriction ? restriction.value : undefined;
    }
    return restrictionValue;
  }
}
export const auth = new _Auth();