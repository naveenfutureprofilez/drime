import React, { cloneElement, Fragment, useCallback, useId, useRef } from 'react';
import clsx from 'clsx';
import { Button } from '@ui/buttons/button';
import { Trans } from '@ui/i18n/trans';
import { useActiveUpload } from '@common/uploads/uploader/use-active-upload';
import { useController } from 'react-hook-form';
import { mergeProps } from '@react-aria/utils';
import { ProgressBar } from '@ui/progress/progress-bar';
import { Disk } from '../uploader/backend-metadata';
import { toast } from '@ui/toast/toast';
import { Field } from '@ui/forms/input-field/field';
import { getInputFieldClassNames } from '@ui/forms/input-field/get-input-field-class-names';
import { useAutoFocus } from '@ui/focus/use-auto-focus';
import { IconButton } from '@ui/buttons/icon-button';
import { AddAPhotoIcon } from '@ui/icons/material/AddAPhoto';
import { AvatarPlaceholderIcon } from '@ui/avatar/avatar-placeholder-icon';
import { FileInputType } from '@ui/utils/files/file-input-config';
const TwoMB = 2 * 1024 * 1024;
export function ImageSelector({
  className,
  label,
  description,
  value,
  onChange,
  defaultValue,
  diskPrefix,
  showRemoveButton,
  showEditButtonOnHover = false,
  invalid,
  errorMessage,
  required,
  autoFocus,
  variant = 'input',
  previewSize = 'h-80',
  placeholderIcon,
  stretchPreview = false,
  previewRadius,
  disabled,
  onFileSelected
}) {
  const {
    uploadFile,
    entry,
    uploadStatus,
    deleteEntry,
    isDeletingEntry,
    percentage
  } = useActiveUpload();
  const inputRef = useRef(null);
  useAutoFocus({
    autoFocus
  }, inputRef);
  const fieldId = useId();
  const labelId = label ? `${fieldId}-label` : undefined;
  const descriptionId = description ? `${fieldId}-description` : undefined;
  const imageUrl = value || entry?.url;
  const uploadOptions = {
    showToastOnRestrictionFail: true,
    restrictions: {
      allowedFileTypes: [FileInputType.image],
      maxFileSize: TwoMB
    },
    metadata: {
      diskPrefix,
      disk: Disk.public
    },
    onSuccess: entry => {
      onChange?.(entry.url);
    },
    onError: message => {
      if (message) {
        toast.danger(message);
      }
    }
  };
  const inputFieldClassNames = getInputFieldClassNames({
    description,
    descriptionPosition: 'top',
    invalid
  });
  let VariantElement;
  if (variant === 'avatar') {
    VariantElement = AvatarVariant;
  } else if (variant === 'square') {
    VariantElement = SquareVariant;
  } else {
    VariantElement = InputVariant;
  }
  const removeButton = showRemoveButton ? <Button variant="link" color="danger" size="xs" disabled={isDeletingEntry || !imageUrl || disabled} onClick={() => {
    deleteEntry({
      onSuccess: () => onChange?.('')
    });
  }}>
      <Trans message="Remove image" />
    </Button> : null;
  const useDefaultButton = defaultValue != null && value !== defaultValue ? <Button variant="outline" color="primary" size="xs" disabled={disabled} onClick={() => {
    onChange?.(defaultValue);
  }}>
        <Trans message="Use default" />
      </Button> : null;
  const handleUpload = useCallback(() => {
    inputRef.current?.click();
  }, []);
  return <div className={clsx('text-sm', className)}>
      {label && <div id={labelId} className={inputFieldClassNames.label}>
          {label}
        </div>}
      {description && <div className={inputFieldClassNames.description}>{description}</div>}
      <div aria-labelledby={labelId} aria-describedby={descriptionId}>
        <Field fieldClassNames={inputFieldClassNames} errorMessage={errorMessage} invalid={invalid}>
          <VariantElement inputFieldClassNames={inputFieldClassNames} placeholderIcon={placeholderIcon} previewSize={previewSize} isLoading={uploadStatus === 'inProgress'} imageUrl={imageUrl} removeButton={removeButton} useDefaultButton={useDefaultButton} showEditButtonOnHover={showEditButtonOnHover} stretchPreview={stretchPreview} previewRadius={previewRadius} handleUpload={handleUpload} disabled={disabled}>
            <input ref={inputRef} aria-labelledby={labelId} aria-describedby={descriptionId}
          // if file is already uploaded (from form or via props) set
          // required to false, otherwise farm validation will always fail
          required={imageUrl ? false : required} accept={FileInputType.image} type="file" disabled={uploadStatus === 'inProgress'} className="sr-only" onChange={e => {
            if (e.target.files?.length) {
              uploadFile(e.target.files[0], uploadOptions);
              onFileSelected?.(e.target.files[0]);
            }
          }} />
          </VariantElement>
          {uploadStatus === 'inProgress' && <ProgressBar className="absolute left-0 right-0 top-0" size="xs" value={percentage} />}
        </Field>
      </div>
    </div>;
}
function InputVariant({
  children,
  inputFieldClassNames,
  imageUrl,
  previewSize,
  stretchPreview,
  isLoading,
  handleUpload,
  removeButton,
  useDefaultButton,
  disabled
}) {
  if (imageUrl) {
    return <Fragment>
        <div className={`${previewSize} relative mb-10 overflow-hidden rounded border bg-fg-base/8 p-6`}>
          <img className={clsx('mx-auto h-full rounded', stretchPreview ? 'object-cover' : 'object-contain')} onClick={() => handleUpload()} src={imageUrl} alt="" />
          {children}
        </div>
        <Button onClick={() => handleUpload()} disabled={isLoading || disabled} className="mr-10" variant="outline" color="primary" size="xs">
          <Trans message="Replace" />
        </Button>
        {removeButton && cloneElement(removeButton, {
        variant: 'outline'
      })}
        {useDefaultButton && cloneElement(useDefaultButton, {
        variant: 'outline'
      })}
      </Fragment>;
  }
  return cloneElement(children, {
    className: clsx(inputFieldClassNames.input, 'py-8', 'file:bg-primary file:text-on-primary file:border-none file:rounded file:text-sm file:font-semibold file:px-10 file:h-24 file:mr-10')
  });
}
function SquareVariant({
  children,
  placeholderIcon,
  previewSize,
  imageUrl,
  stretchPreview,
  handleUpload,
  removeButton,
  useDefaultButton,
  previewRadius = 'rounded',
  showEditButtonOnHover = false,
  disabled
}) {
  return <div>
      <div className={clsx(previewSize, previewRadius, !imageUrl && 'border', 'group z-20 flex flex-col items-center justify-center gap-14 bg-fg-base/8 bg-center bg-no-repeat', stretchPreview ? 'bg-cover' : 'bg-contain p-6')} style={imageUrl ? {
      backgroundImage: `url(${imageUrl})`
    } : undefined} onClick={() => handleUpload()}>
        {placeholderIcon && !imageUrl && cloneElement(placeholderIcon, {
        size: 'lg'
      })}
        <Button variant="raised" color="white" size="xs" className={clsx(showEditButtonOnHover && 'invisible group-hover:visible')} disabled={disabled}>
          {imageUrl ? <Trans message="Replace image" /> : <Trans message="Upload image" />}
        </Button>
      </div>
      {children}
      {(removeButton || useDefaultButton) && <div className="mt-8">
          {removeButton && cloneElement(removeButton, {
        variant: 'link'
      })}
          {useDefaultButton && cloneElement(useDefaultButton, {
        variant: 'link'
      })}
        </div>}
    </div>;
}
function AvatarVariant({
  children,
  placeholderIcon,
  previewSize,
  isLoading,
  imageUrl,
  removeButton,
  useDefaultButton,
  handleUpload,
  previewRadius = 'rounded-full',
  disabled
}) {
  if (!placeholderIcon) {
    placeholderIcon = <AvatarPlaceholderIcon viewBox="0 0 48 48" className={clsx('h-full w-full bg-primary-light/40 text-primary/40', previewRadius)} />;
  }
  return <div>
      <div className={clsx('relative', previewSize)} onClick={() => handleUpload()}>
        {imageUrl ? <img src={imageUrl} className={clsx('h-full w-full object-cover', previewRadius)} alt="" /> : placeholderIcon}
        <div className="absolute -bottom-6 -right-6 rounded-full bg-paper shadow-xl">
          <IconButton disabled={isLoading || disabled} type="button" variant="outline" size="sm" color="primary" radius="rounded-full">
            <AddAPhotoIcon />
          </IconButton>
        </div>
      </div>
      {children}
      {(removeButton || useDefaultButton) && <div className="mt-14">
          {removeButton && cloneElement(removeButton, {
        variant: 'link'
      })}
          {useDefaultButton && cloneElement(useDefaultButton, {
        variant: 'link'
      })}
        </div>}
    </div>;
}
export function FormImageSelector(props) {
  const {
    field: {
      onChange,
      value = null
    },
    fieldState: {
      error
    }
  } = useController({
    name: props.name
  });
  const formProps = {
    onChange,
    value,
    invalid: error != null,
    errorMessage: error ? <Trans message="Please select an image." /> : null
  };
  return <ImageSelector {...mergeProps(formProps, props)} />;
}