import { queryClient } from '@common/http/query-client';
import { Button } from '@ui/buttons/button';
import { Trans } from '@ui/i18n/trans';
import React from 'react';
import { useRestoreComments } from '@common/comments/requests/use-restore-comments';
export function RestoreCommentsButton({
  commentIds,
  variant = 'outline',
  size = 'xs'
}) {
  const restoreComments = useRestoreComments();
  return <Button variant={variant} size={size} className="mr-10" disabled={restoreComments.isPending} color="primary" onClick={() => {
    restoreComments.mutate({
      commentIds
    }, {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: ['comment']
        });
      }
    });
  }}>
      <Trans message="Restore" />
    </Button>;
}