interface MinifluxConfig {
    baseURL: string;
    apiKey?: string;
    username?: string;
    password?: string;
    authType?: 'api_key' | 'password';
}
interface Feed {
    id: number;
    user_id: number;
    title: string;
    site_url: string;
    feed_url: string;
    category?: Category;
    icon?: FeedIcon;
    etag_header?: string;
    last_modified_header?: string;
    crawler?: boolean;
    checked_at?: string;
    parsing_error_count?: number;
    parsing_error_message?: string;
    scraper_rules?: string;
    rewrite_rules?: string;
    blocklist_rules?: string;
    keeplist_rules?: string;
    user_agent?: string;
    cookie?: string;
    username?: string;
    password?: string;
    disabled?: boolean;
    ignore_http_cache?: boolean;
    allow_self_signed_certificates?: boolean;
    fetch_via_proxy?: boolean;
    hide_globally?: boolean;
}
interface Category {
    id: number;
    user_id: number;
    title: string;
    hide_globally?: boolean;
}
interface Entry {
    id: number;
    user_id: number;
    feed_id: number;
    status: 'unread' | 'read' | 'removed';
    title: string;
    url: string;
    comments_url?: string;
    published_at: string;
    created_at: string;
    changed_at?: string;
    content?: string;
    author?: string;
    share_code?: string;
    starred?: boolean;
    reading_time?: number;
    enclosures?: Enclosure[];
    feed?: Feed;
    category?: Category;
    tags?: string[];
}
interface FeedIcon {
    id: number;
    data: string;
    mime_type: string;
}
interface Enclosure {
    id: number;
    user_id: number;
    entry_id: number;
    url: string;
    mime_type: string;
    size: number;
    media_progression: number;
}
interface Filter {
    status?: ('read' | 'unread' | 'removed')[];
    offset?: number;
    limit?: number;
    order?: 'id' | 'status' | 'published_at' | 'category_title' | 'category_id';
    direction?: 'asc' | 'desc';
    before?: number;
    after?: number;
    published_before?: number;
    published_after?: number;
    changed_before?: number;
    changed_after?: number;
    before_entry_id?: number;
    after_entry_id?: number;
    starred?: boolean;
    search?: string;
    category_id?: number;
}
interface EntryResultSet {
    total: number;
    entries: Entry[];
}
interface User {
    id: number;
    username: string;
    is_admin: boolean;
    theme: string;
    language: string;
    timezone: string;
    entry_direction: string;
    entries_per_page: number;
    keyboard_shortcuts: boolean;
    show_reading_time: boolean;
    entry_swipe: boolean;
    stylesheet: string;
    google_id?: string;
    openid_connect_id?: string;
    entries_status_filter: string;
    default_reading_speed: number;
    cjk_reading_speed: number;
    default_home_page: string;
    categories_sorting_order: string;
}
interface FeedCounters {
    reads: {
        [key: string]: number;
    };
    unreads: {
        [key: string]: number;
    };
}
interface EntryUpdatePayload {
    title?: string;
    content?: string;
}
interface EntryStatus {
    status: 'read' | 'unread';
}

/**
 * MinifluxClient provides a TypeScript interface to interact with the Miniflux RSS reader API.
 * It supports both API key and password authentication methods.
 */
declare class MinifluxClient {
    private baseUrl;
    private apiKey?;
    private username?;
    private password?;
    private headers;
    /**
     * Creates a new MinifluxClient instance.
     * @param config - Configuration object for the client
     * @throws {Error} When required authentication parameters are missing
     */
    constructor(config: MinifluxConfig);
    /**
     * Makes an HTTP request to the Miniflux API.
     * @param path - API endpoint path
     * @param options - Fetch API options
     * @returns Promise resolving to the response data
     * @throws {Error} On API error responses
     */
    private request;
    /**
     * Retrieves all feeds.
     * @returns Promise resolving to an array of feeds
     */
    getFeeds(): Promise<Feed[]>;
    /**
     * Retrieves a specific feed by ID.
     * @param feedId - ID of the feed to retrieve
     * @returns Promise resolving to the feed details
     */
    getFeed(feedId: number): Promise<Feed>;
    /**
     * Creates a new feed.
     * @param feedUrl - URL of the feed to create
     * @param categoryId - Optional category ID to assign the feed to
     * @returns Promise resolving to the created feed
     */
    createFeed(feedUrl: string, categoryId?: number): Promise<Feed>;
    /**
     * Deletes a feed.
     * @param feedId - ID of the feed to delete
     */
    deleteFeed(feedId: number): Promise<void>;
    /**
     * Refreshes a specific feed.
     * @param feedId - ID of the feed to refresh
     */
    refreshFeed(feedId: number): Promise<void>;
    /**
     * Retrieves the icon for a feed.
     * @param feedId - ID of the feed
     * @returns Promise resolving to the feed icon data
     */
    getFeedIcon(feedId: number): Promise<FeedIcon>;
    /**
     * Retrieves entries for a specific feed.
     * @param feedId - ID of the feed
     * @param filter - Optional filter parameters
     * @returns Promise resolving to the filtered entries
     */
    getFeedEntries(feedId: number, filter?: Filter): Promise<EntryResultSet>;
    /**
     * Refreshes all feeds.
     */
    refreshAllFeeds(): Promise<void>;
    /**
     * Marks all entries in a feed as read.
     * @param feedId - ID of the feed
     */
    markFeedAsRead(feedId: number): Promise<void>;
    /**
     * Updates a feed.
     * @param feedId - ID of the feed to update
     * @param changes - Partial feed object containing the changes
     * @returns Promise resolving to the updated feed
     */
    updateFeed(feedId: number, changes: Partial<Feed>): Promise<Feed>;
    /**
     * Retrieves entries based on filter criteria.
     * @param filter - Optional filter parameters
     * @returns Promise resolving to the filtered entries
     */
    getEntries(filter?: Filter): Promise<EntryResultSet>;
    /**
     * Retrieves a specific entry.
     * @param entryId - ID of the entry to retrieve
     * @returns Promise resolving to the entry details
     */
    getEntry(entryId: number): Promise<Entry>;
    /**
     * Updates the status of an entry.
     * @param entryId - ID of the entry
     * @param status - New status ('read' or 'unread')
     */
    updateEntryStatus(entryId: number, status: 'read' | 'unread'): Promise<void>;
    /**
     * Toggles the bookmark status of an entry.
     * @param entryId - ID of the entry
     */
    toggleBookmark(entryId: number): Promise<void>;
    /**
     * Fetches the original content of an entry.
     * @param entryId - ID of the entry
     * @returns Promise resolving to the entry content
     */
    fetchContent(entryId: number): Promise<{
        content: string;
    }>;
    /**
     * Saves an entry to third-party services.
     * @param entryId - ID of the entry
     */
    saveEntry(entryId: number): Promise<void>;
    /**
     * Updates an entry's content.
     * @param entryId - ID of the entry
     * @param payload - Update payload containing title and/or content
     * @returns Promise resolving to the updated entry
     */
    updateEntry(entryId: number, payload: EntryUpdatePayload): Promise<Entry>;
    /**
     * Retrieves all categories.
     * @returns Promise resolving to an array of categories
     */
    getCategories(): Promise<Category[]>;
    /**
     * Creates a new category.
     * @param title - Title of the category
     * @returns Promise resolving to the created category
     */
    createCategory(title: string): Promise<Category>;
    /**
     * Updates a category.
     * @param categoryId - ID of the category
     * @param title - New title for the category
     * @returns Promise resolving to the updated category
     */
    updateCategory(categoryId: number, title: string): Promise<Category>;
    /**
     * Deletes a category.
     * @param categoryId - ID of the category to delete
     */
    deleteCategory(categoryId: number): Promise<void>;
    /**
     * Refreshes all feeds in a category.
     * @param categoryId - ID of the category
     */
    refreshCategoryFeeds(categoryId: number): Promise<void>;
    /**
     * Retrieves entries for a specific category.
     * @param categoryId - ID of the category
     * @param filter - Optional filter parameters
     * @returns Promise resolving to the filtered entries
     */
    getCategoryEntries(categoryId: number, filter?: Filter): Promise<EntryResultSet>;
    /**
     * Marks all entries in a category as read.
     * @param categoryId - ID of the category
     */
    markCategoryAsRead(categoryId: number): Promise<void>;
    /**
     * Retrieves an enclosure.
     * @param enclosureId - ID of the enclosure
     * @returns Promise resolving to the enclosure details
     */
    getEnclosure(enclosureId: number): Promise<Enclosure>;
    /**
     * Updates an enclosure's media progression.
     * @param enclosureId - ID of the enclosure
     * @param mediaProgression - New media progression value
     */
    updateEnclosure(enclosureId: number, mediaProgression: number): Promise<void>;
    /**
     * Retrieves the current user's information.
     * @returns Promise resolving to the user details
     */
    getMe(): Promise<User>;
    /**
     * Retrieves all users (admin only).
     * @returns Promise resolving to an array of users
     */
    getUsers(): Promise<User[]>;
    /**
     * Retrieves a specific user.
     * @param userId - ID of the user
     * @returns Promise resolving to the user details
     */
    getUser(userId: number): Promise<User>;
    /**
     * Creates a new user (admin only).
     * @param username - Username for the new user
     * @param password - Password for the new user
     * @param isAdmin - Whether the new user should have admin privileges
     * @returns Promise resolving to the created user
     */
    createUser(username: string, password: string, isAdmin: boolean): Promise<User>;
    /**
     * Updates a user's information.
     * @param userId - ID of the user to update
     * @param changes - Partial user object containing the changes
     * @returns Promise resolving to the updated user
     */
    updateUser(userId: number, changes: Partial<User>): Promise<User>;
    /**
     * Deletes a user (admin only).
     * @param userId - ID of the user to delete
     */
    deleteUser(userId: number): Promise<void>;
    /**
     * Marks all entries for a user as read.
     * @param userId - ID of the user
     */
    markUserAsRead(userId: number): Promise<void>;
    /**
     * Checks the health status of the Miniflux server.
     * @returns Promise resolving to "OK" if the server is healthy
     */
    healthcheck(): Promise<string>;
    /**
     * Retrieves version information about the Miniflux server.
     * @returns Promise resolving to version information
     */
    getVersion(): Promise<string>;
    /**
     * Retrieves read/unread counters for feeds.
     * @returns Promise resolving to feed counters
     */
    getCounters(): Promise<FeedCounters>;
    /**
     * Search for entries.
     * @param query - Search query
     * @param limit - Optional limit for the number of results
     * @returns Promise resolving to the search results
     */
    searchEntries(query: string, limit?: number): Promise<EntryResultSet>;
    /**
     * Retrieves the Miniflux URL for an entry.
     * @param id - ID of the entry
     * @returns Promise resolving to the Miniflux URL
     */
    getMinifluxEntryUrl(id: number): Promise<string>;
}

export { type Category, type Enclosure, type Entry, type EntryResultSet, type EntryStatus, type EntryUpdatePayload, type Feed, type FeedCounters, type FeedIcon, type Filter, MinifluxClient, type MinifluxConfig, type User };
