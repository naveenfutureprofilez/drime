import { Form } from '@ui/forms/form';
import { DirtyFormSaveDrawer } from '@common/admin/crupdate-resource-layout';
import { useUpdateUser } from '@common/admin/users/requests/user-update-user';
import { useOutletContext } from 'react-router';
export function UpdateUserForm({
  form,
  children
}) {
  const user = useOutletContext();
  const updateUser = useUpdateUser(user.id, form);
  return <Form onSubmit={values => {
    updateUser.mutate(values);
  }} onBeforeSubmit={() => form.clearErrors()} form={form}>
      {children}
      <DirtyFormSaveDrawer isLoading={updateUser.isPending} />
    </Form>;
}