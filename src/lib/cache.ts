// Cache management for services data with better performance
const servicesCache = new Map<string, { data: unknown; timestamp: number }>()
const CACHE_TTL = 300000 // 5 minutes for better performance

// Function to clear cache
export function clearServicesCache() {
  servicesCache.clear()
}

// Function to get cached data
export function getCachedServices(cacheKey: string) {
  const cached = servicesCache.get(cacheKey)
  const now = Date.now()
  
  if (cached && (now - cached.timestamp) < CACHE_TTL) {
    return cached.data
  }
  
  return null
}

// Function to set cached data
export function setCachedServices(cacheKey: string, data: unknown) {
  servicesCache.set(cacheKey, { data, timestamp: Date.now() })
}

// Function to create cache key
export function createServicesCacheKey(category?: string | null, popular?: string | null) {
  return `services-${category || 'all'}-${popular || 'all'}`
}