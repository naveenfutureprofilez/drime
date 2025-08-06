import { useMutation } from '@tanstack/react-query';
import { apiClient } from '@common/http/query-client';
import { showHttpErrorToast } from '@common/http/show-http-error-toast';
export function useStoreVote(model) {
  return useMutation({
    mutationFn: payload => changeVote(model, payload),
    onSuccess: response => {
      //
    },
    onError: err => showHttpErrorToast(err)
  });
}
function changeVote(model, payload) {
  return apiClient.post('vote', {
    vote_type: payload.voteType,
    model_id: model.id,
    model_type: model.model_type
  }).then(r => r.data);
}