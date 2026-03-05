"use client"

import { Megaphone, ShoppingCart, ArrowRight } from "lucide-react"
import Button from "@/components/ui/Button"
import Card from "@/components/ui/Card"
import { mockCommercialHistory, CommercialType } from "@/contexts/user-context"
import type { TFunction } from "i18next"

type AccountCommercialHistoryProps = {
  t: TFunction
}

export function AccountCommercialHistory({ t }: AccountCommercialHistoryProps) {
  return (
    <Card className="h-fit lg:col-span-2">
      <Card.Header className="pb-4">
        <Card.Title className="flex items-center gap-2">
          <Megaphone className="text-primary h-5 w-5" />
          {t("account.adHistory") || "廣告投放 / 消費紀錄"}
        </Card.Title>
        <p className="text-muted-foreground mt-1 text-sm">
          {t("account.adHistoryDesc") || "您的廣告投放與消費歷史"}
        </p>
      </Card.Header>
      <Card.Content>
        <div className="grid gap-3 sm:grid-cols-2">
          {mockCommercialHistory.map((item) => (
            <div
              key={item.id}
              className="bg-body-bg-light flex items-center gap-4 rounded-xl p-4"
            >
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-xl ${
                  item.type === CommercialType.Advertising
                    ? "bg-purple-100 text-purple-600"
                    : "bg-blue-100 text-blue-600"
                }`}
              >
                {item.type === CommercialType.Advertising ? (
                  <Megaphone className="h-6 w-6" />
                ) : (
                  <ShoppingCart className="h-6 w-6" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-foreground font-medium">{item.description}</p>
                <p className="text-muted-foreground mt-0.5 text-sm">{item.date}</p>
              </div>
              <div className="text-right">
                <p className="text-foreground font-semibold">
                  {item.amount.toLocaleString()} VND
                </p>
                <p className="text-sm text-green-600">
                  +{item.points.toLocaleString()} 點
                </p>
              </div>
            </div>
          ))}
        </div>
        <Button
          variant="ghost"
          className="hover:!bg-header-red-dark mt-4 w-full border !border-gray-400 bg-transparent hover:!text-white"
        >
          {t("account.viewAllRecords") || "查看全部紀錄"}
          <ArrowRight className="ml-1 h-4 w-4" />
        </Button>
      </Card.Content>
    </Card>
  )
}
