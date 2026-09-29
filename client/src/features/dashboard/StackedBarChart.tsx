import { scaleBand, scaleLinear, stack } from 'd3'
import { useEffect, useId, useRef, useState } from 'react'

interface ChartSeries<T extends object> {
  readonly key: Extract<keyof T, string>
  readonly label: string
  readonly color: string
}

interface StackedBarChartProps<T extends object> {
  readonly data: readonly T[]
  readonly xKey: Extract<keyof T, string>
  readonly series: readonly ChartSeries<T>[]
  readonly title: string
  readonly description: string
}

interface TooltipState {
  readonly label: string
  readonly x: number
  readonly y: number
}

function ChartTooltip({ label, x, y }: TooltipState) {
  const flip = x > window.innerWidth / 2

  return (
    <div
      role="tooltip"
      className={`pointer-events-none fixed z-10 rounded bg-[#232126] px-2 py-1 text-xs whitespace-nowrap text-white shadow-sm ${flip ? '-translate-x-full' : ''}`}
      style={{ left: flip ? x - 12 : x + 12, top: Math.max(4, y - 32) }}
    >
      {label}
    </div>
  )
}

// Below this width the chart scrolls rather than squashing twelve bars and their labels.
const MIN_CHART_WIDTH = 600

export function StackedBarChart<T extends object>({
  data,
  xKey,
  series,
  title,
  description,
}: StackedBarChartProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [width, setWidth] = useState(900)
  const [tooltip, setTooltip] = useState<TooltipState | null>(null)
  // Legend buttons drive this set so D3 stacks and rescales only visible series.
  const [visibleKeys, setVisibleKeys] = useState<ReadonlySet<Extract<keyof T, string>>>(() => new Set(series.map(({ key }) => key)))
  const titleId = useId()
  const descriptionId = useId()
  const height = 330
  const margin = { top: 22, right: 12, bottom: 66, left: 48 }
  const chartWidth = Math.max(width, MIN_CHART_WIDTH)
  const plotWidth = chartWidth - margin.left - margin.right
  const plotHeight = height - margin.top - margin.bottom
  const visibleSeries = series.filter(({ key }) => visibleKeys.has(key))
  const keys = visibleSeries.map(({ key }) => key)
  const maxValue = Math.max(
    ...data.map((datum) => keys.reduce((sum, key) => sum + Number(datum[key]), 0)),
    1,
  )
  const yMaximum = Math.ceil(maxValue / 50) * 50
  const x = scaleBand<string>()
    .domain(data.map((datum) => String(datum[xKey])))
    .range([0, plotWidth])
    .padding(0.22)
  const y = scaleLinear().domain([0, yMaximum]).nice().range([plotHeight, 0])
  const layers = stack<T>().keys(keys)(data)
  const ticks = y.ticks(4)

  useEffect(() => {
    const element = containerRef.current
    if (!element) {
      return
    }

    const observer = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width))
    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  return (
    <section className="rounded-lg bg-white px-2 pt-3 pb-2 sm:px-4 sm:pt-5" aria-labelledby={titleId}>
      <h2 id={titleId} className="mb-2 px-2 text-[13px] font-medium sm:px-0">{title}</h2>
      <div className="min-w-0 overflow-x-auto" ref={containerRef}>
        <svg className="block min-h-75 w-full min-w-150 overflow-visible" viewBox={`0 0 ${chartWidth} ${height}`} role="img" aria-labelledby={`${titleId} ${descriptionId}`}>
          <desc id={descriptionId}>{description}</desc>
          <g transform={`translate(${margin.left}, ${margin.top})`}>
            {ticks.map((tick) => (
              <g key={tick}>
                <line className="stroke-[#dedbe3] stroke-1 [stroke-dasharray:2_5]" x1="0" x2={plotWidth} y1={y(tick)} y2={y(tick)} />
                <text className="fill-[#76727c] text-[11px]" x="-12" y={y(tick)} textAnchor="end" dominantBaseline="middle">{tick}</text>
              </g>
            ))}
            {layers.map((layer, layerIndex) => layer.map((segment, index) => {
              const xPosition = x(String(data[index][xKey]))
              if (xPosition === undefined) {
                return null
              }
              const chartSeries = visibleSeries[layerIndex]
              const month = String(data[index][xKey])
              const value = Number(data[index][layer.key as Extract<keyof T, string>])
              const tooltipLabel = `${month}: ${chartSeries.label} ${value}`

              return (
                <rect
                  key={`${layer.key}-${index}`}
                  className="cursor-pointer transition-opacity hover:opacity-80"
                  x={xPosition}
                  y={y(segment[1])}
                  width={x.bandwidth()}
                  height={Math.max(0, y(segment[0]) - y(segment[1]))}
                  fill={chartSeries.color}
                  rx="2"
                  onPointerEnter={(event) => setTooltip({ label: tooltipLabel, x: event.clientX, y: event.clientY })}
                  onPointerMove={(event) => setTooltip({ label: tooltipLabel, x: event.clientX, y: event.clientY })}
                  onPointerLeave={() => setTooltip(null)}
                />
              )
            }))}
            {data.map((datum) => {
              const label = String(datum[xKey])
              const xPosition = x(label)
              if (xPosition === undefined) {
                return null
              }
              return <text key={label} className="fill-[#76727c] text-[10px]" x={xPosition + x.bandwidth() / 2} y={plotHeight + 21} textAnchor="middle">{label}</text>
            })}
          </g>
        </svg>
      </div>
      {tooltip && <ChartTooltip {...tooltip} />}
      <ul className="mt-[-8px] mb-1 flex justify-start gap-4 pl-3 text-[11px] text-[#76727c] sm:justify-center sm:pl-0" aria-label="Chart series">
        {series.map((item) => {
          const isVisible = visibleKeys.has(item.key)

          // Click handler for toggling the visibility of the series
          return (
            <li key={item.key}>
              <button
                type="button"
                className={`flex cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-sm ${isVisible ? '' : 'opacity-40'}`}
                aria-pressed={isVisible}
                aria-label={`${isVisible ? 'Hide' : 'Show'} ${item.label}`}
                onClick={() => setVisibleKeys((current) => {
                  const next = new Set(current)
                  if (next.has(item.key)) next.delete(item.key)
                  else next.add(item.key)
                  return next
                })}
              >
                <span className="size-1.5 rounded-sm" style={{ backgroundColor: item.color }} />
                {item.label}
              </button>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
