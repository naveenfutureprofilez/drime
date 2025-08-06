import clsx from 'clsx';
import { FormatAlignLeftIcon } from '@ui/icons/material/FormatAlignLeft';
import { FormatAlignCenterIcon } from '@ui/icons/material/FormatAlignCenter';
import { FormatAlignRightIcon } from '@ui/icons/material/FormatAlignRight';
import { FormatAlignJustifyIcon } from '@ui/icons/material/FormatAlignJustify';
import { IconButton } from '@ui/buttons/icon-button';
import { Menu, MenuItem, MenuTrigger } from '@ui/menu/menu-trigger';
import { Trans } from '@ui/i18n/trans';
import { message } from '@ui/i18n/message';
const iconMap = {
  left: {
    icon: FormatAlignLeftIcon,
    label: message('Align left')
  },
  center: {
    icon: FormatAlignCenterIcon,
    label: message('Align center')
  },
  right: {
    icon: FormatAlignRightIcon,
    label: message('Align right')
  },
  justify: {
    icon: FormatAlignJustifyIcon,
    label: message('Justify')
  }
};
export function AlignButtons({
  editor,
  size
}) {
  const activeKey = Object.keys(iconMap).find(key => {
    return editor.isActive({
      textAlign: key
    });
  }) || 'left';
  const ActiveIcon = activeKey ? iconMap[activeKey].icon : iconMap.left.icon;
  return <MenuTrigger floatingWidth="auto" selectionMode="single" selectedValue={activeKey} onSelectionChange={key => {
    editor.commands.focus();
    editor.commands.setTextAlign(key);
  }}>
      <IconButton size={size} color={activeKey ? 'primary' : null} className={clsx('flex-shrink-0')}>
        <ActiveIcon />
      </IconButton>
      <Menu>
        {Object.entries(iconMap).map(([name, config]) => {
        const Icon = config.icon;
        return <MenuItem key={name} value={name} startIcon={<Icon size="md" />} capitalizeFirst>
              <Trans message={config.label.message} />
            </MenuItem>;
      })}
      </Menu>
    </MenuTrigger>;
}