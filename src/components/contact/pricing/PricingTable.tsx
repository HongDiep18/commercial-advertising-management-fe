'use client'

import { useTranslation } from 'react-i18next'
import Checkbox from '@/components/ui/Checkbox'
import Card, { CardContent } from '@/components/ui/Card'

interface PricingItem {
  id: string
  name?: string
  position?: string
  item?: string
  description?: string
  duration?: string
  price: string
  discount?: string
}

interface PricingTableProps {
  title: string
  items: PricingItem[]
  selectedItems: string[]
  onItemToggle: (itemId: string) => void
  columns: {
    select: boolean
    item: boolean
    description?: boolean
    duration: boolean
    price: boolean
  }
}

export default function PricingTable({
  title,
  items,
  selectedItems,
  onItemToggle,
  columns,
}: PricingTableProps) {
  const { t, i18n } = useTranslation()

  return (
    <Card className="border-border/50">
      <CardContent className="p-6 pt-9">
        <div className="flex items-center justify-between mb-4">
          <h3 key={i18n.language} className="text-lg font-bold text-foreground">{title}</h3>
          <span className="text-xs text-muted-foreground">{t('adContact.unit')}</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-body-bg-dark border-b border-border bg-muted/50">
                {columns.select && (
                  <th className="text-left py-3 px-3 font-semibold w-10 whitespace-nowrap">
                    {t('adContact.select')}
                  </th>
                )}
                {columns.item && (
                  <th className="text-left py-3 px-3 font-semibold whitespace-nowrap">
                    {columns.description ? t('adContact.item') : t('adContact.adItem')}
                  </th>
                )}
                {columns.description && (
                  <th className="text-left py-3 px-3 font-semibold whitespace-nowrap">
                    {t('adContact.description')}
                  </th>
                )}
                {columns.duration && (
                  <th className="text-left py-3 px-3 font-semibold whitespace-nowrap">
                    {t('adContact.duration')}
                  </th>
                )}
                {columns.price && (
                  <th className="text-right py-3 px-3 font-semibold whitespace-nowrap">
                    {t('adContact.price')}
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr
                  key={item.id}
                  className={`border-b border-border/90 hover:bg-body-bg-dark cursor-pointer transition-colors ${
                    selectedItems.includes(item.id) ? 'bg-primary/5' : ''
                  }`}
                  onClick={() => onItemToggle(item.id)}
                >
                  {columns.select && (
                    <td className="py-3 px-3">
                      <Checkbox
                        checked={selectedItems.includes(item.id)}
                        onCheckedChange={() => onItemToggle(item.id)}
                      />
                    </td>
                  )}
                  {columns.item && (
                    <td className="py-3 px-3 font-medium">
                      {item.name || item.position || item.item}
                    </td>
                  )}
                  {columns.description && (
                    <td className="py-3 px-3 text-muted-foreground">{item.description}</td>
                  )}
                  {columns.duration && (
                    <td className="py-3 px-3">
                      {item.duration}
                      {item.discount && (
                        <span className="ml-2 text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">
                          {t('adContact.discount')} {item.discount}
                        </span>
                      )}
                    </td>
                  )}
                  {columns.price && (
                    <td className="py-3 px-3 text-right font-medium">{item.price}</td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
