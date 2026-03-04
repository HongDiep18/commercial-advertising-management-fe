"use client"

import { Gift, ArrowRight } from "lucide-react"
import Button from "@/components/ui/Button"
import Card from "@/components/ui/Card"
import { mockContributionHistory } from "@/contexts/user-context"
import { CONTRIBUTION_TYPE_CONFIG } from "./accountConstants"
import type { TFunction } from "i18next"

type AccountPointsHistoryProps = {
  totalPoints: number
  t: TFunction
}

export function AccountPointsHistory({ totalPoints, t }: AccountPointsHistoryProps) {
  return (
    <Card className="h-fit">
      <Card.Header className="pb-4">
        <Card.Title className="flex items-center gap-2">
          <Gift className="text-primary h-5 w-5" />
          {t("account.pointsHistory") || "點數紀錄"}
        </Card.Title>
        <p className="text-muted-foreground mt-1 text-sm">
          {t("account.totalPoints") || "累計獲得"} {totalPoints.toLocaleString()}{" "}
          {t("account.points") || "點"}
        </p>
      </Card.Header>
      <Card.Content>
        <div className="space-y-3">
          {mockContributionHistory.slice(0, 5).map((item) => {
            const typeConfig = CONTRIBUTION_TYPE_CONFIG[item.type]
            const TypeIcon = typeConfig.icon
            return (
              <div
                key={item.id}
                className="bg-body-bg-dark flex items-center gap-4 rounded-xl p-4"
              >
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-xl ${typeConfig.color}`}
                >
                  <TypeIcon className="h-6 w-6" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-foreground font-medium">{item.description}</p>
                  <p className="text-muted-foreground mt-0.5 text-sm">{item.date}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-green-600">
                    +{item.points.toLocaleString()}
                  </p>
                </div>
              </div>
            )
          })}
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
