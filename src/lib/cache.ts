// Simple in-memory cache implementation
// In production, you should use Redis or a similar solution

interface CacheItem {
  data: unknown
  timestamp: number
  ttl: number
}

class SimpleCache {
  private cache: Map<string, CacheItem> = new Map()
  private cleanupInterval: NodeJS.Timeout

  constructor() {
    // Clean up expired items every 5 minutes
    this.cleanupInterval = setInterval(() => {
      this.cleanup()
    }, 5 * 60 * 1000)
  }

  set(key: string, data: unknown, ttlSeconds: number = 300): void {
    const item: CacheItem = {
      data,
      timestamp: Date.now(),
      ttl: ttlSeconds * 1000
    }
    this.cache.set(key, item)
  }

  get(key: string): unknown | null {
    const item = this.cache.get(key)
    
    if (!item) {
      return null
    }

    // Check if item has expired
    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key)
      return null
    }

    return item.data
  }

  delete(key: string): void {
    this.cache.delete(key)
  }

  clear(): void {
    this.cache.clear()
  }

  private cleanup(): void {
    const now = Date.now()
    for (const [key, item] of this.cache.entries()) {
      if (now - item.timestamp > item.ttl) {
        this.cache.delete(key)
      }
    }
  }

  // Get cache statistics
  getStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    }
  }
}

// Global cache instance
export const cache = new SimpleCache()

// Cache utility functions
export const cacheUtils = {
  // Services cache
  getServices: () => cache.get('services:all'),
  setServices: (services: unknown) => cache.set('services:all', services, 300), // 5 minutes
  clearServices: () => cache.delete('services:all'),
  
  // Legacy cache functions for backward compatibility
  getCachedServices: () => cache.get('services:all'),
  setCachedServices: (services: unknown) => cache.set('services:all', services, 300),
  clearServicesCache: () => cache.delete('services:all'),
  createServicesCacheKey: () => 'services:all',

  // Service details cache
  getService: (id: string) => cache.get(`service:${id}`),
  setService: (id: string, service: unknown) => cache.set(`service:${id}`, service, 600), // 10 minutes
  clearService: (id: string) => cache.delete(`service:${id}`),


  // User profile cache
  getUserProfile: (userId: string) => cache.get(`user:${userId}`),
  setUserProfile: (userId: string, profile: unknown) => cache.set(`user:${userId}`, profile, 900), // 15 minutes
  clearUserProfile: (userId: string) => cache.delete(`user:${userId}`),

  // Orders cache
  getUserOrders: (userId: string, page: number = 1) => 
    cache.get(`orders:user:${userId}:page:${page}`),
  setUserOrders: (userId: string, page: number, orders: unknown) => 
    cache.set(`orders:user:${userId}:page:${page}`, orders, 120), // 2 minutes
  clearUserOrders: (userId: string) => {
    const keys = Array.from(cache['cache'].keys()).filter(key => 
      key.startsWith(`orders:user:${userId}:`)
    )
    keys.forEach(key => cache.delete(key))
  },

  // Admin statistics cache
  getAdminStats: () => cache.get('admin:stats'),
  setAdminStats: (stats: unknown) => cache.set('admin:stats', stats, 300), // 5 minutes
  clearAdminStats: () => cache.delete('admin:stats')
}

// Cache invalidation helpers
export const invalidateCache = {
  // When a service is updated
  onServiceUpdate: (serviceId: string) => {
    cacheUtils.clearServices()
    cacheUtils.clearService(serviceId)
    cacheUtils.clearAdminStats()
  },


  // When an order is created/updated
  onOrderUpdate: (userId: string) => {
    cacheUtils.clearUserOrders(userId)
    cacheUtils.clearAdminStats()
  },

  // When user profile is updated
  onUserUpdate: (userId: string) => {
    cacheUtils.clearUserProfile(userId)
  }
}

// Higher-order function for caching API responses
export function withCache(
  cacheKey: string,
  ttlSeconds: number = 300
) {
  return function(target: unknown, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value

    descriptor.value = async function(...args: unknown[]) {
      // Try to get from cache first
      const cachedResult = cache.get(cacheKey)
      if (cachedResult !== null) {
        return cachedResult
      }

      // Execute the original method
      const result = await method.apply(this, args)
      
      // Cache the result
      cache.set(cacheKey, result, ttlSeconds)
      
      return result
    }

    return descriptor
  }
}

// Middleware for cache headers
export function setCacheHeaders(response: Response, maxAge: number = 300) {
  response.headers.set('Cache-Control', `public, max-age=${maxAge}, s-maxage=${maxAge}`)
  response.headers.set('Vary', 'Accept-Encoding')
  return response
}

// Cache warming functions (run these periodically)
export const warmCache = {
  async services() {
    try {
      const { prisma } = await import('./prisma')
      const services = await prisma.service.findMany({
        where: { active: true, available: true },
        include: {
          options: {
            where: { active: true }
          }
        },
        orderBy: [
          { popular: 'desc' },
          { createdAt: 'desc' }
        ]
      })
      cacheUtils.setServices(services)
      console.log(`Warmed cache with ${services.length} services`)
    } catch (error) {
      console.error('Error warming services cache:', error)
    }
  },

  async adminStats() {
    try {
      const { prisma } = await import('./prisma')
      
      const [
        totalOrders,
        totalRevenue,
        totalUsers,
        totalServices,
        pendingOrders,
        completedOrders
      ] = await Promise.all([
        prisma.order.count(),
        prisma.order.aggregate({
          _sum: { totalAmount: true },
          where: { paymentStatus: 'PAID' }
        }),
        prisma.user.count(),
        prisma.service.count({ where: { active: true } }),
        prisma.order.count({ where: { status: 'PENDING' } }),
        prisma.order.count({ where: { status: 'COMPLETED' } })
      ])

      const stats = {
        totalOrders,
        totalRevenue: totalRevenue._sum.totalAmount || 0,
        totalUsers,
        totalServices,
        pendingOrders,
        completedOrders
      }

      cacheUtils.setAdminStats(stats)
      console.log('Warmed admin stats cache')
    } catch (error) {
      console.error('Error warming admin stats cache:', error)
    }
  }
}

// Export individual functions for backward compatibility
export const getCachedServices = cacheUtils.getCachedServices
export const setCachedServices = cacheUtils.setCachedServices
export const clearServicesCache = cacheUtils.clearServicesCache
export const createServicesCacheKey = cacheUtils.createServicesCacheKey

// Export cache instance and utilities
export default cache