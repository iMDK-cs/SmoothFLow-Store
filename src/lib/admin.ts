import AdminJS from 'adminjs'
import AdminJSExpress from '@adminjs/express'
import AdminJSPrisma from '@adminjs/prisma'
import { PrismaClient } from '@prisma/client'
// import { getServerSession } from 'next-auth' // Removed unused imports
// import { authOptions } from './auth'

const prisma = new PrismaClient()

// Configure AdminJS
AdminJS.registerAdapter(AdminJSPrisma)

const admin = new AdminJS({
  resources: [
    {
      resource: { model: prisma.user, client: prisma },
      options: {
        listProperties: ['id', 'name', 'email', 'role', 'verified', 'createdAt'],
        editProperties: ['name', 'email', 'phone', 'role', 'verified'],
        showProperties: ['id', 'name', 'email', 'phone', 'role', 'verified', 'createdAt', 'updatedAt'],
        filterProperties: ['name', 'email', 'role', 'verified'],
        properties: {
          password: {
            isVisible: false,
          },
          id: {
            isVisible: { list: true, filter: false, show: true, edit: false },
          },
          role: {
            availableValues: [
              { value: 'USER', label: 'User' },
              { value: 'ADMIN', label: 'Admin' },
              { value: 'MODERATOR', label: 'Moderator' },
            ],
          },
        },
      },
    },
    {
      resource: { model: prisma.service, client: prisma },
      options: {
        listProperties: ['id', 'title', 'category', 'basePrice', 'popular', 'active', 'createdAt'],
        editProperties: ['title', 'description', 'basePrice', 'category', 'image', 'icon', 'color', 'popular', 'active'],
        showProperties: ['id', 'title', 'description', 'basePrice', 'category', 'image', 'icon', 'color', 'popular', 'active', 'createdAt', 'updatedAt'],
        filterProperties: ['title', 'category', 'popular', 'active'],
        properties: {
          id: {
            isVisible: { list: true, filter: false, show: true, edit: false },
          },
          image: {
            type: 'string',
          },
          color: {
            type: 'string',
            availableValues: [
              { value: 'from-blue-500 to-blue-600', label: 'Blue' },
              { value: 'from-green-500 to-green-600', label: 'Green' },
              { value: 'from-purple-500 to-purple-600', label: 'Purple' },
              { value: 'from-red-500 to-red-600', label: 'Red' },
              { value: 'from-yellow-500 to-yellow-600', label: 'Yellow' },
              { value: 'from-indigo-500 to-indigo-600', label: 'Indigo' },
            ],
          },
        },
      },
    },
    {
      resource: { model: prisma.serviceOption, client: prisma },
      options: {
        listProperties: ['id', 'title', 'serviceId', 'price', 'active'],
        editProperties: ['title', 'description', 'price', 'active'],
        showProperties: ['id', 'title', 'description', 'price', 'active', 'serviceId'],
        filterProperties: ['title', 'active'],
        properties: {
          id: {
            isVisible: { list: true, filter: false, show: true, edit: false },
          },
        },
      },
    },
    {
      resource: { model: prisma.order, client: prisma },
      options: {
        listProperties: ['id', 'orderNumber', 'status', 'totalAmount', 'paymentStatus', 'createdAt'],
        editProperties: ['status', 'paymentStatus', 'notes', 'scheduledDate'],
        showProperties: ['id', 'orderNumber', 'status', 'totalAmount', 'paymentStatus', 'paymentMethod', 'notes', 'scheduledDate', 'createdAt', 'updatedAt'],
        filterProperties: ['status', 'paymentStatus', 'orderNumber'],
        properties: {
          id: {
            isVisible: { list: true, filter: false, show: true, edit: false },
          },
          orderNumber: {
            isVisible: { list: true, filter: true, show: true, edit: false },
          },
          status: {
            availableValues: [
              { value: 'PENDING', label: 'Pending' },
              { value: 'CONFIRMED', label: 'Confirmed' },
              { value: 'IN_PROGRESS', label: 'In Progress' },
              { value: 'COMPLETED', label: 'Completed' },
              { value: 'CANCELLED', label: 'Cancelled' },
              { value: 'REFUNDED', label: 'Refunded' },
            ],
          },
          paymentStatus: {
            availableValues: [
              { value: 'PENDING', label: 'Pending' },
              { value: 'COMPLETED', label: 'Completed' },
              { value: 'FAILED', label: 'Failed' },
              { value: 'REFUNDED', label: 'Refunded' },
              { value: 'CANCELLED', label: 'Cancelled' },
            ],
          },
        },
      },
    },
    {
      resource: { model: prisma.orderItem, client: prisma },
      options: {
        listProperties: ['id', 'serviceId', 'optionId', 'quantity', 'unitPrice', 'totalPrice'],
        showProperties: ['id', 'serviceId', 'optionId', 'quantity', 'unitPrice', 'totalPrice', 'notes'],
        filterProperties: ['serviceId'],
        properties: {
          id: {
            isVisible: { list: true, filter: false, show: true, edit: false },
          },
        },
      },
    },
    {
      resource: { model: prisma.review, client: prisma },
      options: {
        listProperties: ['id', 'userId', 'serviceId', 'rating', 'verified', 'createdAt'],
        editProperties: ['rating', 'comment', 'verified'],
        showProperties: ['id', 'userId', 'serviceId', 'rating', 'comment', 'verified', 'createdAt', 'updatedAt'],
        filterProperties: ['rating', 'verified'],
        properties: {
          id: {
            isVisible: { list: true, filter: false, show: true, edit: false },
          },
          rating: {
            type: 'number',
            minimum: 1,
            maximum: 5,
          },
        },
      },
    },
    {
      resource: { model: prisma.booking, client: prisma },
      options: {
        listProperties: ['id', 'userId', 'serviceId', 'date', 'time', 'status'],
        editProperties: ['date', 'time', 'status', 'notes'],
        showProperties: ['id', 'userId', 'serviceId', 'date', 'time', 'status', 'notes', 'createdAt', 'updatedAt'],
        filterProperties: ['status', 'date'],
        properties: {
          id: {
            isVisible: { list: true, filter: false, show: true, edit: false },
          },
          status: {
            availableValues: [
              { value: 'PENDING', label: 'Pending' },
              { value: 'CONFIRMED', label: 'Confirmed' },
              { value: 'COMPLETED', label: 'Completed' },
              { value: 'CANCELLED', label: 'Cancelled' },
              { value: 'NO_SHOW', label: 'No Show' },
            ],
          },
        },
      },
    },
  ],
  branding: {
    companyName: 'SmoothFlow Admin',
    logo: '/images/logo/store logo.png',
    favicon: '/favicon.ico',
    theme: {
      colors: {
        primary100: '#00BFFF',
        primary80: '#87CEEB',
        primary60: '#87CEFA',
        primary40: '#B0E0E6',
        primary20: '#E0F6FF',
        grey100: '#1a1a1a',
        grey80: '#2d2d2d',
        grey60: '#404040',
        grey40: '#666666',
        grey20: '#999999',
        filterBg: '#2d2d2d',
        accent: '#00BFFF',
        hoverBg: '#2d2d2d',
      },
    },
  },
  rootPath: '/admin',
})

// Authentication middleware
const authenticate = async (email: string, password: string) => {
  const user = await prisma.user.findUnique({
    where: { email },
  })

  if (user && user.password === password && user.role === 'ADMIN') {
    return { email: user.email, role: user.role }
  }
  return null
}

// Create router
const router = AdminJSExpress.buildAuthenticatedRouter(admin, {
  authenticate,
  cookieName: 'adminjs',
  cookiePassword: process.env.ADMINJS_COOKIE_PASSWORD || 'adminjs-secret-key-change-in-production',
}, null, {
  resave: true,
  saveUninitialized: true,
  secret: process.env.ADMINJS_SESSION_SECRET || 'adminjs-session-secret-change-in-production',
})

export { admin, router }