'use client'

import { useTranslation } from 'react-i18next'
import { TabType } from '../../utils/contactHelpers'
import { platformPricing, directoryPricing, productPricing } from '../../data/contactMockData'
import PricingTable from './PricingTable'
import Checkbox from '../ui/Checkbox'
import Card, { CardContent } from '../ui/Card'

interface PricingSectionProps {
  activeTab: TabType
  selectedItems: string[]
  onItemToggle: (itemId: string) => void
}

export default function PricingSection({ activeTab, selectedItems, onItemToggle }: PricingSectionProps) {
  const { t, i18n } = useTranslation()

  
  if (activeTab === 'platform') {
    return (
      <div className="space-y-6">
        {Object.entries(platformPricing).map(([categoryKey, category]) => (
          <PricingTable
            key={categoryKey}
            title={t(`adContact.pricing.${categoryKey}.title`)}
            items={[...category.items]}
            selectedItems={selectedItems}
            onItemToggle={onItemToggle}
            columns={{
              select: true,
              item: true,
              duration: true,
              price: true,
            }}
          />
        ))}

        <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <p key={i18n.language} className="text-sm text-amber-800 font-700">
            <p>{t('adContact.note')}</p>
          </p>
        </div>
      </div>
    )
  }

  
  if (activeTab === 'directory') {
    return (
      <Card className="border-border/50">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-foreground">{t('adContact.pricing.directory.title')}</h3>
            <span className="text-xs text-muted-foreground">{t('adContact.unit')}</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-500 bg-muted/50">
                  <th className="text-left py-3 px-3 font-semibold w-10 whitespace-nowrap">{t('adContact.select')}</th>
                  <th className="text-left py-3 px-3 font-semibold whitespace-nowrap">{t('adContact.pagePosition')}</th>
                  <th className="text-right py-3 px-3 font-semibold whitespace-nowrap">{t('adContact.price')}</th>
                </tr>
              </thead>
              <tbody>
                {directoryPricing.map((item) => (
                  <tr
                    key={item.id}
                    className={`border-b border-border/50 hover:bg-body-bg-dark cursor-pointer transition-colors ${
                      selectedItems.includes(item.id) ? 'bg-primary/5' : ''
                    }`}
                    onClick={() => onItemToggle(item.id)}
                  >
                    <td className="py-3 px-3">
                      <Checkbox
                        checked={selectedItems.includes(item.id)}
                        onCheckedChange={() => onItemToggle(item.id)}
                      />
                    </td>
                    <td className="py-3 px-3">{item.position}</td>
                    <td className="py-3 px-3 text-right font-medium">{item.price}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 p-4 bg-muted/50 rounded-lg space-y-2 text-sm text-muted-foreground">
            <p key={i18n.language}>
              <strong>一、</strong>{t('adContact.directoryNotes.note1')}
            </p>
            <p key={`${i18n.language}-2`}>
              <strong>二、</strong>{t('adContact.directoryNotes.note2')}
            </p>
            <p key={`${i18n.language}-3`}>
              <strong>三、</strong>{t('adContact.directoryNotes.note3')}
            </p>
            <p key={`${i18n.language}-4`}>
              <strong>四、</strong>{t('adContact.directoryNotes.note4')}
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  
  return (
    <div className="space-y-6">
      <Card className="border-border/50">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 key={i18n.language} className="text-lg font-bold text-foreground">
              {t('adContact.pricing.product.title')}
            </h3>
            <span className="text-xs text-muted-foreground">{t('adContact.unit')}</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="text-left py-3 px-3 font-semibold w-10 whitespace-nowrap">
                    {t('adContact.select')}
                  </th>
                  <th className="text-left py-3 px-3 font-semibold whitespace-nowrap">
                    {t('adContact.item')}
                  </th>
                  <th className="text-left py-3 px-3 font-semibold whitespace-nowrap">
                    {t('adContact.description')}
                  </th>
                  <th className="text-left py-3 px-3 font-semibold whitespace-nowrap">
                    {t('adContact.duration')}
                  </th>
                  <th className="text-right py-3 px-3 font-semibold whitespace-nowrap">
                    {t('adContact.price')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {productPricing.map((item) => (
                  <tr
                    key={item.id}
                    className={`border-b border-border/50 hover:bg-primary/5 cursor-pointer transition-colors ${
                      selectedItems.includes(item.id) ? 'bg-primary/5' : ''
                    }`}
                    onClick={() => onItemToggle(item.id)}
                  >
                    <td className="py-3 px-3">
                      <Checkbox
                        checked={selectedItems.includes(item.id)}
                        onCheckedChange={() => onItemToggle(item.id)}
                      />
                    </td>
                    <td className="py-3 px-3 font-medium">{item.item}</td>
                    <td className="py-3 px-3 text-muted-foreground">{item.description}</td>
                    <td className="py-3 px-3">
                      {item.duration}
                      {'discount' in item && item.discount && (
                        <span className="ml-2 text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">
                          折扣 {item.discount}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-right font-medium">{item.price}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
