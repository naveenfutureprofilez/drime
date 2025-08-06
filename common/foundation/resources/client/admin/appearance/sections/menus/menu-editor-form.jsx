import { useAppearanceEditorValues } from '@common/admin/appearance/requests/use-appearance-editor-values';
import { useForm, useWatch } from 'react-hook-form';
import { AppearanceEditorForm } from '@common/admin/appearance/appearance-editor-form';
import { Outlet, useParams } from 'react-router';
import { AppearanceEditorBreadcrumb } from '@common/admin/appearance/appearance-editor-breadcrumb';
import { Trans } from '@ui/i18n/trans';
export function MenuEditorForm() {
  const values = useAppearanceEditorValues();
  const form = useForm({
    defaultValues: {
      settings: {
        menus: values.settings.menus
      }
    }
  });
  return <AppearanceEditorForm form={form} breadcrumb={<MenuEditorBreadcrumb form={form} />} blockerAllowedPath="menus">
      <Outlet />
    </AppearanceEditorForm>;
}
function MenuEditorBreadcrumb({
  form
}) {
  const {
    menuIndex,
    menuItemIndex
  } = useParams();
  const allMenus = useWatch({
    control: form.control,
    name: 'settings.menus'
  });
  const activeMenu = menuIndex ? allMenus[menuIndex] : null;
  const activeItem = menuItemIndex && activeMenu ? activeMenu.items[menuItemIndex] : null;
  return <AppearanceEditorBreadcrumb>
      <Trans message="Menus" />
      {activeMenu && <span>{activeMenu.name}</span>}
      {activeItem && <span>{activeItem.label}</span>}
    </AppearanceEditorBreadcrumb>;
}