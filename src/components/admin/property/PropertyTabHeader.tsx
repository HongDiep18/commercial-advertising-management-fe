import { useTranslation } from "react-i18next"
import { MapPin, RefreshCcw } from "lucide-react"
import Button from "@/components/ui/Button"

type PropertyTabHeaderProps = {
  totalCount: number
  isRealAdmin: boolean
  onRefresh: () => void
  onAddProperty: () => void
}

export function PropertyTabHeader({
  totalCount,
  isRealAdmin,
  onRefresh,
  onAddProperty,
}: PropertyTabHeaderProps) {
  const { t } = useTranslation()

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-muted-foreground text-sm">
        {t("admin.property.listingsCount", { count: totalCount })}
      </p>
      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={onRefresh}
          disabled={!isRealAdmin}
        >
          <RefreshCcw className="h-4 w-4" aria-hidden />
          {t("admin.property.refresh", { defaultValue: "Refresh" })}
        </Button>
        <Button size="sm" variant="primary" type="button" onClick={onAddProperty}>
          <MapPin className="mr-1.5 h-4 w-4" aria-hidden />
          {t("admin.property.addProperty")}
        </Button>
      </div>
    </div>
  )
}
