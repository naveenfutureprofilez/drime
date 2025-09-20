export const lazyAdminRoute = async cmp => {
  // Split admin routes into smaller chunks for better performance
  const commonExports = await import('@common/admin/routes/admin-routes.lazy');
  if (commonExports[cmp]) {
    return { Component: commonExports[cmp] };
  }
  
  const appExports = await import('@app/admin/routes/app-admin-routes.lazy');
  return {
    Component: appExports[cmp]
  };
};