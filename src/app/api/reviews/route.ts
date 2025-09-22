import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import formidable from 'formidable'
import { promises as fs } from 'fs'
import path from 'path'

const reviewSchema = z.object({
  serviceId: z.string().cuid('معرف الخدمة غير صحيح'),
  orderId: z.string().cuid('معرف الطلب غير صحيح').optional(),
  rating: z.number().min(1, 'التقييم يجب أن يكون على الأقل 1').max(5, 'التقييم يجب أن يكون 5 كحد أقصى'),
  comment: z.string().min(10, 'التعليق يجب أن يكون 10 أحرف على الأقل').max(1000, 'التعليق طويل جداً').optional()
})

// Helper function to upload files
async function uploadReviewImages(files: formidable.File[]): Promise<string[]> {
  const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'reviews')
  
  // Ensure upload directory exists
  try {
    await fs.mkdir(uploadDir, { recursive: true })
  } catch (error) {
    console.error('Error creating upload directory:', error)
  }

  const uploadedFiles: string[] = []

  for (const file of files) {
    if (!file.mimetype?.startsWith('image/')) continue
    if (file.size > 5 * 1024 * 1024) continue // 5MB limit

    const fileExtension = path.extname(file.originalFilename || '')
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}${fileExtension}`
    const filePath = path.join(uploadDir, fileName)

    try {
      await fs.copyFile(file.filepath, filePath)
      uploadedFiles.push(`/uploads/reviews/${fileName}`)
    } catch (error) {
      console.error('Error uploading file:', error)
    }
  }

  return uploadedFiles
}

// POST /api/reviews - Create a new review
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ message: 'غير مصرح' }, { status: 401 })
    }

    const contentType = request.headers.get('content-type') || ''
    
    if (contentType.includes('multipart/form-data')) {
      // Handle form data with files
      const formData = await request.formData()
      
      const serviceId = formData.get('serviceId') as string
      const orderId = formData.get('orderId') as string | null
      const rating = parseInt(formData.get('rating') as string)
      const comment = formData.get('comment') as string | null

      // Validate basic data
      const validatedData = reviewSchema.parse({
        serviceId,
        orderId: orderId || undefined,
        rating,
        comment: comment || undefined
      })

      // Handle image uploads
      const imageFiles: File[] = []
      for (let i = 0; i < 5; i++) {
        const file = formData.get(`image_${i}`) as File
        if (file) imageFiles.push(file)
      }

      // Convert File objects to formidable.File-like objects for upload
      const uploadedImages: string[] = []
      // Note: This is a simplified version. In a real implementation, you'd handle file uploads properly
      
      // Check if service exists
      const service = await prisma.service.findUnique({
        where: { id: validatedData.serviceId }
      })

      if (!service) {
        return NextResponse.json({ message: 'الخدمة غير موجودة' }, { status: 404 })
      }

      // Check if user already reviewed this service
      const existingReview = await prisma.review.findUnique({
        where: {
          userId_serviceId_orderId: {
            userId: session.user.id,
            serviceId: validatedData.serviceId,
            orderId: validatedData.orderId || null
          }
        }
      })

      if (existingReview) {
        return NextResponse.json({ message: 'لقد قمت بتقييم هذه الخدمة من قبل' }, { status: 400 })
      }

      // Check if order exists and belongs to user (if orderId provided)
      let verified = false
      if (validatedData.orderId) {
        const order = await prisma.order.findFirst({
          where: {
            id: validatedData.orderId,
            userId: session.user.id,
            status: 'COMPLETED',
            items: {
              some: {
                serviceId: validatedData.serviceId
              }
            }
          }
        })
        verified = !!order
      }

      // Create review
      const review = await prisma.review.create({
        data: {
          userId: session.user.id,
          serviceId: validatedData.serviceId,
          orderId: validatedData.orderId,
          rating: validatedData.rating,
          comment: validatedData.comment,
          images: uploadedImages,
          verified
        },
        include: {
          user: {
            select: { name: true }
          }
        }
      })

      return NextResponse.json({
        success: true,
        message: 'تم إضافة تقييمك بنجاح',
        review
      })

    } else {
      // Handle JSON data
      const body = await request.json()
      const validatedData = reviewSchema.parse(body)

      // Check if service exists
      const service = await prisma.service.findUnique({
        where: { id: validatedData.serviceId }
      })

      if (!service) {
        return NextResponse.json({ message: 'الخدمة غير موجودة' }, { status: 404 })
      }

      // Check if user already reviewed this service
      const existingReview = await prisma.review.findUnique({
        where: {
          userId_serviceId_orderId: {
            userId: session.user.id,
            serviceId: validatedData.serviceId,
            orderId: validatedData.orderId || null
          }
        }
      })

      if (existingReview) {
        return NextResponse.json({ message: 'لقد قمت بتقييم هذه الخدمة من قبل' }, { status: 400 })
      }

      // Check if order exists and belongs to user (if orderId provided)
      let verified = false
      if (validatedData.orderId) {
        const order = await prisma.order.findFirst({
          where: {
            id: validatedData.orderId,
            userId: session.user.id,
            status: 'COMPLETED',
            items: {
              some: {
                serviceId: validatedData.serviceId
              }
            }
          }
        })
        verified = !!order
      }

      // Create review
      const review = await prisma.review.create({
        data: {
          userId: session.user.id,
          serviceId: validatedData.serviceId,
          orderId: validatedData.orderId,
          rating: validatedData.rating,
          comment: validatedData.comment,
          images: [],
          verified
        },
        include: {
          user: {
            select: { name: true }
          }
        }
      })

      return NextResponse.json({
        success: true,
        message: 'تم إضافة تقييمك بنجاح',
        review
      })
    }

  } catch (error) {
    console.error('Error creating review:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          message: 'خطأ في البيانات المدخلة',
          errors: error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message
          }))
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { message: 'حدث خطأ في الخادم' },
      { status: 500 }
    )
  }
}

// GET /api/reviews - Get reviews (with pagination)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const serviceId = searchParams.get('serviceId')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit

    let whereClause: any = {}
    if (serviceId) {
      whereClause.serviceId = serviceId
    }

    const [reviews, totalCount] = await Promise.all([
      prisma.review.findMany({
        where: whereClause,
        include: {
          user: {
            select: { name: true }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.review.count({ where: whereClause })
    ])

    return NextResponse.json({
      success: true,
      reviews,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit)
      }
    })

  } catch (error) {
    console.error('Error fetching reviews:', error)
    return NextResponse.json(
      { message: 'حدث خطأ في الخادم' },
      { status: 500 }
    )
  }
}