import { Button } from "@ui/buttons/button";
import { useCleanupTransferFiles } from "./requests/use-cleanup-transfer-files";
import { DeleteSweepIcon } from "@ui/icons/material/DeleteSweep";
import { Trans } from "@ui/i18n/trans"; // ✅ ye import missing tha

function PageActions() {
  const cleanupFiles = useCleanupTransferFiles();

  return (
    <div className="flex items-center gap-8">
      <Button
        variant="flat"
        color="primary"
        startIcon={<DeleteSweepIcon />}
        onClick={() => cleanupFiles.mutate()}
        disabled={cleanupFiles.isPending}
      >
        <p className="para text-[16px] !text-white">
Cleanup Expired
        </p>
      </Button>
    </div>
  );
}

export default PageActions;
