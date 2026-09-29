import { describe, expect, it } from 'vitest'

import { businessFixture } from '../../test/fixtures'
import { findNode } from './hierarchy'
import { mapChartData } from './mapChartData'

describe('mapChartData', () => {
  it('charts an advisor with channels as one stacked series per channel', () => {
    const chart = mapChartData(findNode(businessFixture, 'anna')!)

    expect(chart.isBreakdown).toBe(true)
    expect(chart.series.map((series) => series.label)).toEqual(['Existing clients', 'New organic', 'New paid'])
    expect(chart.data).toHaveLength(12)
    expect(chart.data[3]).toEqual({ month: 'May 2024', existing: 28, organic: 1, paid: 2 })
    expect(chart.data[11]).toEqual({ month: 'Jan 2025', existing: 34, organic: 2, paid: 2 })
  })

  it('charts the supplied totals for a level without a channel breakdown', () => {
    const chart = mapChartData(businessFixture)

    expect(chart.isBreakdown).toBe(false)
    expect(chart.series).toEqual([{ key: 'company', label: 'Company', color: '#a893ee' }])
    expect(chart.data[0]).toEqual({ month: 'Feb 2024', company: 250 })
    expect(chart.data[3]).toEqual({ month: 'May 2024', company: 301 })
  })

  it('charts a single channel with its channel colour', () => {
    const chart = mapChartData(findNode(businessFixture, 'paid')!)

    expect(chart.series).toEqual([{ key: 'paid', label: 'New paid', color: '#a65566' }])
    expect(chart.data[3]).toEqual({ month: 'May 2024', paid: 2 })
  })

  it('falls back to totals for an advisor without channels', () => {
    const chart = mapChartData(findNode(businessFixture, 'james')!)

    expect(chart.isBreakdown).toBe(false)
    expect(chart.data[0]).toEqual({ month: 'Feb 2024', james: 12 })
  })
})
