import { ProgressCircle } from '@ui/progress/progress-circle';
import { Trans } from '@ui/i18n/trans';
export function DomainProgressIndicator({
  message = <Trans message="Checking DNS configuration..." />
}) {
  return <div className="flex items-center gap-18 rounded bg-primary/10 p-12 text-base text-primary">
      <ProgressCircle isIndeterminate size="sm" />
      <div>{message}</div>
    </div>;
}