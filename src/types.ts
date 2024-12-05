export interface MinifluxConfig {
  baseURL: string
  apiKey?: string
  username?: string
  password?: string
  authType?: 'api_key' | 'password'
}

export interface Feed {
  id: number
  user_id: number
  title: string
  site_url: string
  feed_url: string
  category?: Category
  icon?: FeedIcon
  etag_header?: string
  last_modified_header?: string
  crawler?: boolean
  checked_at?: string
  parsing_error_count?: number
  parsing_error_message?: string
  scraper_rules?: string
  rewrite_rules?: string
  blocklist_rules?: string
  keeplist_rules?: string
  user_agent?: string
  cookie?: string
  username?: string
  password?: string
  disabled?: boolean
  ignore_http_cache?: boolean
  allow_self_signed_certificates?: boolean
  fetch_via_proxy?: boolean
  hide_globally?: boolean
}

export interface Category {
  id: number
  user_id: number
  title: string
  hide_globally?: boolean
}

export interface Entry {
  id: number
  user_id: number
  feed_id: number
  status: 'unread' | 'read' | 'removed'
  title: string
  url: string
  comments_url?: string
  published_at: string
  created_at: string
  changed_at?: string
  content?: string
  author?: string
  share_code?: string
  starred?: boolean
  reading_time?: number
  enclosures?: Enclosure[]
  feed?: Feed
  category?: Category
  tags?: string[]
}

export interface FeedIcon {
  id: number
  data: string
  mime_type: string
}

export interface Enclosure {
  id: number
  user_id: number
  entry_id: number
  url: string
  mime_type: string
  size: number
  media_progression: number
}

export interface Filter {
  status?: ('read' | 'unread' | 'removed')[]
  offset?: number
  limit?: number
  order?: 'id' | 'status' | 'published_at' | 'category_title' | 'category_id'
  direction?: 'asc' | 'desc'
  before?: number
  after?: number
  published_before?: number
  published_after?: number
  changed_before?: number
  changed_after?: number
  before_entry_id?: number
  after_entry_id?: number
  starred?: boolean
  search?: string
  category_id?: number
}

export interface EntryResultSet {
  total: number
  entries: Entry[]
}

export interface User {
  id: number
  username: string
  is_admin: boolean
  theme: string
  language: string
  timezone: string
  entry_direction: string
  entries_per_page: number
  keyboard_shortcuts: boolean
  show_reading_time: boolean
  entry_swipe: boolean
  stylesheet: string
  google_id?: string
  openid_connect_id?: string
  entries_status_filter: string
  default_reading_speed: number
  cjk_reading_speed: number
  default_home_page: string
  categories_sorting_order: string
}

export interface FeedCounters {
  reads: { [key: string]: number }
  unreads: { [key: string]: number }
}

export interface EntryUpdatePayload {
  title?: string
  content?: string
}

export interface EntryStatus {
  status: 'read' | 'unread'
}
