export enum ContributionType {
  Registration = "registration",
  Logo = "logo",
}

export enum CommercialType {
  Advertising = "advertising",
  Purchase = "purchase",
}

export type ContributionHistory = {
  id: string
  type: ContributionType
  description: string
  points: number
  date: string
}

export type CommercialHistory = {
  id: string
  type: CommercialType
  description: string
  amount: number
  points: number
  date: string
}
