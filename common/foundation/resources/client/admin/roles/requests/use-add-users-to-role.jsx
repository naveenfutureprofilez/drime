import { useMutation } from '@tanstack/react-query';
import { apiClient } from '@common/http/query-client';
import { toast } from '@ui/toast/toast';
import { message } from '@ui/i18n/message';
import { showHttpErrorToast } from '@common/http/show-http-error-toast';
export function useAddUsersToRole(role) {
  return useMutation({
    mutationFn: ({
      userIds
    }) => addUsersToRole({
      userIds,
      roleId: role.id
    }),
    onSuccess: (response, payload) => {
      toast(message('Assigned [one 1 user|other :count users] to {role}', {
        values: {
          count: payload.userIds.length,
          role: role.name
        }
      }));
    },
    onError: err => showHttpErrorToast(err)
  });
}
function addUsersToRole({
  roleId,
  userIds
}) {
  return apiClient.post(`roles/${roleId}/add-users`, {
    userIds
  }).then(r => r.data);
}