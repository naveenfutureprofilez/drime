import { useMutation } from '@tanstack/react-query';
import { toast } from '@ui/toast/toast';
import { useLinkPageStore } from '../link-page-store';
import { apiClient, queryClient } from '@common/http/query-client';
import { DriveQueryKeys } from '../../../drive-query-keys';
import { message } from '@ui/i18n/message';
import { showHttpErrorToast } from '@common/http/show-http-error-toast';
function importIntoOwnDrive({
  linkId,
  password
}) {
  return apiClient.post(`shareable-links/${linkId}/import`, {
    password
  }).then(r => r.data);
}
export function useImportIntoOwnDrive() {
  const password = useLinkPageStore(s => s.password);
  return useMutation({
    mutationFn: props => importIntoOwnDrive({
      ...props,
      password
    }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: DriveQueryKeys.fetchShareableLink()
      });
      toast(message('Item imported into your drive'));
    },
    onError: err => showHttpErrorToast(err, message('Could not create link'))
  });
}