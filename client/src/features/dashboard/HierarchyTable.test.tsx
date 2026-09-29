import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { businessFixture } from '../../test/fixtures'
import { HierarchyTable } from './HierarchyTable'

function renderTable(onSelect = vi.fn()) {
  render(<HierarchyTable company={businessFixture} selectedId="company" onSelect={onSelect} />)
  return onSelect
}

describe('HierarchyTable', () => {
  it('starts with only the Company expanded', () => {
    renderTable()

    expect(screen.getByRole('button', { name: 'Collapse Company' })).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByRole('button', { name: 'Expand Branch 1' })).toHaveAttribute('aria-expanded', 'false')
    expect(screen.queryByText('Anna Blackwood')).not.toBeInTheDocument()
  })

  it('exposes each row level and the rows an expander controls to assistive technology', () => {
    renderTable()

    expect(screen.getByRole('rowheader', { name: /Company, company, level 1/ })).toBeInTheDocument()
    expect(screen.getByRole('rowheader', { name: /Branch 1, branch, level 2/ })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Collapse Company' }))
      .toHaveAttribute('aria-controls', 'hierarchy-row-branch-1 hierarchy-row-branch-2')
    expect(screen.getByRole('button', { name: 'Expand Branch 1' })).not.toHaveAttribute('aria-controls')
  })

  it('expands and collapses with click and native button keyboard behavior', async () => {
    const user = userEvent.setup()
    renderTable()

    const branchButton = screen.getByRole('button', { name: 'Expand Branch 1' })
    await user.click(branchButton)

    expect(branchButton).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByText('Anna Blackwood')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Expand James Walker' })).not.toBeInTheDocument()

    const advisorButton = screen.getByRole('button', { name: 'Expand Anna Blackwood' })
    advisorButton.focus()
    await user.keyboard('{Enter}')

    expect(advisorButton).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByText('Existing clients')).toBeInTheDocument()

    await user.keyboard(' ')
    expect(advisorButton).toHaveAttribute('aria-expanded', 'false')
    expect(screen.queryByText('Existing clients')).not.toBeInTheDocument()
  })

  it('expands an expandable row when any of its cells is clicked', async () => {
    const user = userEvent.setup()
    renderTable()

    const branchRow = screen.getByText('Branch 1').closest('tr')
    expect(branchRow).toHaveClass('cursor-pointer')

    await user.click(branchRow!)

    expect(screen.getByText('Anna Blackwood')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Collapse Branch 1' })).toHaveAttribute('aria-expanded', 'true')
  })

  it('selects a row for the chart without toggling its expansion', async () => {
    const user = userEvent.setup()
    const onSelect = renderTable()

    expect(screen.getByRole('button', { name: 'Show Company in chart' })).toHaveAttribute('aria-pressed', 'true')

    const selectBranch = screen.getByRole('button', { name: 'Show Branch 1 in chart' })
    expect(selectBranch).toHaveAttribute('aria-pressed', 'false')
    await user.click(selectBranch)

    expect(onSelect).toHaveBeenCalledWith('branch-1')
    expect(screen.getByRole('button', { name: 'Expand Branch 1' })).toHaveAttribute('aria-expanded', 'false')
  })
})
