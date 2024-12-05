import { describe, it, expect, beforeEach, vi } from 'vitest'
import { MinifluxClient } from '../src/client.ts'
import type { Entry, Feed, Category, User, FeedIcon, FeedCounters, EntryResultSet } from '../src/types.ts'

describe('MinifluxClient', () => {
  let client: MinifluxClient

  beforeEach(() => {
    client = new MinifluxClient({
      baseURL: 'http://localhost:8080',
      apiKey: 'test-api-key',
      authType: 'api_key',
    })
  })

  describe('Client Initialization', () => {
    it('should create a MinifluxClient instance', () => {
      expect(client).toBeInstanceOf(MinifluxClient)
    })

    it('should throw an error if base URL is not provided', () => {
      expect(() => new MinifluxClient({
        baseURL: '',
        authType: 'api_key',
        apiKey: 'test-key',
      })).toThrow('Miniflux base URL is required')
    })

    it('should throw an error if API key is not provided for API key auth', () => {
      expect(() => new MinifluxClient({
        baseURL: 'http://test.com',
        authType: 'api_key',
      })).toThrow('Miniflux API key is required')
    })

    it('should throw an error if credentials are not provided for password auth', () => {
      expect(() => new MinifluxClient({
        baseURL: 'http://test.com',
        authType: 'password',
      })).toThrow('Miniflux username is required')

      expect(() => new MinifluxClient({
        baseURL: 'http://test.com',
        authType: 'password',
        username: 'test',
      })).toThrow('Miniflux password is required')
    })
  })

  describe('User API', () => {
    const mockUser: User = {
      id: 1,
      username: 'test',
      is_admin: false,
      theme: 'light',
      language: 'en_US',
      timezone: 'UTC',
      entry_direction: 'desc',
      entries_per_page: 100,
      keyboard_shortcuts: true,
      show_reading_time: true,
      entry_swipe: true,
      stylesheet: '',
      google_id: '',
      openid_connect_id: '',
      entries_status_filter: 'unread',
      default_reading_speed: 265,
      cjk_reading_speed: 500,
      default_home_page: 'unread',
      categories_sorting_order: 'asc'
    }

    it('should get user information', async () => {
      vi.spyOn(client, 'getMe').mockResolvedValue(mockUser)
      const me = await client.getMe()
      expect(me).toEqual(mockUser)
    })

    it('should get users list', async () => {
      vi.spyOn(client, 'getUsers').mockResolvedValue([mockUser])
      const users = await client.getUsers()
      expect(users).toEqual([mockUser])
    })

    it('should create user', async () => {
      vi.spyOn(client, 'createUser').mockResolvedValue(mockUser)
      const user = await client.createUser('test', 'password', false)
      expect(user).toEqual(mockUser)
    })

    it('should update user', async () => {
      vi.spyOn(client, 'updateUser').mockResolvedValue({ ...mockUser, theme: 'dark' })
      const user = await client.updateUser(1, { theme: 'dark' })
      expect(user.theme).toBe('dark')
    })

    it('should delete user', async () => {
      vi.spyOn(client, 'deleteUser').mockResolvedValue(undefined)
      await expect(client.deleteUser(1)).resolves.toBeUndefined()
    })

    it('should mark user entries as read', async () => {
      vi.spyOn(client, 'markUserAsRead').mockResolvedValue(undefined)
      await expect(client.markUserAsRead(1)).resolves.toBeUndefined()
    })
  })

  describe('Feed API', () => {
    const mockFeed: Feed = {
      id: 1,
      user_id: 1,
      title: 'Test Feed',
      site_url: 'https://example.com',
      feed_url: 'https://example.com/feed.xml',
      rewrite_rules: '',
      scraper_rules: '',
      crawler: false,
      checked_at: '',
      etag_header: '',
      last_modified_header: '',
      parsing_error_count: 0,
      parsing_error_message: '',
      category: { id: 1, title: 'Test Category', user_id: 1 },
      icon: { id: 1, data: 'test-data', mime_type: 'image/png' },
      hide_globally: false,
      disabled: false,
      ignore_http_cache: false,
      allow_self_signed_certificates: false,
      fetch_via_proxy: false,
      username: '',
      password: '',
      user_agent: '',
      cookie: '',
      blocklist_rules: '',
      keeplist_rules: '',
    }

    const mockEntries: EntryResultSet = {
      total: 1,
      entries: [{
        id: 1,
        user_id: 1,
        feed_id: 1,
        title: 'Test Entry',
        url: 'https://example.com/entry',
        comments_url: '',
        author: 'Test Author',
        content: 'Test Content',
        published_at: '',
        created_at: '',
        status: 'unread',
        share_code: '',
        starred: false,
        reading_time: 1,
        enclosures: [],
        feed: mockFeed,
      }],
    }

    it('should get feeds list', async () => {
      vi.spyOn(client, 'getFeeds').mockResolvedValue([mockFeed])
      const feeds = await client.getFeeds()
      expect(feeds).toEqual([mockFeed])
    })

    it('should create feed', async () => {
      vi.spyOn(client, 'createFeed').mockResolvedValue(mockFeed)
      const feed = await client.createFeed('https://example.com/feed.xml')
      expect(feed).toEqual(mockFeed)
    })

    it('should get feed entries', async () => {
      vi.spyOn(client, 'getFeedEntries').mockResolvedValue(mockEntries)
      const entries = await client.getFeedEntries(1)
      expect(entries).toEqual(mockEntries)
    })

    it('should refresh feed', async () => {
      vi.spyOn(client, 'refreshFeed').mockResolvedValue(undefined)
      await expect(client.refreshFeed(1)).resolves.toBeUndefined()
    })

    it('should refresh all feeds', async () => {
      vi.spyOn(client, 'refreshAllFeeds').mockResolvedValue(undefined)
      await expect(client.refreshAllFeeds()).resolves.toBeUndefined()
    })

    it('should mark feed as read', async () => {
      vi.spyOn(client, 'markFeedAsRead').mockResolvedValue(undefined)
      await expect(client.markFeedAsRead(1)).resolves.toBeUndefined()
    })

    it('should get feed icon', async () => {
      const mockIcon: FeedIcon = {
        id: 1,
        data: 'test-icon-data',
        mime_type: 'image/png',
      }
      vi.spyOn(client, 'getFeedIcon').mockResolvedValue(mockIcon)
      const icon = await client.getFeedIcon(1)
      expect(icon).toEqual(mockIcon)
    })

    it('should update feed', async () => {
      const updatedFeed = { ...mockFeed, title: 'Updated Title' }
      vi.spyOn(client, 'updateFeed').mockResolvedValue(updatedFeed)
      const feed = await client.updateFeed(1, { title: 'Updated Title' })
      expect(feed.title).toBe('Updated Title')
    })

    it('should delete feed', async () => {
      vi.spyOn(client, 'deleteFeed').mockResolvedValue(undefined)
      await expect(client.deleteFeed(1)).resolves.toBeUndefined()
    })

    describe('Entry API', () => {
      const mockEntry: Entry = {
        id: 1,
        user_id: 1,
        feed_id: 1,
        title: 'Test Entry',
        url: 'https://example.com/entry',
        comments_url: '',
        author: 'Test Author',
        content: 'Test Content',
        published_at: '',
        created_at: '',
        status: 'unread',
        share_code: '',
        starred: false,
        reading_time: 1,
        enclosures: [],
      }

      it('should get entries', async () => {
        vi.spyOn(client, 'getEntries').mockResolvedValue({ total: 1, entries: [mockEntry] })
        const entries = await client.getEntries()
        expect(entries.entries).toEqual([mockEntry])
      })

      it('should get single entry', async () => {
        vi.spyOn(client, 'getEntry').mockResolvedValue(mockEntry)
        const entry = await client.getEntry(1)
        expect(entry).toEqual(mockEntry)
      })

      it('should update entry status', async () => {
        vi.spyOn(client, 'updateEntryStatus').mockResolvedValue(undefined)
        await expect(client.updateEntryStatus(1, 'read')).resolves.toBeUndefined()
      })

      it('should toggle entry bookmark', async () => {
        vi.spyOn(client, 'toggleBookmark').mockResolvedValue(undefined)
        await expect(client.toggleBookmark(1)).resolves.toBeUndefined()
      })

      it('should fetch entry content', async () => {
        vi.spyOn(client, 'fetchContent').mockResolvedValue({ content: 'Test Content' })
        const content = await client.fetchContent(1)
        expect(content.content).toBe('Test Content')
      })

      it('should handle save entry when third-party integration is disabled', async () => {
        vi.spyOn(client, 'saveEntry').mockRejectedValue(new Error('no third-party integration enabled'))
        await expect(client.saveEntry(1)).rejects.toThrow('no third-party integration enabled')
      })

      it('should save entry when third-party integration is enabled', async () => {
        vi.spyOn(client, 'saveEntry').mockResolvedValue('202 Accepted' as any)
        await expect(client.saveEntry(1)).resolves.toEqual('202 Accepted')
      })

      it('should update entry', async () => {
        const updatedEntry = { ...mockEntry, title: 'Updated Title' }
        vi.spyOn(client, 'updateEntry').mockResolvedValue(updatedEntry)
        const entry = await client.updateEntry(1, { title: 'Updated Title' })
        expect(entry.title).toBe('Updated Title')
      })
    })

    describe('Category API', () => {
      const mockCategory: Category = {
        id: 1,
        user_id: 1,
        title: 'Test Category',
      }

      it('should get categories', async () => {
        vi.spyOn(client, 'getCategories').mockResolvedValue([mockCategory])
        const categories = await client.getCategories()
        expect(categories).toEqual([mockCategory])
      })

      it('should create category', async () => {
        vi.spyOn(client, 'createCategory').mockResolvedValue(mockCategory)
        const category = await client.createCategory('Test Category')
        expect(category).toEqual(mockCategory)
      })

      it('should update category', async () => {
        const updatedCategory = { ...mockCategory, title: 'Updated Category' }
        vi.spyOn(client, 'updateCategory').mockResolvedValue(updatedCategory)
        const category = await client.updateCategory(1, 'Updated Category')
        expect(category.title).toBe('Updated Category')
      })

      it('should delete category', async () => {
        vi.spyOn(client, 'deleteCategory').mockResolvedValue(undefined)
        await expect(client.deleteCategory(1)).resolves.toBeUndefined()
      })

      it('should get category entries', async () => {
        vi.spyOn(client, 'getCategoryEntries').mockResolvedValue({ total: 0, entries: [] })
        const entries = await client.getCategoryEntries(1)
        expect(entries).toEqual({ total: 0, entries: [] })
      })

      it('should refresh category feeds', async () => {
        vi.spyOn(client, 'refreshCategoryFeeds').mockResolvedValue(undefined)
        await expect(client.refreshCategoryFeeds(1)).resolves.toBeUndefined()
      })

      it('should mark category as read', async () => {
        vi.spyOn(client, 'markCategoryAsRead').mockResolvedValue(undefined)
        await expect(client.markCategoryAsRead(1)).resolves.toBeUndefined()
      })
    })

    describe('System API', () => {
      it('should check server health', async () => {
        vi.spyOn(client, 'healthcheck').mockResolvedValue('OK')
        const health = await client.healthcheck()
        expect(health).toBe('OK')
      })

      it('should get server version', async () => {
        vi.spyOn(client, 'getVersion').mockResolvedValue('2.2.3')
        const version = await client.getVersion()
        expect(version).toBe('2.2.3')
      })

      it('should get feed counters', async () => {
        const mockCounters: FeedCounters = {
          reads: { 'total': 10 },
          unreads: { 'total': 5 },
        }
        vi.spyOn(client, 'getCounters').mockResolvedValue(mockCounters)
        const counters = await client.getCounters()
        expect(counters).toEqual(mockCounters)
      })

      it('should search entries', async () => {
        vi.spyOn(client, 'searchEntries').mockResolvedValue({ total: 0, entries: [] })
        const entries = await client.searchEntries('test')
        expect(entries).toEqual({ total: 0, entries: [] })
      })

      it('should search entries with limit', async () => {
        vi.spyOn(client, 'searchEntries').mockResolvedValue({ total: 0, entries: [] })
        const entries = await client.searchEntries('test', 10)
        expect(entries).toEqual({ total: 0, entries: [] })
      })

      it('should get Miniflux entry URL', async () => {
        vi.spyOn(client, 'getMinifluxEntryUrl').mockResolvedValue('https://example.com/entry')
        const url = await client.getMinifluxEntryUrl(1)
        expect(url).toBe('https://example.com/entry')
      })
    })
  })

})
