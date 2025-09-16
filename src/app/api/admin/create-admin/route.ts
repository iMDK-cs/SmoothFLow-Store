import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const { email, password, name } = await request.json()

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'Email, password, and name are required' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      // If user exists, upgrade to admin
      const hashedPassword = await bcrypt.hash(password, 12)
      
      const adminUser = await prisma.user.update({
        where: { email },
        data: {
          password: hashedPassword,
          name,
          role: 'ADMIN',
          verified: true
        }
      })

      return NextResponse.json({
        message: 'Existing user upgraded to admin successfully',
        user: {
          id: adminUser.id,
          email: adminUser.email,
          name: adminUser.name,
          role: adminUser.role
        }
      })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create new admin user
    const adminUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: 'ADMIN',
        verified: true
      }
    })

    return NextResponse.json({
      message: 'Admin user created successfully',
      user: {
        id: adminUser.id,
        email: adminUser.email,
        name: adminUser.name,
        role: adminUser.role
      }
    })
  } catch (error) {
    console.error('Create admin error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}