import type { MouseEvent, ReactNode } from 'react'

const tableCellClassName = 'h-[47px] whitespace-nowrap border-b border-[#eceaed] px-2.5 text-center'

interface StatusPanelProps {
  readonly children: ReactNode
  readonly alert?: boolean
}

export function StatusPanel({ children, alert = false }: StatusPanelProps) {
  return (
    <main className="grid min-h-svh place-content-center gap-4 p-6 text-center" {...(alert ? { role: 'alert' } : { 'aria-live': 'polite' })}>
      {children}
    </main>
  )
}

interface TableCellProps {
  readonly children: ReactNode
  readonly rowHeader?: boolean
  readonly className?: string
}

export function TableCell({ children, rowHeader = false, className = '' }: TableCellProps) {
  const classes = `${tableCellClassName} ${rowHeader ? 'font-normal' : ''} ${className}`

  if (rowHeader) {
    return <th scope="row" className={classes}>{children}</th>
  }

  return <td className={classes}>{children}</td>
}

interface ExpandButtonProps {
  readonly expanded: boolean
  readonly label: string
  readonly controls?: string
  readonly onToggle: () => void
}

export function ExpandButton({ expanded, label, controls, onToggle }: ExpandButtonProps) {
  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation()
    onToggle()
  }

  return (
    <button type="button" className="grid size-[18px] shrink-0 cursor-pointer place-items-center border-0 bg-transparent p-0" onClick={handleClick} aria-expanded={expanded} aria-controls={controls} aria-label={label}>
      <span className={`size-1.5 border-r-[1.5px] border-b-[1.5px] border-[#222] transition-transform ${expanded ? 'translate-x-[-1px] translate-y-[-1px] rotate-45' : '-rotate-45'}`} aria-hidden="true" />
    </button>
  )
}

export function ExpandSpacer() {
  return <span className="size-[18px] shrink-0" aria-hidden="true" />
}

interface ChartSelectButtonProps {
  readonly selected: boolean
  readonly label: string
  readonly onSelect: () => void
}

export function ChartSelectButton({ selected, label, onSelect }: ChartSelectButtonProps) {
  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation()
    onSelect()
  }

  return (
    <button type="button" className={`grid size-6 shrink-0 cursor-pointer place-items-center rounded ${selected ? 'text-[#7d68c8]' : 'text-[#8e8894] hover:text-[#232126]'}`} onClick={handleClick} aria-pressed={selected} aria-label={label}>
      <svg viewBox="0 0 14 14" className="size-3.5" fill="currentColor" aria-hidden="true">
        <rect x="1" y="7" width="3" height="6" rx="0.5" />
        <rect x="5.5" y="3" width="3" height="10" rx="0.5" />
        <rect x="10" y="5" width="3" height="8" rx="0.5" />
      </svg>
    </button>
  )
}