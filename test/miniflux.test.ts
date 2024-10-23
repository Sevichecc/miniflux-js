import { describe, it, expect, beforeEach } from 'vitest'
import MinifluxClient from '../src/miniflux'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.test' })

describe('MinifluxClient', () => {
  let client: MinifluxClient

  beforeEach(() => {
    client = new MinifluxClient({
      baseURL: process.env.MINIFLUX_BASE_URL!,
      apiKey: process.env.MINIFLUX_API_KEY,
      authType: 'api_key'
    })
  })

  it('should create a MinifluxClient instance', () => {
    expect(client).toBeInstanceOf(MinifluxClient)
  })

  it('should throw an error if base URL is not provided', () => {
    expect(() => new MinifluxClient({
      baseURL: '',
      authType: 'api_key'
    })).toThrow('Miniflux base URL is required')
  })

  it('should throw an error if API key is not provided for API key auth', () => {
    expect(() => new MinifluxClient({
      baseURL: process.env.MINIFLUX_BASE_URL!,
      authType: 'api_key'
    })).toThrow('Miniflux API key is required')
  })

  it('should throw an error if username or password is not provided for password auth', () => {
    expect(() => new MinifluxClient({
      baseURL: process.env.MINIFLUX_BASE_URL!,
      authType: 'password'
    })).toThrow('Miniflux password is required')
    expect(() => new MinifluxClient({
      baseURL: process.env.MINIFLUX_BASE_URL!,
      authType: 'password'
    })).toThrow('Miniflux username is required')
  })

  it('should get user information', async () => {
    const me = await client.getMe()
    expect(me).toBeDefined()
    expect(me.username).toBe(process.env.MINIFLUX_USERNAME)
  })
})
