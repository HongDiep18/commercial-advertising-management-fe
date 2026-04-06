"use client"

import { useCompanyActiveAds } from "@/api/active-ads/hooks"
import Button from "@/components/ui/Button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/shadcn-dialog/dialog"
import { X } from "lucide-react"
import { useTranslation } from "react-i18next"
import { CompanyActiveAdCreateForm } from "./CompanyActiveAdCreateForm"
import { CompanyActiveAdRow } from "./CompanyActiveAdRow"
type Props = {
  companyId: string
  companyName: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CompanyActiveAdsDialog({ companyId, companyName, open, onOpenChange }: Props) {
  const { t, i18n } = useTranslation()
  const { data, isLoading, isError } = useCompanyActiveAds(open ? companyId : null)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="bg-body-bg-dark w-full max-w-2xl overflow-y-auto sm:max-w-2xl"
      >
        <Button
          variant="ghost"
          size="icon"
          className="text-muted-foreground absolute top-3 right-3 h-8 w-8"
          onClick={() => onOpenChange(false)}
          aria-label={t("admin.companies.closeDialog")}
        >
          <X className="h-4 w-4" />
        </Button>

        <DialogHeader>
          <DialogTitle>{companyName}</DialogTitle>
          <DialogDescription>
            {t("admin.activeAds.dialogDescription", "Active ads for this company")}
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 max-h-[70vh] space-y-2 overflow-y-auto pb-5">
          <CompanyActiveAdCreateForm companyId={companyId} />
          {isLoading && (
            <p className="text-muted-foreground text-sm">{t("common.loading", "Loading...")}</p>
          )}

          {isError && (
            <p className="text-destructive text-sm">
              {t("admin.activeAds.loadError", "Failed to load active ads")}
            </p>
          )}

          {!isLoading && !isError && data?.items.length === 0 && (
            <p className="text-muted-foreground text-sm">{t("admin.activeAds.empty")}</p>
          )}

          {!isLoading &&
            !isError &&
            data?.items.map((ad) => (
              <CompanyActiveAdRow
                key={ad.id}
                ad={ad}
                companyId={companyId}
                locale={i18n.language}
                lang={i18n.language}
              />
            ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
