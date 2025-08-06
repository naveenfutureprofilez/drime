import { Radio } from '@ui/forms/radio-group/radio';
import { Trans } from '@ui/i18n/trans';
import { RadioGroup } from '@ui/forms/radio-group/radio-group';
import { UpsellLabel } from './upsell-label';
export function BillingCycleRadio({
  selectedCycle,
  onChange,
  products,
  ...radioGroupProps
}) {
  return <RadioGroup {...radioGroupProps}>
      <Radio value="yearly" checked={selectedCycle === 'yearly'} onChange={e => {
      onChange(e.target.value);
    }}>
        <Trans message="Annual" />
        <UpsellLabel products={products} />
      </Radio>
      <Radio value="monthly" checked={selectedCycle === 'monthly'} onChange={e => {
      onChange(e.target.value);
    }}>
        <Trans message="Monthly" />
      </Radio>
    </RadioGroup>;
}