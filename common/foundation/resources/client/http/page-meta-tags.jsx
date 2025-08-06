import { Helmet } from '@common/seo/helmet';
import { DefaultMetaTags } from '@common/seo/default-meta-tags';
import React from 'react';
export function PageMetaTags({
  query
}) {
  if (query.data?.set_seo) {
    return null;
  }
  return query.data?.seo ? <Helmet tags={query.data.seo} /> : <DefaultMetaTags />;
}