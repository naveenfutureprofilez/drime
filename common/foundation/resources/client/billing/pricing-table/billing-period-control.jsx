import { SegmentedRadio } from '@ui/forms/segmented-radio-group/segmented-radio';
import { Trans } from '@ui/i18n/trans';
import { SegmentedRadioGroup } from '@ui/forms/segmented-radio-group/segmented-radio-group';
export function BillingPeriodControl(props) {
  return <SegmentedRadioGroup {...props}>
      <SegmentedRadio value="monthly">
        <Trans message="Monthly billing" />
      </SegmentedRadio>
      <SegmentedRadio value="yearly">
        <Trans message="Yearly billing" />
      </SegmentedRadio>
    </SegmentedRadioGroup>;
}