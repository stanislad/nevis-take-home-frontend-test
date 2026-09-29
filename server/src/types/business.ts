export const MONTH_COUNT = 12 as const

export type MonthlyValues = readonly number[]

export interface Channel {
  readonly id: string
  readonly name: string
  readonly values: MonthlyValues
}

export interface Advisor {
  readonly id: string
  readonly name: string
  readonly values: MonthlyValues
  readonly channels?: readonly Channel[]
}

export interface Branch {
  readonly id: string
  readonly name: string
  readonly values: MonthlyValues
  readonly advisors?: readonly Advisor[]
}

export interface Company {
  readonly id: string
  readonly name: string
  readonly values: MonthlyValues
  readonly branches: readonly Branch[]
}
