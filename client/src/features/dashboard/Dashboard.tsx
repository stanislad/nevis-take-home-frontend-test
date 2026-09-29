import { useState } from 'react'

import { useBusinessData } from '../../hooks/useBusinessData'
import { StatusPanel } from './DashboardPrimitives'
import { findNode } from './hierarchy'
import { HierarchyTable } from './HierarchyTable'
import { mapChartData } from './mapChartData'
import { StackedBarChart } from './StackedBarChart'

export function Dashboard() {
  const { data, error, isLoading, isFetching, refetch } = useBusinessData()
  const [selectedId, setSelectedId] = useState<string | null>(null)

  if (isLoading) {
    return <StatusPanel>Loading client data...</StatusPanel>
  }

  if (error || !data) {
    return (
      <StatusPanel alert>
        <p>{error instanceof Error ? error.message : 'Unable to load client data.'}</p>
        <button type="button" className="cursor-pointer justify-self-center rounded border border-[#82758f] bg-white px-3 py-2 text-[#2d2632] disabled:cursor-wait disabled:opacity-60" disabled={isFetching} onClick={() => refetch()}>
          {isFetching ? 'Retrying…' : 'Try again'}
        </button>
      </StatusPanel>
    )
  }

  const selectedNode = (selectedId && findNode(data, selectedId)) || data
  const chart = mapChartData(selectedNode)

  return (
    <main className="min-h-svh p-3.5 sm:p-6.5">
      <h1 className="mb-4 font-display text-[26px] leading-tight font-medium sm:text-[30px]">Clients</h1>
      <p className="sr-only" aria-live="polite">{`Chart showing ${selectedNode.name}`}</p>
      <StackedBarChart
        key={selectedNode.id}
        data={chart.data}
        xKey="month"
        series={chart.series}
        title={selectedNode.name}
        description={chart.isBreakdown
          ? `Stacked bar chart of ${selectedNode.name}'s clients by acquisition channel for each month.`
          : `Bar chart of total clients for ${selectedNode.name} for each month.`}
      />
      <HierarchyTable company={data} selectedId={selectedNode.id} onSelect={setSelectedId} />
    </main>
  )
}
