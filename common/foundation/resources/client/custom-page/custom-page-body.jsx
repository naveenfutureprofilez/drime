import { useEffect, useRef } from 'react';
import { highlightAllCode } from '@common/text-editor/highlight/highlight-code';
export function CustomPageBody({
  page
}) {
  const bodyRef = useRef(null);
  useEffect(() => {
    if (bodyRef.current) {
      highlightAllCode(bodyRef.current);
    }
  }, []);
  return <div className="px-16 md:px-24">
      <div className="custom-page-body prose mx-auto my-50 dark:prose-invert">
        <h1>{page.title}</h1>
        <div ref={bodyRef} className="whitespace-pre-wrap break-words" dangerouslySetInnerHTML={{
        __html: page.body
      }} />
      </div>
    </div>;
}