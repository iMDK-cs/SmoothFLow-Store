import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { sanitizeUserName, validateUserInput } from '@/lib/security'
import { withRateLimit, authRateLimit } from '@/lib/rateLimit'

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  phone: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    // Rate limiting check
    const rateLimitCheck = await withRateLimit(authRateLimit)(request)
    if (!rateLimitCheck.allowed) {
      return NextResponse.json(
        { error: rateLimitCheck.error },
        { status: 429 }
      )
    }

    const body = await request.json()
    const { name, email, password, phone } = registerSchema.parse(body)

    // Sanitize and validate user input
    const sanitizedName = sanitizeUserName(name)
    if (!sanitizedName || !validateUserInput(sanitizedName, 100)) {
      return NextResponse.json(
        { error: 'Invalid name format' },
        { status: 400 }
      )
    }

    const sanitizedPhone = phone ? sanitizeUserName(phone) : undefined

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists with this email' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create user
    const user = await prisma.user.create({
      data: {
        name: sanitizedName,
        email,
        password: hashedPassword,
        phone: sanitizedPhone,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        verified: true,
        createdAt: true,
      }
    })

    // Create cart for user
    await prisma.cart.create({
      data: {
        userId: user.id
      }
    })

    return NextResponse.json(
      { message: 'User created successfully', user },
      { status: 201 }
    )
  } catch (error) {
    console.error('Registration error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      )
    }

    // More specific error handling
    if (error instanceof Error) {
      console.error('Error details:', error.message)
      
      // Check for database connection errors
      if (error.message.includes('connect') || error.message.includes('timeout')) {
        return NextResponse.json(
          { error: 'Database connection failed. Please try again later.' },
          { status: 503 }
        )
      }
      
      // Check for unique constraint violations
      if (error.message.includes('Unique constraint')) {
        return NextResponse.json(
          { error: 'User already exists with this email' },
          { status: 400 }
        )
      }
    }

    return NextResponse.json(
      { error: 'Internal server error', details: process.env.NODE_ENV === 'development' ? error : undefined },
      { status: 500 }
    )
  }
}