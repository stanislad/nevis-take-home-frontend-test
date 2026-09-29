import express from 'express'

import { business } from './data/business.js'

const app = express()
const port = Number(process.env.PORT ?? 3001)
const demoFlagsEnabled = process.env.NODE_ENV !== 'production'
const MAX_DEMO_DELAY_MS = 10_000

// ?delay=<ms> and ?fail make the UI's loading and error states reviewable without code changes.
app.get('/api/client-counts', async (request, response) => {
  if (demoFlagsEnabled) {
    const delay = Math.min(Number(request.query.delay) || 0, MAX_DEMO_DELAY_MS)
    if (delay > 0) await new Promise((resolve) => setTimeout(resolve, delay))

    if (request.query.fail !== undefined) {
      response.status(500).json({ message: 'Simulated failure' })
      return
    }
  }

  response.json(business)
})

app.use((_request, response) => {
  response.status(404).json({ message: 'Not found' })
})

app.listen(port, () => {
  console.log(`Business API listening on http://localhost:${port}`)
})
