import React from 'react';
import { Item } from '@ui/forms/listbox/item';
import { useListbox } from '@ui/forms/listbox/use-listbox';
import { IconButton } from '@ui/buttons/icon-button';
import { TextField } from '@ui/forms/input-field/text-field/text-field';
import { Listbox } from '@ui/forms/listbox/listbox';
import { useListboxKeyboardNavigation } from '@ui/forms/listbox/use-listbox-keyboard-navigation';
import { createEventHandler } from '@ui/utils/dom/create-event-handler';
import { ComboboxEndAdornment } from '@ui/forms/combobox/combobox-end-adornment';
import { Popover } from '@ui/overlays/popover';
export { Item as Option };
function ComboBox(props, ref) {
  const {
    children,
    items,
    isAsync,
    isLoading,
    openMenuOnFocus = true,
    endAdornmentIcon,
    onItemSelected,
    maxItems,
    clearInputOnItemSelection,
    inputValue: userInputValue,
    selectedValue,
    onSelectionChange,
    allowCustomValue = false,
    onInputValueChange,
    defaultInputValue,
    selectionMode = 'single',
    useOptionLabelAsInputValue,
    showEmptyMessage,
    floatingMaxHeight,
    hideEndAdornment = false,
    blurReferenceOnItemSelection,
    isOpen: propsIsOpen,
    onOpenChange: propsOnOpenChange,
    prependListbox,
    listboxClassName,
    onEndAdornmentClick,
    autoFocusFirstItem = true,
    focusLoopingMode,
    ...textFieldProps
  } = props;
  const listbox = useListbox({
    ...props,
    floatingMaxHeight,
    blurReferenceOnItemSelection,
    selectionMode,
    role: 'listbox',
    virtualFocus: true,
    clearSelectionOnInputClear: true
  }, ref);
  const {
    reference,
    listboxId,
    onInputChange,
    state: {
      isOpen,
      setIsOpen,
      inputValue,
      setInputValue,
      selectValues,
      selectedValues,
      setActiveCollection
    },
    collection
  } = listbox;
  const textLabel = selectedValues[0] ? collection.get(selectedValues[0])?.textLabel : undefined;
  const {
    handleListboxSearchFieldKeydown
  } = useListboxKeyboardNavigation(listbox);
  const handleFocusAndClick = createEventHandler(e => {
    if (openMenuOnFocus && !isOpen) {
      setIsOpen(true);
    }
    e.target.select();
  });
  return <Listbox prepend={prependListbox} className={listboxClassName} listbox={listbox} mobileOverlay={Popover} isLoading={isLoading} onPointerDown={e => {
    // prevent focus from leaving input when scrolling listbox via mouse
    e.preventDefault();
  }}>
      <TextField inputRef={reference} {...textFieldProps} endAdornment={!hideEndAdornment ? <IconButton size="md" tabIndex={-1} disabled={textFieldProps.disabled} className="pointer-events-auto" onPointerDown={e => {
      e.preventDefault();
      e.stopPropagation();
      if (onEndAdornmentClick) {
        onEndAdornmentClick();
      } else {
        setActiveCollection('all');
        setIsOpen(!isOpen);
      }
    }}>
              <ComboboxEndAdornment isLoading={isLoading} icon={endAdornmentIcon} />
            </IconButton> : null} aria-expanded={isOpen ? 'true' : 'false'} aria-haspopup="listbox" aria-controls={isOpen ? listboxId : undefined} aria-autocomplete="list" autoCorrect="off" spellCheck="false" onChange={onInputChange} value={useOptionLabelAsInputValue && textLabel ? textLabel : inputValue} onBlur={e => {
      if (allowCustomValue) {
        selectValues(e.target.value);
      } else if (!clearInputOnItemSelection) {
        const val = selectedValues[0];
        setInputValue(selectValues.length && val != null ? `${val}` : '');
      }
    }} onFocus={handleFocusAndClick} onClick={handleFocusAndClick} onKeyDown={e => handleListboxSearchFieldKeydown(e)} />
    </Listbox>;
}
const ComboBoxForwardRef = React.forwardRef(ComboBox);
export { ComboBoxForwardRef as ComboBox };