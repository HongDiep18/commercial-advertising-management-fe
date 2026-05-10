import { useTranslation } from "react-i18next"
import Button from "@/components/ui/Button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/Dialog"
import type { ProfileRequestRow } from "@/types/admin"

type CompanyDeleteDialogProps = {
  candidate: ProfileRequestRow | null
  onClose: () => void
  onConfirm: () => void
  isDeleting?: boolean
}

export function CompanyDeleteDialog({
  candidate,
  onClose,
  onConfirm,
  isDeleting,
}: CompanyDeleteDialogProps) {
  const { t } = useTranslation()

  return (
    <Dialog open={Boolean(candidate)} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="overscroll-contain max-w-md">
        <DialogHeader>
          <DialogTitle>
            {t("admin.companies.deleteCompanyTitle", { defaultValue: "Delete this company?" })}
          </DialogTitle>
          <DialogDescription>
            {t("admin.companies.deleteCompanyConfirm", {
              defaultValue: "Delete this company? The user will be deactivated.",
            })}
          </DialogDescription>
        </DialogHeader>

        <div className="flex justify-end gap-2 mt-4 pb-6 pr-6">
          <Button type="button" variant="outline" onClick={onClose} disabled={isDeleting}>
            {t("common.cancel", { defaultValue: "Cancel" })}
          </Button>
          <Button type="button" variant="primary" onClick={onConfirm} disabled={isDeleting}>
            {isDeleting
              ? t("admin.companies.deleting")
              : t("admin.companies.deleteConfirm")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}