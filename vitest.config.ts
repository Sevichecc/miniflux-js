import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    // 测试文件的匹配模式
    include: ['**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    // 环境
    environment: 'node',
  },
})