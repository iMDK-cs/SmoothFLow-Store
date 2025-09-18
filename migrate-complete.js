const { createClient } = require('@supabase/supabase-js')
const { PrismaClient } = require('@prisma/client')

// القيم الصحيحة من ملف .env
const supabaseUrl = 'https://megpayzkgmuoncswuasn.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1lZ3BheXprZ211b25jc3d1YXNuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgwMjEyNjksImV4cCI6MjA3MzU5NzI2OX0.eDfDnIUZIzcbgKIXgV8TP8Uwe9DWwqzQv9wDaYpqHgY'

const supabase = createClient(supabaseUrl, supabaseKey)
const prisma = new PrismaClient()

async function migrateAllData() {
  console.log('🚀 بدء نقل البيانات الكاملة إلى Supabase...\n')
  
  try {
    // 1. نقل المستخدمين
    console.log('👥 نقل المستخدمين...')
    const users = await prisma.user.findMany()
    
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
        console.error(`❌ خطأ في نقل المستخدم ${user.email}:`, error.message)
      } else {
        console.log(`✅ تم نقل المستخدم: ${user.email}`)
      }
    }
    
    // 2. نقل الخدمات
    console.log('\n🛠️ نقل الخدمات...')
    const services = await prisma.service.findMany()
    
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
        console.error(`❌ خطأ في نقل الخدمة ${service.title}:`, error.message)
      } else {
        console.log(`✅ تم نقل الخدمة: ${service.title}`)
      }
    }
    
    // 3. نقل خيارات الخدمات
    console.log('\n⚙️ نقل خيارات الخدمات...')
    const serviceOptions = await prisma.serviceOption.findMany()
    
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
        console.error(`❌ خطأ في نقل خيار ${option.title}:`, error.message)
      } else {
        console.log(`✅ تم نقل خيار: ${option.title}`)
      }
    }
    
    // 4. نقل الطلبات
    console.log('\n📋 نقل الطلبات...')
    const orders = await prisma.order.findMany()
    
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
        console.error(`❌ خطأ في نقل الطلب ${order.orderNumber}:`, error.message)
      } else {
        console.log(`✅ تم نقل الطلب: ${order.orderNumber}`)
      }
    }
    
    // 5. نقل عناصر الطلبات
    console.log('\n📦 نقل عناصر الطلبات...')
    const orderItems = await prisma.orderItem.findMany()
    
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
        console.error(`❌ خطأ في نقل عنصر الطلب:`, error.message)
      } else {
        console.log(`✅ تم نقل عنصر طلب`)
      }
    }
    
    // التحقق من النتائج
    console.log('\n🔍 فحص النتائج...')
    
    const { count: usersCount } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
    
    const { count: servicesCount } = await supabase
      .from('services')
      .select('*', { count: 'exact', head: true })
    
    const { count: ordersCount } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
    
    console.log(`\n📊 النتائج النهائية:`)
    console.log(`👥 المستخدمين: ${usersCount}`)
    console.log(`🛠️ الخدمات: ${servicesCount}`)
    console.log(`📋 الطلبات: ${ordersCount}`)
    
    console.log('\n🎉 تم نقل جميع البيانات بنجاح!')
    
  } catch (error) {
    console.error('💥 خطأ عام:', error)
  } finally {
    await prisma.$disconnect()
    process.exit(0)
  }
}

// تشغيل النقل
migrateAllData()