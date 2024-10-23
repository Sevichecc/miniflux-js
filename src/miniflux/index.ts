import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { HTTPException } from 'hono/http-exception'
import type { StatusCode } from 'hono/utils/http-status'
import type { MinifluxClientOptions } from '../../types/types.d.ts'

const app = new Hono()

class MinifluxClient {
  private baseURL: string
  private apiKey?: string
  private username?: string
  private password?: string
  private authType: 'password' | 'api_key'

  constructor(options: MinifluxClientOptions) {
    if (!options.baseURL) {
      throw new Error('Miniflux base URL is required')
    }

    if (options.authType === 'password') {
      if (!options.username) {
        throw new Error('Miniflux username is required')
      }
      if (!options.password) {
        throw new Error('Miniflux password is required')
      }
    } else {
      if (!options.apiKey) {
        throw new Error('Miniflux API key is required')
      }
    }

    this.baseURL = options.baseURL.endsWith('/') ? options.baseURL : `${options.baseURL}/`
    this.apiKey = options.apiKey
    this.username = options.username
    this.password = options.password
    this.authType = options.authType
  }

  private async fetch(path: string, options: RequestInit = {}): Promise<Response> {
    const url = new URL(path, this.baseURL)
    const headers = new Headers(options.headers)

    if (this.authType === 'api_key' && this.apiKey) {
      headers.set('X-Auth-Token', this.apiKey)
    } else if (this.authType === 'password' && this.username && this.password) {
      headers.set('Authorization', 'Basic ' + btoa(`${this.username}:${this.password}`))
    }

    headers.set('Content-Type', 'application/json')

    const response = await fetch(url.toString(), {
      ...options,
      headers
    })

    if (!response.ok) {
      throw new HTTPException(response.status as StatusCode, { message: await response.text() })
    }

    return response
  }

  async getMe(): Promise<any> {
    const response = await this.fetch('v1/me')
    return response.json()
  }
}

app.get('/', (c) => c.text('Hello Hono!'))

app.get('/me', async (c) => {
  const client = new MinifluxClient({
    baseURL: process.env.MINIFLUX_BASE_URL!,
    apiKey: process.env.MINIFLUX_API_KEY,
    authType: 'api_key'
  })
  const me = await client.getMe()
  return c.json(me)
})

const port = 3000
console.log(`Server is running on port ${port}`)

serve({
  fetch: app.fetch,
  port
})

export default MinifluxClient