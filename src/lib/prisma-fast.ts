import { PrismaClient } from '@prisma/client'

// Fast Prisma client with optimized configuration
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
  // Optimized configuration for better performance
  __internal: {
    engine: {
      connectTimeout: 5000,  // 5 seconds
      queryTimeout: 10000,   // 10 seconds
    },
  },
})

// Prevent multiple instances in development
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// Optimized connection handling
let isConnected = false

export async function connectToDatabase() {
  if (isConnected) return
  
  try {
    await prisma.$connect()
    isConnected = true
    console.log('✅ Database connected successfully')
  } catch (error) {
    console.error('❌ Failed to connect to database:', error)
    throw error
  }
}

// Graceful shutdown
process.on('beforeExit', async () => {
  if (isConnected) {
    await prisma.$disconnect()
    isConnected = false
  }
})

export default prisma