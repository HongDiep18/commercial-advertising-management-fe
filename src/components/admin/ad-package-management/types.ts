export enum PricingModelType {
  DURATION = "DURATION",
  ONE_TIME = "ONE_TIME",
  PER_ACTION = "PER_ACTION",
}

export enum DurationUnitType {
  DAY = "DAY",
  WEEK = "WEEK",
  MONTH = "MONTH",
  YEAR = "YEAR",
}

export type SaveStatus = "idle" | "loading" | "success" | "error"

export type EditablePricingRow = {
  id: string
  pricingModel: PricingModelType
  basePrice: string
  discountRate: string
  durationValue: string
  durationUnit: DurationUnitType | ""
  isActive: boolean
  isNew: boolean
  saveStatus: SaveStatus
}
