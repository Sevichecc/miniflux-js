# Miniflux.js

Unofficial JavaScript SDK for [Miniflux](https://miniflux.app) RSS reader.

[![npm version](https://flat.badgen.net/npm/v/miniflux-js?color=cyan)](https://npmjs.com/package/miniflux-js)
[![npm downloads](https://flat.badgen.net/npm/dm/miniflux-js?color=cyan)](https://npm.chart.dev/miniflux-js)
[![bundle size](https://flat.badgen.net/bundlephobia/minzip/miniflux-js?color=cyan)](https://bundlephobia.com/package/miniflux-js)
[![license](https://flat.badgen.net/github/license/Sevichecc/miniflux-js?color=cyan)](https://github.com/Sevichecc/miniflux-js/blob/main/LICENSE)

## Features

- 🔄 Full TypeScript support
- 📚 Complete Miniflux API coverage
- ✨ Modern ESM package
- 🧪 Comprehensive test coverage
- 📖 Detailed documentation

## Installation

```bash
# Using npm
npm install miniflux-js

# Using yarn
yarn add miniflux-js

# Using pnpm
pnpm add miniflux-js

# Using bun
bun add miniflux-js
```

## Quick Start

```typescript
import { MinifluxClient } from 'miniflux-js'

// Initialize client with API key
const client = new MinifluxClient({
  baseURL: 'https://your-miniflux-instance.com',
  apiKey: 'your-api-key'
})

// Or initialize with username and password
const client = new MinifluxClient({
  baseURL: 'https://your-miniflux-instance.com',
  username: 'your-username',
  password: 'your-password'
})

// Get user information
const me = await client.getMe()

// Get all feeds
const feeds = await client.getFeeds()

// Get unread entries
const entries = await client.getEntries({
  status: ['unread']
})
```

## API Reference

The SDK provides methods for all Miniflux API endpoints. Here are some commonly used ones:

### User Methods
- `getMe()`: Get current user information
- `updateUser(userId, changes)`: Update user settings

### Feed Methods
- `getFeeds()`: Get all feeds
- `createFeed(feedUrl, categoryId)`: Add a new feed
- `updateFeed(feedId, changes)`: Update feed settings
- `refreshFeed(feedId)`: Refresh a feed
- `deleteFeed(feedId)`: Delete a feed

### Entry Methods
- `getEntries(filter)`: Get entries with optional filters
- `getEntry(entryId)`: Get a single entry
- `updateEntryStatus(entryId, status)`: Update entry status
- `toggleBookmark(entryId)`: Toggle entry bookmark status

### Category Methods
- `getCategories()`: Get all categories
- `createCategory(title)`: Create a new category
- `updateCategory(categoryId, title)`: Update category
- `deleteCategory(categoryId)`: Delete category

### Utility Methods
- `searchEntries(query, limit?)`: Search for entries with optional result limit
- `getMinifluxEntryUrl(entryId)`: Get Miniflux web UI URL for an entry

For complete API documentation, please visit our [API Reference](https://sevichecc.github.io/miniflux-js/).

## Development

```bash
# Install dependencies
pnpm install

# Run tests
pnpm test

# Build documentation
pnpm build:docs

# Format code
pnpm format

# Lint code
pnpm lint

# Linting fix
pnpm lint:fix
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

## License

[MIT](LICENSE) © Sevi.C