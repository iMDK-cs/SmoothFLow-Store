export interface Service {
  id: string
  title: string
  description: string
  basePrice: number
  image?: string | null
  icon?: string | null
  category: string
  popular: boolean
  available: boolean
  active: boolean
  stock?: number | null
  options: ServiceOption[]
  createdAt: Date
  updatedAt: Date
}

export interface ServiceOption {
  id: string
  title: string
  price: number
  description?: string
  active: boolean
}

export interface ServiceCategory {
  name: string
  services: Service[]
  count: number
}

export interface ServicesResponse {
  success: boolean
  data: {
    services: Service[]
    servicesByCategory: Record<string, Service[]>
    total: number
    categories: string[]
  }
  error?: string
  details?: unknown
}

export interface ServiceQuery {
  category?: string
  featured?: boolean
  limit?: number
  search?: string
}

// Service categories enum
export enum ServiceCategoryEnum {
  BUILD = 'بناء أجهزة',
  MAINTENANCE = 'صيانة',
  REPAIR = 'إصلاح',
  UPGRADE = 'ترقية',
  CUSTOMIZATION = 'تخصيص',
  SOFTWARE = 'برمجيات',
  OTHER = 'أخرى'
}

// Service status enum
export enum ServiceStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  DRAFT = 'draft'
}

// Service availability enum
export enum ServiceAvailability {
  AVAILABLE = 'available',
  OUT_OF_STOCK = 'out_of_stock',
  COMING_SOON = 'coming_soon'
}