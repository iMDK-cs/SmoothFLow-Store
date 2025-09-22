// Simple in-memory cache implementation
// In production, you should use Redis or a similar solution

interface CacheItem {
  data: any
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

  set(key: string, data: any, ttlSeconds: number = 300): void {
    const item: CacheItem = {
      data,
      timestamp: Date.now(),
      ttl: ttlSeconds * 1000
    }
    this.cache.set(key, item)
  }

  get(key: string): any | null {
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
  setServices: (services: any) => cache.set('services:all', services, 300), // 5 minutes
  clearServices: () => cache.delete('services:all'),

  // Service details cache
  getService: (id: string) => cache.get(`service:${id}`),
  setService: (id: string, service: any) => cache.set(`service:${id}`, service, 600), // 10 minutes
  clearService: (id: string) => cache.delete(`service:${id}`),

  // Reviews cache
  getServiceReviews: (serviceId: string, page: number = 1) => 
    cache.get(`reviews:${serviceId}:page:${page}`),
  setServiceReviews: (serviceId: string, page: number, reviews: any) => 
    cache.set(`reviews:${serviceId}:page:${page}`, reviews, 180), // 3 minutes
  clearServiceReviews: (serviceId: string) => {
    // Clear all pages for this service
    const keys = Array.from(cache['cache'].keys()).filter(key => 
      key.startsWith(`reviews:${serviceId}:`)
    )
    keys.forEach(key => cache.delete(key))
  },

  // User profile cache
  getUserProfile: (userId: string) => cache.get(`user:${userId}`),
  setUserProfile: (userId: string, profile: any) => cache.set(`user:${userId}`, profile, 900), // 15 minutes
  clearUserProfile: (userId: string) => cache.delete(`user:${userId}`),

  // Orders cache
  getUserOrders: (userId: string, page: number = 1) => 
    cache.get(`orders:user:${userId}:page:${page}`),
  setUserOrders: (userId: string, page: number, orders: any) => 
    cache.set(`orders:user:${userId}:page:${page}`, orders, 120), // 2 minutes
  clearUserOrders: (userId: string) => {
    const keys = Array.from(cache['cache'].keys()).filter(key => 
      key.startsWith(`orders:user:${userId}:`)
    )
    keys.forEach(key => cache.delete(key))
  },

  // Admin statistics cache
  getAdminStats: () => cache.get('admin:stats'),
  setAdminStats: (stats: any) => cache.set('admin:stats', stats, 300), // 5 minutes
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

  // When a review is added/updated
  onReviewUpdate: (serviceId: string) => {
    cacheUtils.clearServiceReviews(serviceId)
    cacheUtils.clearService(serviceId) // Service rating might change
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
export function withCache<T>(
  cacheKey: string,
  ttlSeconds: number = 300
) {
  return function(target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value

    descriptor.value = async function(...args: any[]) {
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

// Export cache instance and utilities
export default cache