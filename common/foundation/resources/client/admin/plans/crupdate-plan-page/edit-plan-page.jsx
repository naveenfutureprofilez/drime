import { FullPageLoader } from '@ui/progress/full-page-loader';
import { Trans } from '@ui/i18n/trans';
import { useForm } from 'react-hook-form';
import { CrupdateResourceLayout } from '../../crupdate-resource-layout';
import { useProduct } from '../requests/use-product';
import { CrupdatePlanForm } from './crupdate-plan-form';
import { useUpdateProduct } from '../requests/use-update-product';
export function EditPlanPage() {
  const query = useProduct();
  if (query.status !== 'success') {
    return <FullPageLoader />;
  }
  return <PageContent product={query.data.product} />;
}
function PageContent({
  product
}) {
  const form = useForm({
    defaultValues: {
      ...product,
      feature_list: product.feature_list.map(f => ({
        value: f
      }))
    }
  });
  const updateProduct = useUpdateProduct(form);
  return <CrupdateResourceLayout form={form} onSubmit={values => {
    updateProduct.mutate(values);
  }} title={<Trans message="Edit “:name“ plan" values={{
    name: product.name
  }} />} isLoading={updateProduct.isPending}>
      <CrupdatePlanForm />
    </CrupdateResourceLayout>;
}