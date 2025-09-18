import { PrismaClient } from '@prisma/client'

// Optimized Prisma client configuration
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: ['error'], // Only log errors in production
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
  // Connection pooling configuration
  __internal: {
    engine: {
      connectTimeout: 10000, // 10 seconds
      queryTimeout: 30000,   // 30 seconds
    },
  },
})

// Prevent multiple instances in development
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// Connection optimization
prisma.$connect().catch((error) => {
  console.error('Failed to connect to database:', error)
})

// Graceful shutdown
process.on('beforeExit', async () => {
  await prisma.$disconnect()
})

export default prisma