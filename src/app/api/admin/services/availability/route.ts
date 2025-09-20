import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Validation schemas
const updateAvailabilitySchema = z.object({
  serviceId: z.string(),
  availabilityStatus: z.enum(['available', 'out_of_stock', 'discontinued', 'coming_soon']),
  reason: z.string().optional()
});

const bulkUpdateSchema = z.object({
  serviceIds: z.array(z.string()),
  availabilityStatus: z.enum(['available', 'out_of_stock', 'discontinued', 'coming_soon']),
  reason: z.string().optional()
});

// GET - Get availability history for a service
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { role: true }
    });

    if (user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const serviceId = searchParams.get('serviceId');

    if (!serviceId) {
      return NextResponse.json({ error: 'Service ID is required' }, { status: 400 });
    }

    const history = await prisma.availabilityHistory.findMany({
      where: { serviceId },
      include: {
        user: {
          select: { name: true, email: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 50
    });

    return NextResponse.json({ history });
  } catch (error) {
    console.error('Error fetching availability history:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Update service availability
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, role: true }
    });

    if (user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { serviceId, availabilityStatus, reason } = updateAvailabilitySchema.parse(body);

    // Get current service status
    const service = await prisma.service.findUnique({
      where: { id: serviceId },
      select: { 
        id: true, 
        title: true, 
        availabilityStatus: true, 
        available: true 
      }
    });

    if (!service) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 });
    }

    // Update service availability
    const updatedService = await prisma.service.update({
      where: { id: serviceId },
      data: {
        availabilityStatus,
        available: availabilityStatus === 'available',
        availabilityUpdatedAt: new Date()
      }
    });

    // Log the change in history
    await prisma.availabilityHistory.create({
      data: {
        serviceId,
        userId: user.id,
        oldStatus: service.availabilityStatus,
        newStatus: availabilityStatus,
        reason
      }
    });

    return NextResponse.json({ 
      success: true, 
      service: updatedService,
      message: `تم تحديث حالة التوفر لـ ${service.title}`
    });
  } catch (error) {
    console.error('Error updating service availability:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT - Bulk update availability
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, role: true }
    });

    if (user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { serviceIds, availabilityStatus, reason } = bulkUpdateSchema.parse(body);

    if (serviceIds.length === 0) {
      return NextResponse.json({ error: 'No services provided' }, { status: 400 });
    }

    // Get current statuses for history
    const services = await prisma.service.findMany({
      where: { id: { in: serviceIds } },
      select: { id: true, title: true, availabilityStatus: true }
    });

    // Update all services
    const updateResult = await prisma.service.updateMany({
      where: { id: { in: serviceIds } },
      data: {
        availabilityStatus,
        available: availabilityStatus === 'available',
        availabilityUpdatedAt: new Date()
      }
    });

    // Log changes in history
    const historyEntries = services.map(service => ({
      serviceId: service.id,
      userId: user.id,
      oldStatus: service.availabilityStatus,
      newStatus: availabilityStatus,
      reason
    }));

    await prisma.availabilityHistory.createMany({
      data: historyEntries
    });

    return NextResponse.json({ 
      success: true, 
      updatedCount: updateResult.count,
      message: `تم تحديث ${updateResult.count} خدمة بنجاح`
    });
  } catch (error) {
    console.error('Error bulk updating availability:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}