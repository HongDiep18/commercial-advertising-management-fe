"use client"

import type { CompanyChannelContact } from "@/api/companies/types"
import Badge from "@/components/ui/Badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PERSISTENT_EMPTY_STRING_QUERY } from "@/lib/persistentUiQuery"
import { groupChannelContactsByType } from "@/utils/channelContacts"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import type { TFunction } from "i18next"
import { Check, Copy, Phone } from "lucide-react"
import { useMemo } from "react"

const activeTypeQueryKey = (companyId: string) =>
  ["ui", "companyDetail", companyId, "channelContactsActiveType"] as const

function channelTypeLabel(id: string, displayFallback: string, t: TFunction): string {
  return t(`companyDetail.channelContactTypes.${id}`, {
    defaultValue: displayFallback,
  })
}

function ChannelValueRows({
  items,
  copiedValue,
  onCopy,
  t,
}: {
  items: CompanyChannelContact[]
  copiedValue: string | null
  onCopy: (value: string) => void
  t: TFunction
}) {
  return (
    <ul className="space-y-2">
      {items.map((item, idx) => (
        <li key={`${item.value}-${idx}`}>
          <button
            type="button"
            onClick={() => onCopy(item.value)}
            disabled={!item.value?.trim()}
            className="from-primary/[0.06] via-muted/20 to-body-bg-dark/40 border-border/80 hover:border-primary/35 hover:from-primary/[0.10] focus-visible:ring-ring group flex w-full cursor-pointer items-start gap-2 rounded-lg border bg-gradient-to-br px-3 py-2.5 text-left transition-colors focus-visible:ring-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-40"
            aria-label={t("companyDetail.channelContactCopyRow", {
              defaultValue: "Copy {{value}}",
              value: item.value,
            })}
          >
            <div className="min-w-0 flex-1">
              <p className="text-foreground text-sm font-medium break-all">{item.value}</p>
              {item.contactName?.trim() ? (
                <p className="text-muted-foreground mt-1 text-xs">{item.contactName}</p>
              ) : null}
            </div>
            <span
              className="text-muted-foreground group-hover:text-primary mt-0.5 shrink-0 rounded p-0.5 transition-colors"
              aria-hidden
            >
              {copiedValue === item.value ? (
                <Check className="h-4 w-4 text-green-600" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </span>
          </button>
        </li>
      ))}
    </ul>
  )
}

type ChannelContactsBlockProps = {
  companyId: string
  contacts: CompanyChannelContact[]
  copiedValue: string | null
  onCopyValue: (value: string) => void
  t: TFunction
}

export function ChannelContactsBlock({
  companyId,
  contacts,
  copiedValue,
  onCopyValue,
  t,
}: ChannelContactsBlockProps) {
  const queryClient = useQueryClient()
  const qKey = activeTypeQueryKey(companyId)
  const { data: storedType = "" } = useQuery({
    queryKey: qKey,
    ...PERSISTENT_EMPTY_STRING_QUERY,
  })

  const groups = useMemo(() => groupChannelContactsByType(contacts), [contacts])

  const effectiveType =
    storedType && groups.some((g) => g.id === storedType) ? storedType : (groups[0]?.id ?? "")

  if (groups.length === 0) return null

  const header = (
    <div className="mb-3 flex items-center gap-2">
      <div className="bg-primary/10 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full">
        <Phone className="text-primary h-4 w-4" />
      </div>
      <p className="text-muted-foreground text-sm font-medium">
        {t("companyDetail.channelContacts", "Contact channels")}
      </p>
    </div>
  )

  if (groups.length === 1) {
    const g = groups[0]
    return (
      <div className="mb-8">
        {header}
        <div className="border-border/80 bg-body-bg-dark/20 rounded-xl border p-4">
          <div className="mb-3 flex items-center gap-2">
            <Badge variant="outline" className="text-xs font-medium uppercase">
              {channelTypeLabel(g.id, g.label, t)}
            </Badge>
            {g.items.length > 1 ? (
              <span className="text-muted-foreground text-xs">
                {t("companyDetail.channelContactCount", {
                  count: g.items.length,
                  defaultValue: "{{count}} numbers",
                })}
              </span>
            ) : null}
          </div>
          <ChannelValueRows items={g.items} copiedValue={copiedValue} onCopy={onCopyValue} t={t} />
        </div>
      </div>
    )
  }

  return (
    <div className="mb-8">
      {header}
      <Tabs
        value={effectiveType}
        onValueChange={(v) => queryClient.setQueryData(qKey, v)}
        className="gap-0"
      >
        <TabsList
          variant="line"
          className="border-border/60 bg-body-bg-dark/30 w-full flex-wrap justify-start gap-0 rounded-xl border p-1"
        >
          {groups.map((g) => (
            <TabsTrigger
              key={g.id}
              value={g.id}
              className="data-active:bg-primary/15 rounded-lg px-3 py-1.5 text-xs font-medium"
            >
              <span>{channelTypeLabel(g.id, g.label, t)}</span>
              {g.items.length > 1 ? (
                <span className="text-muted-foreground ml-1">({g.items.length})</span>
              ) : null}
            </TabsTrigger>
          ))}
        </TabsList>
        {groups.map((g) => (
          <TabsContent key={g.id} value={g.id} className="mt-0">
            <div className="border-border/80 bg-body-bg-dark/15 rounded-xl border border-t-0 p-4">
              <ChannelValueRows
                items={g.items}
                copiedValue={copiedValue}
                onCopy={onCopyValue}
                t={t}
              />
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
