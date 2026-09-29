import type { Advisor, Branch, Channel, Company, MonthlyValues } from '../types/business'

const API_URL = '/api/client-counts'

function asRecord(value: unknown): Record<string, unknown> {
  if (typeof value !== 'object' || value === null) {
    throw new Error('The business response was not an object.')
  }

  return value as Record<string, unknown>
}

function readText(record: Record<string, unknown>, key: string): string {
  const value = record[key]
  if (typeof value !== 'string') {
    throw new Error(`The business response has an invalid ${key}.`)
  }

  return value
}

function readValues(record: Record<string, unknown>): MonthlyValues {
  const values = record.values
  if (!Array.isArray(values) || values.length !== 12 || values.some((value) => typeof value !== 'number')) {
    throw new Error('Every business item must contain 12 numeric monthly values.')
  }

  return values
}

function readChannel(value: unknown): Channel {
  const record = asRecord(value)
  return { id: readText(record, 'id'), name: readText(record, 'name'), values: readValues(record) }
}

function readAdvisor(value: unknown): Advisor {
  const record = asRecord(value)
  const channels = record.channels

  return {
    id: readText(record, 'id'),
    name: readText(record, 'name'),
    values: readValues(record),
    ...(channels === undefined ? {} : { channels: readArray(channels, readChannel) }),
  }
}

function readBranch(value: unknown): Branch {
  const record = asRecord(value)
  const advisors = record.advisors

  return {
    id: readText(record, 'id'),
    name: readText(record, 'name'),
    values: readValues(record),
    ...(advisors === undefined ? {} : { advisors: readArray(advisors, readAdvisor) }),
  }
}

function readArray<T>(value: unknown, itemReader: (item: unknown) => T): readonly T[] {
  if (!Array.isArray(value)) {
    throw new Error('The business response contains an invalid collection.')
  }

  return value.map(itemReader)
}

function readCompany(value: unknown): Company {
  const record = asRecord(value)
  return {
    id: readText(record, 'id'),
    name: readText(record, 'name'),
    values: readValues(record),
    branches: readArray(record.branches, readBranch),
  }
}

// Dev-only: forwards ?delay= and ?fail from the page URL so the API can simulate loading and error states.
function demoQuery(): string {
  if (!import.meta.env.DEV) return ''

  const page = new URLSearchParams(window.location.search)
  const query = new URLSearchParams()
  for (const key of ['delay', 'fail']) {
    const value = page.get(key)
    if (value !== null) query.set(key, value)
  }

  const text = query.toString()
  return text ? `?${text}` : ''
}

export async function fetchBusiness(signal?: AbortSignal): Promise<Company> {
  const response = await fetch(`${API_URL}${demoQuery()}`, { signal })
  if (!response.ok) {
    throw new Error(`Unable to load business data (${response.status}).`)
  }

  return readCompany(await response.json())
}
