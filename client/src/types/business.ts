export const MONTHS = [
  'Feb 2024',
  'Mar 2024',
  'Apr 2024',
  'May 2024',
  'Jun 2024',
  'Jul 2024',
  'Aug 2024',
  'Sep 2024',
  'Oct 2024',
  'Nov 2024',
  'Dec 2024',
  'Jan 2025',
] as const

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

export type HierarchyNode = Company | Branch | Advisor | Channel
