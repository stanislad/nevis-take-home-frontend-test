import type { Company } from '../types/business'

export const businessFixture: Company = {
  id: 'company',
  name: 'Company',
  values: [250, 267, 284, 301, 317, 334, 350, 250, 250, 250, 250, 350],
  branches: [
    {
      id: 'branch-1',
      name: 'Branch 1',
      values: [147, 157, 166, 156, 188, 201, 214, 147, 147, 147, 147, 214],
      advisors: [
        {
          id: 'anna',
          name: 'Anna Blackwood',
          values: [25, 26, 28, 31, 32, 34, 38, 27, 27, 27, 27, 38],
          channels: [
            { id: 'existing', name: 'Existing clients', values: [25, 25, 26, 28, 31, 32, 34, 25, 25, 25, 25, 34] },
            { id: 'organic', name: 'New organic', values: [0, 1, 1, 1, 0, 2, 2, 1, 1, 1, 1, 2] },
            { id: 'paid', name: 'New paid', values: [0, 0, 1, 2, 1, 0, 2, 1, 1, 1, 1, 2] },
          ],
        },
        { id: 'james', name: 'James Walker', values: [12, 13, 14, 14, 15, 15, 16, 12, 12, 12, 12, 17] },
      ],
    },
    { id: 'branch-2', name: 'Branch 2', values: [76, 80, 84, 87, 90, 92, 94, 75, 75, 75, 75, 91] },
  ],
}
