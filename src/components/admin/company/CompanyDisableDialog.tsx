import { useTranslation } from "react-i18next"
import Button from "@/components/ui/Button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/Dialog"
import type { ProfileRequestRow } from "@/types/admin"

type CompanyDisableDialogProps = {
  candidate: ProfileRequestRow | null
  onClose: () => void
  onConfirm: () => void
  isUpdating?: boolean
}

export function CompanyDisableDialog({
  candidate,
  onClose,
  onConfirm,
  isUpdating,
}: CompanyDisableDialogProps) {
  const { t } = useTranslation()

  return (
    <Dialog open={Boolean(candidate)} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="overscroll-contain max-w-md">
        <DialogHeader>
          <DialogTitle>
            {t("admin.companies.disableAccountTitle", { defaultValue: "Disable this account?" })}
          </DialogTitle>
          <DialogDescription>
            {t("admin.companies.disableAccountConfirm", {
              defaultValue: "The user will lose access immediately. You can re-enable it at any time.",
            })}
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 flex justify-end gap-2 pb-6 pr-6">
          <Button type="button" variant="outline" onClick={onClose} disabled={isUpdating}>
            {t("common.cancel", { defaultValue: "Cancel" })}
          </Button>
          <Button type="button" variant="primary" onClick={onConfirm} disabled={isUpdating}>
            {isUpdating
              ? t("common.saving", { defaultValue: "Saving..." })
              : t("admin.companies.disableConfirm", { defaultValue: "Disable" })}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
