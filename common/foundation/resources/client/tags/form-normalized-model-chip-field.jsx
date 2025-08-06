import { FormChipField } from '@ui/forms/input-field/chip-field/form-chip-field';
import React, { useState } from 'react';
import { Item } from '@ui/forms/listbox/item';
import { useNormalizedModels } from '@common/ui/normalized-model/use-normalized-models';
export function FormNormalizedModelChipField({
  name,
  label,
  placeholder,
  model,
  className,
  allowCustomValue = false
}) {
  const [inputValue, setInputValue] = useState('');
  const {
    data,
    isLoading
  } = useNormalizedModels(`normalized-models/${model}`, {
    query: inputValue
  });
  return <FormChipField className={className} name={name} label={label} isAsync inputValue={inputValue} onInputValueChange={setInputValue} suggestions={data?.results} placeholder={placeholder} isLoading={isLoading} allowCustomValue={allowCustomValue}>
      {data?.results.map(result => <Item value={result} key={result.id} startIcon={result.image ? <img className="h-24 w-24 rounded-full object-cover" src={result.image} alt="" /> : undefined}>
          {result.name}
        </Item>)}
    </FormChipField>;
}