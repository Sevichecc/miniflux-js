import { describe, it, expect, beforeEach } from 'vitest'
import { MinifluxClient } from '../src/client.ts'
import type { Feed, Category, User, FeedIcon, EntryResultSet } from '../src/types.ts'
import dotenv from 'dotenv'

dotenv.config()

describe('MinifluxClient Integration Tests', () => {
  let client: MinifluxClient
  let isAdmin: boolean

  beforeEach(async () => {
    client = new MinifluxClient({
      baseURL: process.env.MINIFLUX_BASE_URL!,
      apiKey: process.env.MINIFLUX_API_KEY!,
      authType: 'api_key',
    })

    const me = await client.getMe()
    isAdmin = me.is_admin
  })

  beforeEach(() => {
    client = new MinifluxClient({
      baseURL: process.env.MINIFLUX_BASE_URL!,
      apiKey: process.env.MINIFLUX_API_KEY!,
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
        baseURL: process.env.MINIFLUX_BASE_URL!,
        authType: 'api_key',
      })).toThrow('Miniflux API key is required')
    })

    it('should throw an error if credentials are not provided for password auth', () => {
      expect(() => new MinifluxClient({
        baseURL: process.env.MINIFLUX_BASE_URL!,
        authType: 'password',
      })).toThrow('Miniflux username is required')

      expect(() => new MinifluxClient({
        baseURL: process.env.MINIFLUX_BASE_URL!,
        authType: 'password',
        username: 'test',
      })).toThrow('Miniflux password is required')
    })
  })

  describe('System API', () => {
    it('should check server health', async () => {
      const health = await client.healthcheck()
      console.log(health)
      expect(health).toBe('OK')
    })

    it('should get server version', async () => {
      const version = await client.getVersion()
      expect(version).toBeDefined()
    })

    it('should get feed counters', async () => {
      const counters = await client.getCounters()
      expect(counters).toHaveProperty('reads')
      expect(counters).toHaveProperty('unreads')
    })
  })

  describe.runIf(() => isAdmin)('Admin API (Admin Only)', () => {
    it('should get users list', async () => {
      const users = await client.getUsers()
      expect(Array.isArray(users)).toBe(true)
    })

    it('should create and delete user', async () => {
      const user = await client.createUser('test-user', 'test-password', false)
      expect(user).toHaveProperty('id')
      expect(user.username).toBe('test-user')
      expect(user.is_admin).toBe(false)

      await expect(client.deleteUser(user.id)).resolves.toBeUndefined()
    })

    it('should update user', async () => {
      const user = await client.createUser('test-update-user', 'test-password', false)

      const updatedUser = await client.updateUser(user.id, {
        theme: 'dark',
        language: 'zh_CN'
      })

      expect(updatedUser.theme).toBe('dark')
      expect(updatedUser.language).toBe('zh_CN')

      await client.deleteUser(user.id)
    })

    it('should mark user entries as read', async () => {
      const user = await client.createUser('test-mark-read', 'test-password', false)
      await expect(client.markUserAsRead(user.id)).resolves.toBeUndefined()

      await client.deleteUser(user.id)
    })
  })

  describe.runIf(() => !isAdmin)('Admin API (Non-Admin)', () => {
    it('should fail to access admin endpoints', async () => {
      await expect(client.getUsers()).rejects.toThrow()
      await expect(client.createUser('test', 'password', false)).rejects.toThrow()
      await expect(client.markUserAsRead(1)).rejects.toThrow()
    })
  })

  describe('Feed API', () => {
    let testFeed: Feed

    it('should get feeds list', async () => {
      const feeds = await client.getFeeds()
      expect(Array.isArray(feeds)).toBe(true)
    })

    it('should create and delete feed', async () => {
      // Create feed
      testFeed = await client.createFeed('https://blog.rust-lang.org/feed.xml')
      expect(testFeed).toHaveProperty('id')
      expect(testFeed.feed_url).toBe('https://blog.rust-lang.org/feed.xml')

      // Delete feed
      await expect(client.deleteFeed(testFeed.id)).resolves.toBeUndefined()
    })

    it('should get feed entries', async () => {
      const feeds = await client.getFeeds()
      if (feeds.length > 0) {
        const entries = await client.getFeedEntries(feeds[0].id)
        expect(entries).toHaveProperty('total')
        expect(entries).toHaveProperty('entries')
      }
    })

    it('should refresh feed', async () => {
      const feeds = await client.getFeeds()
      if (feeds.length > 0) {
        await expect(client.refreshFeed(feeds[0].id)).resolves.toBeUndefined()
      }
    })

    it('should refresh all feeds', async () => {
      await expect(client.refreshAllFeeds()).resolves.toBeUndefined()
    })

    it('should mark feed as read', async () => {
      const feeds = await client.getFeeds()
      if (feeds.length > 0) {
        await expect(client.markFeedAsRead(feeds[0].id)).resolves.toBeUndefined()
      }
    })

    it('should get feed icon', async () => {
      const feeds = await client.getFeeds()

      console.log(feeds)
      if (feeds.length > 0) {
        const icon = await client.getFeedIcon(feeds[0].id)
        expect(icon).toHaveProperty('id')
        expect(icon).toHaveProperty('data')
        expect(icon).toHaveProperty('mime_type')
      }
    })

    it('should update feed', async () => {
      const feeds = await client.getFeeds()
      if (feeds.length > 0) {
        const updatedFeed = await client.updateFeed(feeds[0].id, { title: 'Updated Title' })
        expect(updatedFeed.title).toBe('Updated Title')
      }
    })
  })

  describe('Entry API', () => {
    it('should get entries', async () => {
      const entries = await client.getEntries()
      expect(entries).toHaveProperty('total')
      expect(entries).toHaveProperty('entries')
      expect(Array.isArray(entries.entries)).toBe(true)
    })

    it('should get entries with filter', async () => {
      const entries = await client.getEntries({
        status: ['unread'],
        limit: 10
      })
      expect(entries).toHaveProperty('total')
      expect(entries).toHaveProperty('entries')
      expect(Array.isArray(entries.entries)).toBe(true)
    })

    it('should get single entry', async () => {
      const entries = await client.getEntries()
      if (entries.entries.length > 0) {
        const entry = await client.getEntry(entries.entries[0].id)
        expect(entry).toHaveProperty('id')
        expect(entry).toHaveProperty('user_id')
        expect(entry).toHaveProperty('feed_id')
        expect(entry).toHaveProperty('title')
        expect(entry).toHaveProperty('url')
        expect(entry).toHaveProperty('comments_url')
        expect(entry).toHaveProperty('author')
        expect(entry).toHaveProperty('content')
        expect(entry).toHaveProperty('published_at')
        expect(entry).toHaveProperty('created_at')
        expect(entry).toHaveProperty('status')
        expect(entry).toHaveProperty('share_code')
        expect(entry).toHaveProperty('starred')
        expect(entry).toHaveProperty('reading_time')
        expect(entry).toHaveProperty('enclosures')
      }
    })

    it('should update entry status', async () => {
      const entries = await client.getEntries()
      if (entries.entries.length > 0) {
        await expect(client.updateEntryStatus(entries.entries[0].id, 'read')).resolves.toBeUndefined()
      }
    })

    it('should toggle entry bookmark', async () => {
      const entries = await client.getEntries()
      if (entries.entries.length > 0) {
        await expect(client.toggleBookmark(entries.entries[0].id)).resolves.toBeUndefined()
      }
    })

    it('should fetch entry content', async () => {
      const entries = await client.getEntries()
      if (entries.entries.length > 0) {
        const content = await client.fetchContent(entries.entries[0].id)
        expect(content).toHaveProperty('content')
      }
    })

    it('should handle save entry when third-party integration is disabled', async () => {
      const entries = await client.getEntries()
      if (entries.entries.length > 0) {
        await expect(client.saveEntry(entries.entries[0].id)).rejects.toThrow('no third-party integration enabled')
      }
    })

    it('should save entry when third-party integration is enabled', async () => {
      const entries = await client.getEntries()
      if (entries.entries.length > 0) {
        await expect(client.saveEntry(entries.entries[0].id)).resolves.toEqual('202 Accepted')
      }
    })

    it('should update entry', async () => {
      const entries = await client.getEntries()
      if (entries.entries.length > 0) {
        const updatedEntry = await client.updateEntry(entries.entries[0].id, { title: 'Updated Title' })
        expect(updatedEntry.title).toBe('Updated Title')
      }
    })

  })

  describe('Category API', () => {
    it('should get categories', async () => {
      const categories = await client.getCategories()
      expect(Array.isArray(categories)).toBe(true)
    })

    it('should create category', async () => {
      const category = await client.createCategory('Test Category')
      expect(category).toHaveProperty('id')
      expect(category).toHaveProperty('user_id')
      expect(category).toHaveProperty('title')

      await client.deleteCategory(category.id)
    })

    it('should update category', async () => {
      const categories = await client.getCategories()
      if (categories.length > 0) {
        const updatedCategory = await client.updateCategory(categories[0].id, 'Updated Category')
        expect(updatedCategory.title).toBe('Updated Category')
      }
    })

    it('should delete category', async () => {
      const category = await client.createCategory('Test Category - delete')
      await expect(client.deleteCategory(category.id)).resolves.toBeUndefined()
    })

    it('should get category entries', async () => {
      const categories = await client.getCategories()
      if (categories.length > 0) {
        const entries = await client.getCategoryEntries(categories[0].id)
        expect(entries).toHaveProperty('total')
        expect(entries).toHaveProperty('entries')
      }
    })

    it('should refresh category feeds', async () => {
      const categories = await client.getCategories()
      if (categories.length > 0) {
        await expect(client.refreshCategoryFeeds(categories[0].id)).resolves.toBeUndefined()
      }
    })

    it('should mark category as read', async () => {
      const categories = await client.getCategories()
      if (categories.length > 0) {
        await expect(client.markCategoryAsRead(categories[0].id)).resolves.toBeUndefined()
      }
    })
  })
})
