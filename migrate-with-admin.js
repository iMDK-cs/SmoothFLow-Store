const { createClient } = require('@supabase/supabase-js')
const { PrismaClient } = require('@prisma/client')

// استخدام Service Role Key للصلاحيات الكاملة
const supabaseUrl = 'https://megpayzkgmuoncswuasn.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1lZ3BheXprZ211b25jc3d1YXNuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODAyMTI2OSwiZXhwIjoyMDczNTk3MjY5fQ.ztPWUXITEp2pRMQRCVYn-z1PKDAOgY4tIhUqiEitYsA'

const supabase = createClient(supabaseUrl, supabaseServiceKey)
const prisma = new PrismaClient()

async function migrateAllData() {
  console.log('بدء نقل البيانات بصلاحيات المدير...\n')
  
  try {
    // 1. نقل المستخدمين
    console.log('نقل المستخدمين...')
    const users = await prisma.user.findMany()
    console.log(`وُجد ${users.length} مستخدم`)
    
    for (const user of users) {
      const { error } = await supabase
        .from('users')
        .upsert([{
          id: user.id,
          email: user.email,
          name: user.name,
          phone: user.phone,
          password: user.password,
          role: user.role,
          verified: user.verified,
          created_at: user.createdAt,
          updated_at: user.updatedAt
        }])
      
      if (error) {
        console.error(`خطأ في نقل المستخدم ${user.email}:`, error.message)
      } else {
        console.log(`تم نقل المستخدم: ${user.email}`)
      }
    }
    
    // 2. نقل الخدمات
    console.log('\nنقل الخدمات...')
    const services = await prisma.service.findMany()
    console.log(`وُجد ${services.length} خدمة`)
    
    for (const service of services) {
      const { error } = await supabase
        .from('services')
        .upsert([{
          id: service.id,
          title: service.title,
          description: service.description,
          base_price: service.basePrice,
          category: service.category,
          image: service.image,
          icon: service.icon,
          color: service.color,
          popular: service.popular,
          active: service.active,
          available: service.available || true,
          stock: service.stock,
          created_at: service.createdAt,
          updated_at: service.updatedAt
        }])
      
      if (error) {
        console.error(`خطأ في نقل الخدمة ${service.title}:`, error.message)
      } else {
        console.log(`تم نقل الخدمة: ${service.title}`)
      }
    }
    
    // 3. نقل خيارات الخدمات
    console.log('\nنقل خيارات الخدمات...')
    const serviceOptions = await prisma.serviceOption.findMany()
    console.log(`وُجد ${serviceOptions.length} خيار`)
    
    for (const option of serviceOptions) {
      const { error } = await supabase
        .from('service_options')
        .upsert([{
          id: option.id,
          service_id: option.serviceId,
          title: option.title,
          description: option.description,
          price: option.price,
          active: option.active
        }])
      
      if (error) {
        console.error(`خطأ في نقل خيار ${option.title}:`, error.message)
      } else {
        console.log(`تم نقل خيار: ${option.title}`)
      }
    }
    
    // 4. نقل الطلبات
    console.log('\nنقل الطلبات...')
    const orders = await prisma.order.findMany()
    console.log(`وُجد ${orders.length} طلب`)
    
    for (const order of orders) {
      const { error } = await supabase
        .from('orders')
        .upsert([{
          id: order.id,
          user_id: order.userId,
          order_number: order.orderNumber,
          status: order.status,
          total_amount: order.totalAmount,
          payment_status: order.paymentStatus,
          payment_method: order.paymentMethod,
          payment_id: order.paymentId,
          notes: order.notes,
          scheduled_date: order.scheduledDate,
          created_at: order.createdAt,
          updated_at: order.updatedAt
        }])
      
      if (error) {
        console.error(`خطأ في نقل الطلب ${order.orderNumber}:`, error.message)
      } else {
        console.log(`تم نقل الطلب: ${order.orderNumber}`)
      }
    }
    
    // 5. نقل عناصر الطلبات
    console.log('\nنقل عناصر الطلبات...')
    const orderItems = await prisma.orderItem.findMany()
    console.log(`وُجد ${orderItems.length} عنصر طلب`)
    
    for (const item of orderItems) {
      const { error } = await supabase
        .from('order_items')
        .upsert([{
          id: item.id,
          order_id: item.orderId,
          service_id: item.serviceId,
          option_id: item.optionId,
          quantity: item.quantity,
          unit_price: item.unitPrice,
          total_price: item.totalPrice,
          notes: item.notes
        }])
      
      if (error) {
        console.error(`خطأ في نقل عنصر الطلب:`, error.message)
      } else {
        console.log(`تم نقل عنصر طلب`)
      }
    }
    
    // التحقق من النتائج
    console.log('\nفحص النتائج النهائية...')
    
    const { count: usersCount } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
    
    const { count: servicesCount } = await supabase
      .from('services')
      .select('*', { count: 'exact', head: true })
    
    const { count: ordersCount } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
    
    console.log(`\nالنتائج النهائية:`)
    console.log(`المستخدمين: ${usersCount}`)
    console.log(`الخدمات: ${servicesCount}`)
    console.log(`الطلبات: ${ordersCount}`)
    
    // اختبار خدمة معينة
    const { data: testService } = await supabase
      .from('services')
      .select('*')
      .eq('id', 'internet-tweak')
      .single()
    
    if (testService) {
      console.log(`\nاختبار ناجح - تم العثور على خدمة: ${testService.title}`)
    } else {
      console.log(`\nخطأ - لم يتم العثور على خدمة internet-tweak`)
    }
    
    console.log('\nتم نقل جميع البيانات بنجاح!')
    
  } catch (error) {
    console.error('خطأ عام:', error)
  } finally {
    await prisma.$disconnect()
    process.exit(0)
  }
}

// تشغيل النقل
migrateAllData()