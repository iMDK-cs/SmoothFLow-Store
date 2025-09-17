// prisma/migrate-data.ts
import { PrismaClient } from '@prisma/client'
import Database from 'better-sqlite3'

const prismaPostgres = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
})

const sqliteDb = new Database('./dev.db')

async function migrateData() {
  try {
    console.log('بدء نقل البيانات...')

    // 1. نقل المستخدمين
    console.log('نقل المستخدمين...')
    const users = sqliteDb.prepare('SELECT * FROM users').all()
    
    for (const user of users) {
      await prismaPostgres.user.upsert({
        where: { id: user.id },
        update: {},
        create: {
          id: user.id,
          email: user.email,
          name: user.name,
          phone: user.phone,
          password: user.password,
          role: user.role as any,
          verified: Boolean(user.verified),
          createdAt: new Date(user.createdAt),
          updatedAt: new Date(user.updatedAt),
        }
      })
    }
    console.log(`تم نقل ${users.length} مستخدم`)

    // 2. نقل الخدمات
    console.log('نقل الخدمات...')
    const services = sqliteDb.prepare('SELECT * FROM services').all()
    
    for (const service of services) {
      await prismaPostgres.service.upsert({
        where: { id: service.id },
        update: {},
        create: {
          id: service.id,
          title: service.title,
          description: service.description,
          basePrice: service.basePrice,
          category: service.category,
          image: service.image,
          icon: service.icon,
          color: service.color,
          popular: Boolean(service.popular),
          active: Boolean(service.active),
          available: service.available !== undefined ? Boolean(service.available) : true,
          stock: service.stock,
          createdAt: new Date(service.createdAt),
          updatedAt: new Date(service.updatedAt),
        }
      })
    }
    console.log(`تم نقل ${services.length} خدمة`)

    // 3. نقل خيارات الخدمات
    console.log('نقل خيارات الخدمات...')
    const serviceOptions = sqliteDb.prepare('SELECT * FROM service_options').all()
    
    for (const option of serviceOptions) {
      await prismaPostgres.serviceOption.upsert({
        where: { id: option.id },
        update: {},
        create: {
          id: option.id,
          serviceId: option.serviceId,
          title: option.title,
          description: option.description,
          price: option.price,
          active: Boolean(option.active),
        }
      })
    }
    console.log(`تم نقل ${serviceOptions.length} خيار خدمة`)

    // 4. نقل الطلبات
    console.log('نقل الطلبات...')
    const orders = sqliteDb.prepare('SELECT * FROM orders').all()
    
    for (const order of orders) {
      await prismaPostgres.order.upsert({
        where: { id: order.id },
        update: {},
        create: {
          id: order.id,
          userId: order.userId,
          orderNumber: order.orderNumber,
          status: order.status as any,
          totalAmount: order.totalAmount,
          paymentStatus: order.paymentStatus as any,
          paymentMethod: order.paymentMethod,
          paymentId: order.paymentId,
          notes: order.notes,
          scheduledDate: order.scheduledDate ? new Date(order.scheduledDate) : null,
          createdAt: new Date(order.createdAt),
          updatedAt: new Date(order.updatedAt),
        }
      })
    }
    console.log(`تم نقل ${orders.length} طلب`)

    // 5. نقل عناصر الطلبات
    console.log('نقل عناصر الطلبات...')
    const orderItems = sqliteDb.prepare('SELECT * FROM order_items').all()
    
    for (const item of orderItems) {
      await prismaPostgres.orderItem.upsert({
        where: { id: item.id },
        update: {},
        create: {
          id: item.id,
          orderId: item.orderId,
          serviceId: item.serviceId,
          optionId: item.optionId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: item.totalPrice,
          notes: item.notes,
        }
      })
    }
    console.log(`تم نقل ${orderItems.length} عنصر طلب`)

    // 6. نقل المدفوعات (إذا وجدت)
    try {
      const payments = sqliteDb.prepare('SELECT * FROM payments').all()
      console.log('نقل المدفوعات...')
      
      for (const payment of payments) {
        await prismaPostgres.payment.upsert({
          where: { id: payment.id },
          update: {},
          create: {
            id: payment.id,
            orderId: payment.orderId,
            amount: payment.amount,
            currency: payment.currency || 'SAR',
            status: payment.status as any,
            method: payment.method,
            transactionId: payment.transactionId,
            gateway: payment.gateway,
            gatewayData: payment.gatewayData ? JSON.parse(payment.gatewayData) : null,
            createdAt: new Date(payment.createdAt),
            updatedAt: new Date(payment.updatedAt),
          }
        })
      }
      console.log(`تم نقل ${payments.length} مدفوعة`)
    } catch (error) {
      console.log('لا توجد مدفوعات للنقل أو حدث خطأ في نقل المدفوعات:', error.message)
    }

    // 7. نقل السلة والعربات (إذا وجدت)
    try {
      const carts = sqliteDb.prepare('SELECT * FROM carts').all()
      console.log('نقل العربات...')
      
      for (const cart of carts) {
        await prismaPostgres.cart.upsert({
          where: { id: cart.id },
          update: {},
          create: {
            id: cart.id,
            userId: cart.userId,
            createdAt: new Date(cart.createdAt),
            updatedAt: new Date(cart.updatedAt),
          }
        })
      }
      console.log(`تم نقل ${carts.length} عربة`)

      // نقل عناصر العربات
      const cartItems = sqliteDb.prepare('SELECT * FROM cart_items').all()
      
      for (const item of cartItems) {
        await prismaPostgres.cartItem.upsert({
          where: { 
            cartId_serviceId_optionId: {
              cartId: item.cartId,
              serviceId: item.serviceId,
              optionId: item.optionId
            }
          },
          update: {},
          create: {
            id: item.id,
            cartId: item.cartId,
            serviceId: item.serviceId,
            optionId: item.optionId,
            quantity: item.quantity,
            createdAt: new Date(item.createdAt),
            updatedAt: new Date(item.updatedAt),
          }
        })
      }
      console.log(`تم نقل ${cartItems.length} عنصر عربة`)
    } catch (error) {
      console.log('لا توجد عربات للنقل أو حدث خطأ:', error.message)
    }

    console.log('تم النقل بنجاح!')
    
  } catch (error) {
    console.error('خطأ في نقل البيانات:', error)
    throw error
  } finally {
    await prismaPostgres.$disconnect()
    sqliteDb.close()
  }
}

// تشغيل النقل
if (require.main === module) {
  migrateData()
    .catch((e) => {
      console.error(e)
      process.exit(1)
    })
}

export default migrateData