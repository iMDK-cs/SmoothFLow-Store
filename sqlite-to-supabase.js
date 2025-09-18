const { createClient } = require('@supabase/supabase-js')
const Database = require('better-sqlite3')
const fs = require('fs')

// إعدادات Supabase
const supabaseUrl = 'https://megpayzkgmuoncswuasn.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1lZ3BheXprZ211b25jc3d1YXNuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODAyMTI2OSwiZXhwIjoyMDczNTk3MjY5fQ.ztPWUXITEp2pRMQRCVYn-z1PKDAOgY4tIhUqiEitYsA'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

const dbPath = './prisma/dev.db'
const db = new Database(dbPath)

async function getSupabaseColumns(tableName) {
  try {
    // محاولة جلب سجل واحد لمعرفة أسماء الأعمدة
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .limit(1)
    
    if (error) {
      console.log(`خطأ في جلب أعمدة ${tableName}:`, error.message)
      return null
    }
    
    // إنشاء سجل تجريبي لمعرفة البنية
    const { data: insertData, error: insertError } = await supabase
      .from(tableName)
      .insert([{}])
      .select()
    
    if (insertError) {
      // استخراج أسماء الأعمدة من رسالة الخطأ
      const errorMsg = insertError.message
      console.log(`رسالة خطأ ${tableName}:`, errorMsg)
      
      // حذف السجل التجريبي إن وُجد
      if (insertData && insertData.length > 0) {
        await supabase.from(tableName).delete().eq('id', insertData[0].id)
      }
    }
    
    return data
  } catch (error) {
    console.error(`خطأ في فحص جدول ${tableName}:`, error.message)
    return null
  }
}

async function migrateServices() {
  console.log('نقل الخدمات مع إدراج مباشر...')
  
  const services = db.prepare('SELECT * FROM services').all()
  console.log(`وُجد ${services.length} خدمة`)
  
  for (const service of services) {
    try {
      // استخدام أسماء الأعمدة كما هي في Prisma schema
      const { error } = await supabase
        .from('services')
        .upsert([{
          id: service.id,
          title: service.title,
          description: service.description,
          basePrice: service.basePrice,  // كما في schema
          category: service.category,
          image: service.image,
          icon: service.icon,
          color: service.color,
          popular: service.popular === 1,
          active: service.active === 1,
          available: service.available === 1 || true,
          stock: service.stock,
          createdAt: new Date(service.createdAt).toISOString(),
          updatedAt: new Date(service.updatedAt).toISOString()
        }])
      
      if (error) {
        console.error(`خطأ في ${service.title}:`, error.message)
      } else {
        console.log(`تم نقل: ${service.title}`)
      }
    } catch (err) {
      console.error(`خطأ عام في ${service.title}:`, err.message)
    }
  }
}

async function migrateUsers() {
  console.log('\nنقل المستخدمين...')
  
  const users = db.prepare('SELECT * FROM users').all()
  console.log(`وُجد ${users.length} مستخدم`)
  
  for (const user of users) {
    try {
      const { error } = await supabase
        .from('users')
        .upsert([{
          id: user.id,
          email: user.email,
          name: user.name,
          phone: user.phone,
          password: user.password,
          role: user.role,
          verified: user.verified === 1,
          createdAt: new Date(user.createdAt).toISOString(),
          updatedAt: new Date(user.updatedAt).toISOString()
        }])
      
      if (error) {
        console.error(`خطأ في ${user.email}:`, error.message)
      } else {
        console.log(`تم نقل: ${user.email}`)
      }
    } catch (err) {
      console.error(`خطأ عام في ${user.email}:`, err.message)
    }
  }
}

async function migrateServiceOptions() {
  console.log('\nنقل خيارات الخدمات...')
  
  const serviceOptions = db.prepare('SELECT * FROM service_options').all()
  console.log(`وُجد ${serviceOptions.length} خيار`)
  
  for (const option of serviceOptions) {
    try {
      const { error } = await supabase
        .from('service_options')
        .upsert([{
          id: option.id,
          serviceId: option.serviceId,  // كما في schema
          title: option.title,
          description: option.description,
          price: option.price,
          active: option.active === 1
        }])
      
      if (error) {
        console.error(`خطأ في ${option.title}:`, error.message)
      } else {
        console.log(`تم نقل خيار: ${option.title}`)
      }
    } catch (err) {
      console.error(`خطأ عام في ${option.title}:`, err.message)
    }
  }
}

async function testConnection() {
  console.log('اختبار نهائي...')
  
  const { data: testService } = await supabase
    .from('services')
    .select('*')
    .eq('id', 'internet-tweak')
    .single()
  
  if (testService) {
    console.log(`نجح الاختبار - تم العثور على: ${testService.title}`)
    return true
  } else {
    console.log('فشل العثور على خدمة internet-tweak')
    
    // عرض الخدمات الموجودة
    const { data: allServices } = await supabase
      .from('services')
      .select('id, title')
      .limit(10)
    
    if (allServices && allServices.length > 0) {
      console.log('الخدمات الموجودة:')
      allServices.forEach(s => console.log(`- ${s.id}: ${s.title}`))
    } else {
      console.log('لا توجد خدمات في قاعدة البيانات')
    }
    return false
  }
}

async function main() {
  console.log('بدء عملية النقل المحسنة...\n')
  
  try {
    await migrateServices()
    await migrateUsers() 
    await migrateServiceOptions()
    
    const success = await testConnection()
    
    if (success) {
      console.log('\nتمت عملية النقل بنجاح!')
    } else {
      console.log('\nفشلت عملية النقل - يرجى مراجعة الأخطاء أعلاه')
    }
    
  } catch (error) {
    console.error('خطأ عام:', error)
  } finally {
    db.close()
    process.exit(0)
  }
}

main()