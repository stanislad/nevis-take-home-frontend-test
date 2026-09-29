import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { StackedBarChart } from './StackedBarChart'

class ResizeObserverMock {
  observe = vi.fn()
  disconnect = vi.fn()
}

vi.stubGlobal('ResizeObserver', ResizeObserverMock)

describe('StackedBarChart', () => {
  it('hides and restores a series when its legend button is toggled', async () => {
    const user = userEvent.setup()
    const { container } = render(
      <StackedBarChart
        data={[
          { month: 'Feb 2024', existing: 10, organic: 2, paid: 1 },
          { month: 'Mar 2024', existing: 12, organic: 3, paid: 2 },
        ]}
        xKey="month"
        series={[
          { key: 'existing', label: 'Existing clients', color: '#a893ee' },
          { key: 'organic', label: 'New organic', color: '#f1b2ac' },
          { key: 'paid', label: 'New paid', color: '#a65566' },
        ]}
        title="Client acquisition over time"
        description="Client acquisition by month."
      />,
    )

    const existingButton = screen.getByRole('button', { name: 'Hide Existing clients' })
    expect(existingButton).toHaveAttribute('aria-pressed', 'true')
    expect(container.querySelectorAll('rect')).toHaveLength(6)

    fireEvent.pointerEnter(container.querySelector('rect')!, { clientX: 100, clientY: 100 })
    expect(screen.getByRole('tooltip')).toHaveTextContent('Feb 2024: Existing clients 10')

    fireEvent.pointerLeave(container.querySelector('rect')!)
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()

    await user.click(existingButton)

    expect(screen.getByRole('button', { name: 'Show Existing clients' })).toHaveAttribute('aria-pressed', 'false')
    expect(container.querySelectorAll('rect')).toHaveLength(4)

    await user.click(screen.getByRole('button', { name: 'Show Existing clients' }))
    expect(container.querySelectorAll('rect')).toHaveLength(6)
  })
})
