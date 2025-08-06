import { List, ListItem } from '@ui/list/list';
import { Trans } from '@ui/i18n/trans';
import { DateRangeComparePresets } from '@ui/forms/input-field/date/date-range-picker/dialog/date-range-compare-presets';
export function DateRangeComparePresetList({
  originalRangeValue,
  onPresetSelected,
  selectedValue
}) {
  return <List>
      {DateRangeComparePresets.map(preset => <ListItem borderRadius="rounded-none" capitalizeFirst key={preset.key} isSelected={selectedValue?.preset === preset.key} onSelected={() => {
      const newValue = preset.getRangeValue(originalRangeValue);
      onPresetSelected(newValue);
    }}>
          <Trans {...preset.label} />
        </ListItem>)}
    </List>;
}