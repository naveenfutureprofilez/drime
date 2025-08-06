import { useMutation } from '@tanstack/react-query';
import { useLogout } from '@common/auth/requests/logout';
import { toast } from '@ui/toast/toast';
import { useAuth } from '@common/auth/use-auth';
import { apiClient } from '@common/http/query-client';
import { showHttpErrorToast } from '@common/http/show-http-error-toast';
export function useDeleteAccount() {
  const {
    user
  } = useAuth();
  const logout = useLogout();
  return useMutation({
    mutationFn: () => deleteAccount(user.id),
    onSuccess: () => {
      toast('Account deleted');
      logout.mutate();
    },
    onError: err => showHttpErrorToast(err)
  });
}
function deleteAccount(userId) {
  return apiClient.delete(`users/${userId}`, {
    params: {
      deleteCurrentUser: true
    }
  }).then(r => r.data);
}