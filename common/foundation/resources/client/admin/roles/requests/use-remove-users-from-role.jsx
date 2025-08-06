import { useMutation } from '@tanstack/react-query';
import { apiClient } from '@common/http/query-client';
import { toast } from '@ui/toast/toast';
import { message } from '@ui/i18n/message';
import { showHttpErrorToast } from '@common/http/show-http-error-toast';
export function useRemoveUsersFromRole(role) {
  return useMutation({
    mutationFn: ({
      userIds
    }) => removeUsersFromRole({
      userIds,
      roleId: role.id
    }),
    onSuccess: (response, payload) => {
      toast(message('Removed [one 1 user|other :count users] from “{role}“', {
        values: {
          count: payload.userIds.length,
          role: role.name
        }
      }));
    },
    onError: err => showHttpErrorToast(err)
  });
}
function removeUsersFromRole({
  roleId,
  userIds
}) {
  return apiClient.post(`roles/${roleId}/remove-users`, {
    userIds
  }).then(r => r.data);
}