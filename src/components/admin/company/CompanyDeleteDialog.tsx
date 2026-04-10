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
  const hasLinkedUser = Boolean(candidate?.userId?.trim())
  const hasCompanyTarget = Boolean(candidate?.companyId?.trim())
  const title = hasLinkedUser
    ? t("admin.companies.deleteCompanyTitle", { defaultValue: "Delete this company?" })
    : hasCompanyTarget
      ? t("admin.companies.archiveCompanyTitle", { defaultValue: "Archive this company?" })
      : t("admin.companies.deleteCompanyTitle", { defaultValue: "Delete this company?" })
  const description = hasLinkedUser
    ? t("admin.companies.deleteCompanyConfirm", {
        defaultValue: "This action cannot be undone. The user will be deactivated.",
      })
    : hasCompanyTarget
      ? t("admin.companies.archiveCompanyConfirm", {
          defaultValue: "This will archive the company and mark it as rejected.",
        })
      : t("admin.companies.deleteCompanyConfirm", {
          defaultValue: "This action cannot be undone. The user will be deactivated.",
        })
  const confirmLabel = hasLinkedUser
    ? t("admin.companies.deleteConfirm", { defaultValue: "Delete" })
    : hasCompanyTarget
      ? t("admin.companies.archiveConfirm", { defaultValue: "Archive" })
      : t("admin.companies.deleteConfirm", { defaultValue: "Delete" })

  return (
    <Dialog open={Boolean(candidate)} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="overscroll-contain max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="flex justify-end gap-2 mt-4 pb-6 pr-6">
          <Button type="button" variant="outline" onClick={onClose} disabled={isDeleting}>
            {t("common.cancel", { defaultValue: "Cancel" })}
          </Button>
          <Button type="button" variant="primary" onClick={onConfirm} disabled={isDeleting}>
            {isDeleting ? t("admin.companies.deleting") : confirmLabel}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
