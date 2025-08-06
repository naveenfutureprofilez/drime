export const lazyAdminRoute = async cmp => {
  const exports = await import('@app/admin/routes/app-admin-routes.lazy');
  return {
    Component: exports[cmp]
  };
};