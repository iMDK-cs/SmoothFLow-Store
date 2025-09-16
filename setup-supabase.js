// إعداد Supabase (قاعدة بيانات مجانية مع تحكم كامل)
const { createClient } = require('@supabase/supabase-js')

// 1. اذهب إلى https://supabase.com
// 2. أنشئ مشروع جديد
// 3. احصل على URL و API Key
const supabaseUrl = 'YOUR_SUPABASE_URL'
const supabaseKey = 'YOUR_SUPABASE_ANON_KEY'

const supabase = createClient(supabaseUrl, supabaseKey)

// 4. استيراد البيانات من SQLite إلى Supabase
async function migrateToSupabase() {
  try {
    console.log('بدء نقل البيانات إلى Supabase...')
    
    // قراءة البيانات من SQLite
    const { PrismaClient } = require('@prisma/client')
    const prisma = new PrismaClient()
    
    // جلب جميع الخدمات
    const services = await prisma.service.findMany()
    console.log(`تم العثور على ${services.length} خدمة`)
    
    // نقل الخدمات إلى Supabase
    for (const service of services) {
      const { data, error } = await supabase
        .from('services')
        .insert([{
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
          available: service.available,
          stock: service.stock,
          created_at: service.createdAt,
          updated_at: service.updatedAt
        }])
      
      if (error) {
        console.error('خطأ في نقل الخدمة:', service.title, error)
      } else {
        console.log('تم نقل الخدمة:', service.title)
      }
    }
    
    console.log('تم نقل جميع البيانات بنجاح!')
    
  } catch (error) {
    console.error('خطأ في نقل البيانات:', error)
  }
}

// تشغيل النقل
migrateToSupabase()