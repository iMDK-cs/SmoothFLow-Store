import { prisma } from './prisma'
import { Service, ServiceQuery, ServiceCategoryEnum } from '@/types/service'

// Cache for services (in-memory)
const servicesCache = new Map<string, { data: Service[]; timestamp: number }>()
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

export async function getServices(query: ServiceQuery = {}): Promise<Service[]> {
  const cacheKey = JSON.stringify(query)
  const cached = servicesCache.get(cacheKey)
  const now = Date.now()

  // Return cached data if still valid
  if (cached && (now - cached.timestamp) < CACHE_TTL) {
    return cached.data
  }

  try {
    // Build where clause
    const whereClause: {
      active: boolean
      available: boolean
      category?: string
      popular?: boolean
      OR?: Array<{
        title?: { contains: string; mode: 'insensitive' }
        description?: { contains: string; mode: 'insensitive' }
        category?: { contains: string; mode: 'insensitive' }
      }>
    } = {
      active: true,
      available: true,
    }

    if (query.category) {
      whereClause.category = query.category
    }

    if (query.featured) {
      whereClause.popular = true
    }

    if (query.search) {
      whereClause.OR = [
        { title: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
        { category: { contains: query.search, mode: 'insensitive' } },
      ]
    }

    // Execute query
    const services = await prisma.service.findMany({
      where: whereClause,
      orderBy: [
        { popular: 'desc' },
        { createdAt: 'desc' }
      ],
      take: query.limit,
      select: {
        id: true,
        title: true,
        description: true,
        basePrice: true,
        image: true,
        icon: true,
        category: true,
        popular: true,
        available: true,
        active: true,
        stock: true,
        options: {
          where: { active: true },
          select: {
            id: true,
            title: true,
            price: true,
            description: true,
            active: true,
          }
        },
        createdAt: true,
        updatedAt: true,
      }
    })

    // Cache the result
    servicesCache.set(cacheKey, { data: services, timestamp: now })

    return services
  } catch (error) {
    console.error('Error fetching services:', error)
    throw new Error('فشل في جلب الخدمات')
  }
}

export async function getServiceById(id: string): Promise<Service | null> {
  try {
    const service = await prisma.service.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        description: true,
        basePrice: true,
        image: true,
        icon: true,
        category: true,
        popular: true,
        available: true,
        active: true,
        stock: true,
        options: {
          where: { active: true },
          select: {
            id: true,
            title: true,
            price: true,
            description: true,
            active: true,
          }
        },
        createdAt: true,
        updatedAt: true,
      }
    })

    return service
  } catch (error) {
    console.error('Error fetching service by ID:', error)
    throw new Error('فشل في جلب الخدمة')
  }
}

export async function getServicesByCategory(): Promise<Record<string, Service[]>> {
  try {
    const services = await getServices()
    
    return services.reduce((acc, service) => {
      const category = service.category || ServiceCategoryEnum.OTHER
      if (!acc[category]) {
        acc[category] = []
      }
      acc[category].push(service)
      return acc
    }, {} as Record<string, Service[]>)
  } catch (error) {
    console.error('Error grouping services by category:', error)
    throw new Error('فشل في تجميع الخدمات حسب الفئة')
  }
}

export async function getFeaturedServices(limit: number = 6): Promise<Service[]> {
  return getServices({ featured: true, limit })
}

export async function searchServices(searchTerm: string, limit?: number): Promise<Service[]> {
  return getServices({ search: searchTerm, limit })
}

export function clearServicesCache(): void {
  servicesCache.clear()
}

export function getServicesCacheSize(): number {
  return servicesCache.size
}