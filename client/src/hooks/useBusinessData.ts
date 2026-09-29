import { useQuery } from '@tanstack/react-query'

import { fetchBusiness } from '../api/business'

export function useBusinessData() {
  return useQuery({
    queryKey: ['business'],
    queryFn: ({ signal }) => fetchBusiness(signal),
  })
}
