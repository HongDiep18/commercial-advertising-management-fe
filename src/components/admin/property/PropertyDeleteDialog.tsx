import { useTranslation } from "react-i18next"
import { useDeleteProperty } from "@/api/properties/hooks"
import Button from "@/components/ui/Button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/Dialog"
import { useUser } from "@/contexts/user-context"
import { FeatureKey } from "@/types"
import { isDemoAdminUser } from "@/components/login/demo/demoUsers"
import type { PropertyRow } from "./types"

type PropertyDeleteDialogProps = {
  candidate: PropertyRow | null
  onClose: () => void
  onSuccess: (message: string) => void
  onError: (message: string) => void
}

export function PropertyDeleteDialog({
  candidate,
  onClose,
  onSuccess,
  onError,
}: PropertyDeleteDialogProps) {
  const { t } = useTranslation()
  const { user, canUseFeature } = useUser()
  const isDemoAdmin = isDemoAdminUser(user)
  const isRealAdmin = canUseFeature(FeatureKey.AdminPanel) && !isDemoAdmin
  const { remove, isPending: isDeleting } = useDeleteProperty()

  const handleConfirm = async () => {
    if (!candidate) return

    if (!isRealAdmin) {
      onError(
        t("admin.property.demoReadOnly", {
          defaultValue: "Demo admin is read-only for property actions.",
        })
      )
      onClose()
      return
    }

    try {
      await remove(candidate.id)
      onSuccess(
        t("admin.property.deleteSuccess", {
          defaultValue: "Property deleted successfully.",
        })
      )
      onClose()
    } catch {
      onError(
        t("admin.property.deleteError", {
          defaultValue: "Failed to delete property.",
        })
      )
    }
  }

  return (
    <Dialog open={Boolean(candidate)} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="overscroll-contain max-w-md">
        <DialogHeader>
          <DialogTitle>
            {t("admin.property.deleteTitle", {
              defaultValue: "Delete property?",
            })}
          </DialogTitle>
          <DialogDescription>
            {t("admin.property.deleteDescription", {
              defaultValue: "This action cannot be undone. The property will be removed permanently.",
            })}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 p-6 pt-4">
          {candidate ? (
            <div className="bg-muted/50 rounded-lg border p-3">
              <p className="text-foreground text-sm font-medium">{candidate.title}</p>
              <p className="text-muted-foreground mt-1 text-xs">
                {candidate.provinceName || candidate.province}
              </p>
            </div>
          ) : null}

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isDeleting}
            >
              {t("common.cancel", { defaultValue: "Cancel" })}
            </Button>
            <Button type="button" variant="primary" onClick={() => void handleConfirm()} disabled={isDeleting}>
              {isDeleting
                ? t("admin.property.deleting", { defaultValue: "Deleting…" })
                : t("admin.property.deleteConfirm", { defaultValue: "Delete" })}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
