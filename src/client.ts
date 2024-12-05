import type {
  MinifluxConfig,
  Feed,
  Category,
  Entry,
  Filter,
  EntryResultSet,
  FeedIcon,
  Enclosure,
  User,
  FeedCounters,
  EntryUpdatePayload,
  EntryStatus,
} from './types.ts'

/**
 * MinifluxClient provides a TypeScript interface to interact with the Miniflux RSS reader API.
 * It supports both API key and password authentication methods.
 */
export class MinifluxClient {
  private baseUrl: string
  private apiKey?: string
  private username?: string
  private password?: string
  private headers: Headers

  /**
   * Creates a new MinifluxClient instance.
   * @param config - Configuration object for the client
   * @throws {Error} When required authentication parameters are missing
   */
  constructor(config: MinifluxConfig) {
    if (!config.baseURL) {
      throw new Error('Miniflux base URL is required')
    }

    if (config.authType === 'api_key' && !config.apiKey) {
      throw new Error('Miniflux API key is required')
    }

    if (config.authType === 'password') {
      if (!config.username) {
        throw new Error('Miniflux username is required')
      }
      if (!config.password) {
        throw new Error('Miniflux password is required')
      }
    }

    this.baseUrl = config.baseURL.replace(/\/$/, '')
    this.apiKey = config.apiKey
    this.username = config.username
    this.password = config.password

    // Initialize headers
    this.headers = new Headers({
      'User-Agent': 'Miniflux JS Client',
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    })

    // Add authentication
    if (config.authType === 'api_key' && config.apiKey) {
      this.headers.set('X-Auth-Token', config.apiKey)
    } else if (config.authType === 'password' && config.username && config.password) {
      this.headers.set('Authorization', `Basic ${btoa(`${config.username}:${config.password}`)}`)
    }
  }

  /**
   * Makes an HTTP request to the Miniflux API.
   * @param path - API endpoint path
   * @param options - Fetch API options
   * @returns Promise resolving to the response data
   * @throws {Error} On API error responses
   */
  private async request<T>(path: string, options: RequestInit = {}, isJson = true): Promise<T> {
    const url = this.baseUrl + path
    const response = await fetch(url, {
      ...options,
      headers: this.headers,
    })

    // Handle successful responses
    if (response.status === 204) {
      return {} as T
    }

    if (response.status === 201 || response.status === 200) {
      return isJson ? response.json() : response.text()
    }

    if (!response.ok) {
      const text = await response.text()
      // Handle error responses
      let errorMessage: string
      try {
        const errorData = JSON.parse(text)
        errorMessage = errorData.error_message || 'Unknown error'
      } catch {
        errorMessage = text || 'Failed to parse error response'
      }
      throw new Error(`${errorMessage}`)
    }

    return {} as T
  }

  // Feed Methods

  /**
   * Retrieves all feeds.
   * @returns Promise resolving to an array of feeds
   */
  async getFeeds(): Promise<Feed[]> {
    return this.request<Feed[]>('/v1/feeds')
  }

  /**
   * Retrieves a specific feed by ID.
   * @param feedId - ID of the feed to retrieve
   * @returns Promise resolving to the feed details
   */
  async getFeed(feedId: number): Promise<Feed> {
    return this.request<Feed>(`/v1/feeds/${feedId}`)
  }

  /**
   * Creates a new feed.
   * @param feedUrl - URL of the feed to create
   * @param categoryId - Optional category ID to assign the feed to
   * @returns Promise resolving to the created feed
   */
  async createFeed(feedUrl: string, categoryId?: number): Promise<Feed> {
    return this.request<Feed>('/v1/feeds', {
      method: 'POST',
      body: JSON.stringify({
        feed_url: feedUrl,
        category_id: categoryId,
      }),
    })
  }

  /**
   * Deletes a feed.
   * @param feedId - ID of the feed to delete
   */
  async deleteFeed(feedId: number): Promise<void> {
    await this.request(`/v1/feeds/${feedId}`, { method: 'DELETE' })
  }

  /**
   * Refreshes a specific feed.
   * @param feedId - ID of the feed to refresh
   */
  async refreshFeed(feedId: number): Promise<void> {
    await this.request(`/v1/feeds/${feedId}/refresh`, { method: 'PUT' })
  }

  /**
   * Retrieves the icon for a feed.
   * @param feedId - ID of the feed
   * @returns Promise resolving to the feed icon data
   */
  async getFeedIcon(feedId: number): Promise<FeedIcon> {
    return this.request(`/v1/feeds/${feedId}/icon`)
  }

  /**
   * Retrieves entries for a specific feed.
   * @param feedId - ID of the feed
   * @param filter - Optional filter parameters
   * @returns Promise resolving to the filtered entries
   */
  async getFeedEntries(feedId: number, filter?: Filter): Promise<EntryResultSet> {
    const params = new URLSearchParams()
    if (filter) {
      Object.entries(filter).forEach(([key, value]) => {
        if (value !== undefined) {
          if (Array.isArray(value)) {
            value.forEach(v => params.append(key, v.toString()))
          } else {
            params.append(key, value.toString())
          }
        }
      })
    }
    const query = params.toString()
    return this.request(`/v1/feeds/${feedId}/entries${query ? `?${query}` : ''}`)
  }

  /**
   * Refreshes all feeds.
   */
  async refreshAllFeeds(): Promise<void> {
    await this.request('/v1/feeds/refresh', { method: 'PUT' })
  }

  /**
   * Marks all entries in a feed as read.
   * @param feedId - ID of the feed
   */
  async markFeedAsRead(feedId: number): Promise<void> {
    await this.request(`/v1/feeds/${feedId}/mark-all-as-read`, { method: 'PUT' })
  }

  /**
   * Updates a feed.
   * @param feedId - ID of the feed to update
   * @param changes - Partial feed object containing the changes
   * @returns Promise resolving to the updated feed
   */
  async updateFeed(feedId: number, changes: Partial<Feed>): Promise<Feed> {
    return this.request<Feed>(`/v1/feeds/${feedId}`, {
      method: 'PUT',
      body: JSON.stringify(changes),
    })
  }

  // Entry Methods

  /**
   * Retrieves entries based on filter criteria.
   * @param filter - Optional filter parameters
   * @returns Promise resolving to the filtered entries
   */
  async getEntries(filter?: Filter): Promise<EntryResultSet> {
    const params = new URLSearchParams()
    if (filter) {
      Object.entries(filter).forEach(([key, value]) => {
        if (value !== undefined) {
          if (Array.isArray(value)) {
            value.forEach(v => params.append(key, v.toString()))
          } else {
            params.append(key, value.toString())
          }
        }
      })
    }
    const query = params.toString()
    return this.request<EntryResultSet>(`/v1/entries${query ? `?${query}` : ''}`)
  }

  /**
   * Retrieves a specific entry.
   * @param entryId - ID of the entry to retrieve
   * @returns Promise resolving to the entry details
   */
  async getEntry(entryId: number): Promise<Entry> {
    return this.request<Entry>(`/v1/entries/${entryId}`)
  }

  /**
   * Updates the status of an entry.
   * @param entryId - ID of the entry
   * @param status - New status ('read' or 'unread')
   */
  async updateEntryStatus(entryId: number, status: 'read' | 'unread'): Promise<void> {
    await this.request(`/v1/entries/${entryId}`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    })
  }

  /**
   * Toggles the bookmark status of an entry.
   * @param entryId - ID of the entry
   */
  async toggleBookmark(entryId: number): Promise<void> {
    await this.request(`/v1/entries/${entryId}/bookmark`, { method: 'PUT' })
  }

  /**
   * Fetches the original content of an entry.
   * @param entryId - ID of the entry
   * @returns Promise resolving to the entry content
   */
  async fetchContent(entryId: number): Promise<{ content: string }> {
    return this.request(`/v1/entries/${entryId}/fetch-content`)
  }

  /**
   * Saves an entry to third-party services.
   * @param entryId - ID of the entry
   */
  async saveEntry(entryId: number): Promise<void> {
    await this.request(`/v1/entries/${entryId}/save`, { method: 'POST' })
  }

  /**
   * Updates an entry's content.
   * @param entryId - ID of the entry
   * @param payload - Update payload containing title and/or content
   * @returns Promise resolving to the updated entry
   */
  async updateEntry(entryId: number, payload: EntryUpdatePayload): Promise<Entry> {
    return this.request(`/v1/entries/${entryId}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    })
  }

  // Category Methods

  /**
   * Retrieves all categories.
   * @returns Promise resolving to an array of categories
   */
  async getCategories(): Promise<Category[]> {
    return this.request<Category[]>('/v1/categories')
  }

  /**
   * Creates a new category.
   * @param title - Title of the category
   * @returns Promise resolving to the created category
   */
  async createCategory(title: string): Promise<Category> {
    return this.request<Category>('/v1/categories', {
      method: 'POST',
      body: JSON.stringify({ title }),
    })
  }

  /**
   * Updates a category.
   * @param categoryId - ID of the category
   * @param title - New title for the category
   * @returns Promise resolving to the updated category
   */
  async updateCategory(categoryId: number, title: string): Promise<Category> {
    return this.request<Category>(`/v1/categories/${categoryId}`, {
      method: 'PUT',
      body: JSON.stringify({ title }),
    })
  }

  /**
   * Deletes a category.
   * @param categoryId - ID of the category to delete
   */
  async deleteCategory(categoryId: number): Promise<void> {
    await this.request(`/v1/categories/${categoryId}`, { method: 'DELETE' })
  }

  /**
   * Refreshes all feeds in a category.
   * @param categoryId - ID of the category
   */
  async refreshCategoryFeeds(categoryId: number): Promise<void> {
    await this.request(`/v1/categories/${categoryId}/refresh`, { method: 'PUT' })
  }

  /**
   * Retrieves entries for a specific category.
   * @param categoryId - ID of the category
   * @param filter - Optional filter parameters
   * @returns Promise resolving to the filtered entries
   */
  async getCategoryEntries(categoryId: number, filter?: Filter): Promise<EntryResultSet> {
    const params = new URLSearchParams()
    if (filter) {
      Object.entries(filter).forEach(([key, value]) => {
        if (value !== undefined) {
          if (Array.isArray(value)) {
            value.forEach(v => params.append(key, v.toString()))
          } else {
            params.append(key, value.toString())
          }
        }
      })
    }
    const query = params.toString()
    return this.request(`/v1/categories/${categoryId}/entries${query ? `?${query}` : ''}`)
  }

  /**
   * Marks all entries in a category as read.
   * @param categoryId - ID of the category
   */
  async markCategoryAsRead(categoryId: number): Promise<void> {
    await this.request(`/v1/categories/${categoryId}/mark-all-as-read`, { method: 'PUT' })
  }

  // Enclosure Methods

  /**
   * Retrieves an enclosure.
   * @param enclosureId - ID of the enclosure
   * @returns Promise resolving to the enclosure details
   */
  async getEnclosure(enclosureId: number): Promise<Enclosure> {
    return this.request(`/v1/enclosures/${enclosureId}`)
  }

  /**
   * Updates an enclosure's media progression.
   * @param enclosureId - ID of the enclosure
   * @param mediaProgression - New media progression value
   */
  async updateEnclosure(enclosureId: number, mediaProgression: number): Promise<void> {
    await this.request(`/v1/enclosures/${enclosureId}`, {
      method: 'PUT',
      body: JSON.stringify({ media_progression: mediaProgression }),
    })
  }

  // User Methods

  /**
   * Retrieves the current user's information.
   * @returns Promise resolving to the user details
   */
  async getMe(): Promise<User> {
    return this.request<User>('/v1/me')
  }

  /**
   * Retrieves all users (admin only).
   * @returns Promise resolving to an array of users
   */
  async getUsers(): Promise<User[]> {
    return this.request<User[]>('/v1/users')
  }

  /**
   * Retrieves a specific user.
   * @param userId - ID of the user
   * @returns Promise resolving to the user details
   */
  async getUser(userId: number): Promise<User> {
    return this.request<User>(`/v1/users/${userId}`)
  }

  /**
   * Creates a new user (admin only).
   * @param username - Username for the new user
   * @param password - Password for the new user
   * @param isAdmin - Whether the new user should have admin privileges
   * @returns Promise resolving to the created user
   */
  async createUser(username: string, password: string, isAdmin: boolean): Promise<User> {
    return this.request<User>('/v1/users', {
      method: 'POST',
      body: JSON.stringify({
        username,
        password,
        is_admin: isAdmin,
      }),
    })
  }

  /**
   * Updates a user's information.
   * @param userId - ID of the user to update
   * @param changes - Partial user object containing the changes
   * @returns Promise resolving to the updated user
   */
  async updateUser(userId: number, changes: Partial<User>): Promise<User> {
    return this.request<User>(`/v1/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(changes),
    })
  }

  /**
   * Deletes a user (admin only).
   * @param userId - ID of the user to delete
   */
  async deleteUser(userId: number): Promise<void> {
    await this.request(`/v1/users/${userId}`, { method: 'DELETE' })
  }

  /**
   * Marks all entries for a user as read.
   * @param userId - ID of the user
   */
  async markUserAsRead(userId: number): Promise<void> {
    await this.request(`/v1/users/${userId}/mark-all-as-read`, { method: 'PUT' })
  }

  // System Methods

  /**
   * Checks the health status of the Miniflux server.
   * @returns Promise resolving to "OK" if the server is healthy
   */
  async healthcheck(): Promise<string> {
    return this.request('/healthcheck', {}, false)
  }

  /**
   * Retrieves version information about the Miniflux server.
   * @returns Promise resolving to version information
   */
  async getVersion(): Promise<string> {
    return this.request('/version', {}, false)
  }

  /**
   * Retrieves read/unread counters for feeds.
   * @returns Promise resolving to feed counters
   */
  async getCounters(): Promise<FeedCounters> {
    return this.request('/v1/feeds/counters')
  }

  // Utility Methods

  /**
   * Search for entries.
   * @param query - Search query
   * @param limit - Optional limit for the number of results
   * @returns Promise resolving to the search results
   */
  async searchEntries(query: string, limit?: number): Promise<EntryResultSet> {
    const params = new URLSearchParams()
    params.append('search', query)
    if (limit) {
      params.append('limit', limit.toString())
    }
    return this.request(`/v1/entries?search=${params.toString()}}`)
  }

  /**
   * Retrieves the Miniflux URL for an entry.
   * @param id - ID of the entry
   * @returns Promise resolving to the Miniflux URL
   */
  async getMinifluxEntryUrl(id: number): Promise<string> {
    const response = await this.request<EntryStatus>(`/v1/entries/${id}`)
    const { status } = response
    return `${this.baseUrl}/${status === 'read' ? 'history' : status}/entry/${id}`
  }
}