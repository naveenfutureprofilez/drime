import { AVAILABLE_SORTS } from './available-sorts';
import { Button } from '@ui/buttons/button';
import { SortIcon } from '@ui/icons/material/Sort';
import { Trans } from '@ui/i18n/trans';
import { Menu, MenuItem, MenuSection, MenuTrigger } from '@ui/menu/menu-trigger';
export function EntriesSortButton({
  descriptor,
  onChange,
  isDisabled = false
}) {
  const column = descriptor.orderBy;
  const direction = descriptor.orderDir;
  const sort = AVAILABLE_SORTS.find(s => s.id === column);
  return <MenuTrigger showCheckmark selectionMode="multiple" selectedValue={[direction || 'desc', column || '']} onItemSelected={key => {
    if (key === 'asc' || key === 'desc') {
      onChange({
        orderBy: column,
        orderDir: key
      });
    } else {
      onChange({
        orderBy: key,
        orderDir: direction
      });
    }
  }}>
      <Button className="text-muted" variant="text" size="sm" startIcon={<SortIcon />} disabled={isDisabled}>
        {sort ? <Trans {...sort.label} /> : null}
      </Button>
      <Menu>
        <MenuSection label={<Trans message="Direction" />}>
          <MenuItem value="asc">
            <Trans message="Ascending" />
          </MenuItem>
          <MenuItem value="desc">
            <Trans message="Descending" />
          </MenuItem>
        </MenuSection>
        <MenuSection label={<Trans message="Sort By" />}>
          {AVAILABLE_SORTS.map(item => <MenuItem key={item.id} value={item.id}>
              <Trans {...item.label} />
            </MenuItem>)}
        </MenuSection>
      </Menu>
    </MenuTrigger>;
}