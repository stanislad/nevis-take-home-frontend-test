import { MONTHS } from '../../types/business'
import type { HierarchyNode } from '../../types/business'

export interface ChartSeriesDefinition {
  readonly key: string
  readonly label: string
  readonly color: string
}

export type ChartDatum = Readonly<Record<string, string | number>> & { readonly month: string }

export interface ChartModel {
  readonly data: readonly ChartDatum[]
  readonly series: readonly ChartSeriesDefinition[]
  readonly isBreakdown: boolean
}

const CHANNEL_COLORS: Readonly<Record<string, string>> = {
  'Existing clients': '#a893ee',
  'New organic': '#f1b2ac',
  'New paid': '#a65566',
}

const DEFAULT_COLOR = '#a893ee'

// Only advisors carry a channel breakdown in the data; other levels chart their supplied totals.
export function mapChartData(node: HierarchyNode): ChartModel {
  const channels = 'channels' in node ? node.channels ?? [] : []
  const sources: readonly HierarchyNode[] = channels.length > 0 ? channels : [node]

  return {
    isBreakdown: channels.length > 0,
    series: sources.map((source) => ({
      key: source.id,
      label: source.name,
      color: CHANNEL_COLORS[source.name] ?? DEFAULT_COLOR,
    })),
    data: MONTHS.map((month, index): ChartDatum => ({
      ...Object.fromEntries(sources.map((source) => [source.id, source.values[index] ?? 0])),
      month,
    })),
  }
}
