import { useState } from 'react'

import { MONTHS } from '../../types/business'
import type { Company, HierarchyNode } from '../../types/business'
import { ChartSelectButton, ExpandButton, ExpandSpacer, TableCell } from './DashboardPrimitives'
import { childrenFor } from './hierarchy'

const CHANNEL_DEPTH = 3
const LEVEL_LABELS = ['company', 'branch', 'advisor', 'acquisition channel'] as const

const rowIdFor = (node: HierarchyNode) => `hierarchy-row-${node.id}`

interface HierarchyTableProps {
  readonly company: Company
  readonly selectedId: string
  readonly onSelect: (id: string) => void
}

interface HierarchyRowProps {
  readonly node: HierarchyNode
  readonly depth: number
  readonly expandedIds: ReadonlySet<string>
  readonly onToggle: (id: string) => void
  readonly selectedId: string
  readonly onSelect: (id: string) => void
}

function HierarchyRow({ node, depth, expandedIds, onToggle, selectedId, onSelect }: HierarchyRowProps) {
  const children = childrenFor(node)
  const hasChildren = children.length > 0
  const expanded = expandedIds.has(node.id)
  const selected = node.id === selectedId
  const controlledRowIds = hasChildren && expanded ? children.map(rowIdFor).join(' ') : undefined
  const rowClassName = [
    hasChildren ? 'cursor-pointer' : '',
    selected ? 'bg-[#f3f0fb]' : hasChildren ? 'hover:bg-[#f7f6f8]' : '',
    depth === CHANNEL_DEPTH ? 'text-[#4c4850]' : '',
  ].join(' ')

  return (
    <>
      <tr
        id={rowIdFor(node)}
        className={rowClassName}
        onClick={hasChildren ? () => onToggle(node.id) : undefined}
      >
        <TableCell rowHeader>
          <div className="flex min-w-max items-center gap-1.5 text-left" style={{ paddingInlineStart: `${depth * 24}px` }}>
            {hasChildren ? (
              <ExpandButton expanded={expanded} label={`${expanded ? 'Collapse' : 'Expand'} ${node.name}`} controls={controlledRowIds} onToggle={() => onToggle(node.id)} />
            ) : <ExpandSpacer />}
            <span className="min-w-[115px]">{node.name}</span>
            {/* aria-level is ignored in a plain table, so the level is spoken as text instead. */}
            <span className="sr-only">{`, ${LEVEL_LABELS[depth]}, level ${depth + 1}`}</span>
            <ChartSelectButton selected={selected} label={`Show ${node.name} in chart`} onSelect={() => onSelect(node.id)} />
          </div>
        </TableCell>
        {node.values.map((value, index) => <TableCell key={`${node.id}-${MONTHS[index]}`}>{value}</TableCell>)}
      </tr>
      {hasChildren && expanded && children.map((child) => (
        <HierarchyRow key={child.id} node={child} depth={depth + 1} expandedIds={expandedIds} onToggle={onToggle} selectedId={selectedId} onSelect={onSelect} />
      ))}
    </>
  )
}

export function HierarchyTable({ company, selectedId, onSelect }: HierarchyTableProps) {
  const [expandedIds, setExpandedIds] = useState<ReadonlySet<string>>(() => new Set([company.id]))

  const toggle = (id: string) => {
    setExpandedIds((current) => {
      const next = new Set(current)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return (
    <section className="mt-3.5 overflow-hidden rounded-lg bg-white" aria-label="Client hierarchy by month">
      <div className="overflow-x-auto">
        <table className="min-w-245 w-full border-collapse text-[13px]">
          <thead className="font-normal text-[#77727b]"><tr><th scope="col" className="h-[47px] w-57.5 px-2.5 font-normal">&nbsp;</th>{MONTHS.map((month) => <th key={month} scope="col" className="h-[47px] whitespace-nowrap border-b border-[#eceaed] px-2.5 text-center font-normal">{month}</th>)}</tr></thead>
          <tbody><HierarchyRow node={company} depth={0} expandedIds={expandedIds} onToggle={toggle} selectedId={selectedId} onSelect={onSelect} /></tbody>
        </table>
      </div>
    </section>
  )
}
