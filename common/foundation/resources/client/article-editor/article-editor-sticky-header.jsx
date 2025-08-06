import { SlugEditor } from '@common/ui/other/slug-editor';
import { useController, useFormContext } from 'react-hook-form';
import React, { Fragment, useEffect, useRef } from 'react';
import clsx from 'clsx';
import { useStickySentinel } from '@ui/utils/hooks/sticky-sentinel';
import { useIsMobileMediaQuery } from '@ui/utils/hooks/is-mobile-media-query';
import { Button } from '@ui/buttons/button';
import { Link } from 'react-router';
import { ArrowBackIcon } from '@ui/icons/material/ArrowBack';
import { Trans } from '@ui/i18n/trans';
import { HistoryButtons } from '@common/text-editor/menubar/history-buttons';
import { ModeButton } from '@common/text-editor/menubar/mode-button';
import { ArticleBodyEditorMenubar } from './article-body-editor-menubar';
export function ArticleEditorStickyHeader({
  editor,
  allowSlugEditing = true,
  onSave,
  saveButton,
  isLoading = false,
  backLink,
  slugPrefix = 'pages',
  imageDiskPrefix
}) {
  const {
    isSticky,
    sentinelRef
  } = useStickySentinel();
  const isMobile = useIsMobileMediaQuery();
  return <Fragment>
      <div ref={sentinelRef} />
      <div className={clsx('sticky top-0 z-10 mb-20 bg', isSticky && 'shadow')}>
        <div className="flex items-center justify-between gap-20 border-b px-20 py-10 text-muted sm:justify-start">
          {!isMobile && <Fragment>
              <Button variant="text" size="sm" elementType={Link} to={backLink} relative="path" startIcon={<ArrowBackIcon />}>
                <Trans message="Back" />
              </Button>
              <div className="mr-auto">
                {allowSlugEditing && <FormSlugEditor name="slug" showLinkIcon={false} prefix={slugPrefix} />}
              </div>
            </Fragment>}
          {editor && <HistoryButtons editor={editor} />}
          {!isMobile && <ModeButton editor={editor} />}
          {onSave && <SaveButton onSave={() => {
          onSave(editor.getHTML());
        }} isLoading={isLoading} />}
          {saveButton}
        </div>
        <ArticleBodyEditorMenubar editor={editor} size="sm" imageDiskPrefix={imageDiskPrefix} />
      </div>
    </Fragment>;
}
function SaveButton({
  onSave,
  isLoading
}) {
  const form = useFormContext();
  const title = form.watch('title');
  return <Button variant="flat" size="sm" color="primary" className="min-w-90" disabled={isLoading || !title} onClick={() => onSave()}>
      <Trans message="Save" />
    </Button>;
}
function FormSlugEditor({
  name,
  ...other
}) {
  const {
    field: {
      onChange,
      onBlur,
      value = '',
      ref
    }
  } = useController({
    name
  });
  const manuallyChanged = useRef(false);
  const {
    watch,
    setValue
  } = useFormContext();
  useEffect(() => {
    const subscription = watch((formVal, {
      name: fieldName
    }) => {
      // if user has not changed slug manually, set it based on page title field changes
      if (fieldName === 'title' && !manuallyChanged.current) {
        setValue('slug', formVal.title);
      }
    });
    return () => subscription.unsubscribe();
  }, [watch, setValue]);
  return <SlugEditor className={clsx(!value && 'invisible')} onChange={e => {
    manuallyChanged.current = true;
    onChange(e);
  }} onInputBlur={onBlur} value={value} inputRef={ref} {...other} />;
}