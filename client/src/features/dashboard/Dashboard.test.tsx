import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { businessFixture } from '../../test/fixtures'
import { Dashboard } from './Dashboard'

class ResizeObserverMock {
  observe = vi.fn()
  disconnect = vi.fn()
}

const successResponse = { ok: true, json: async () => businessFixture }

function renderDashboard(fetchMock = vi.fn().mockResolvedValue(successResponse)) {
  vi.stubGlobal('ResizeObserver', ResizeObserverMock)
  vi.stubGlobal('fetch', fetchMock)
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  render(<QueryClientProvider client={queryClient}><Dashboard /></QueryClientProvider>)
}

describe('Dashboard', () => {
  afterEach(() => vi.unstubAllGlobals())

  it('shows a loading state while the data is requested', () => {
    renderDashboard(vi.fn(() => new Promise(() => {})))

    expect(screen.getByText('Loading client data...')).toBeInTheDocument()
  })

  it('shows the API error and recovers when retried', async () => {
    const user = userEvent.setup()
    renderDashboard(vi.fn()
      .mockResolvedValueOnce({ ok: false, status: 500 })
      .mockResolvedValueOnce(successResponse))

    expect(await screen.findByRole('alert')).toHaveTextContent('Unable to load business data (500).')

    await user.click(screen.getByRole('button', { name: 'Try again' }))

    expect(await screen.findByRole('heading', { name: 'Company' })).toBeInTheDocument()
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('charts the selected row, showing the channel breakdown when one exists', async () => {
    const user = userEvent.setup()
    renderDashboard()

    expect(await screen.findByRole('heading', { name: 'Company' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Hide Company' })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Expand Branch 1' }))
    await user.click(screen.getByRole('button', { name: 'Show Anna Blackwood in chart' }))

    expect(screen.getByRole('heading', { name: 'Anna Blackwood' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Hide Existing clients' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Hide New organic' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Hide New paid' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Hide Company' })).not.toBeInTheDocument()
  })
})
