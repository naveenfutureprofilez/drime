import mergedAppearanceConfig from '../../../config/merged-appearance-config';
export function useAvailableRoutes() {
  const menuConfig = mergedAppearanceConfig.sections.menus.config;
  if (!menuConfig) return [];
  return menuConfig.availableRoutes.map(route => {
    return {
      id: route,
      label: route,
      action: route,
      type: 'route',
      target: '_self'
    };
  });
}