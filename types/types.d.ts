export interface MinifluxClientOptions {
  baseURL: string
  apiKey?: string
  username?: string
  password?: string
  authType: 'password' | 'api_key'
}
