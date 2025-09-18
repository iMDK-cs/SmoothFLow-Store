const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://megpayzkgmuoncswuasn.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1lZ3BheXprZ211b25jc3d1YXNuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgwMjEyNjksImV4cCI6MjA3MzU5NzI2OX0.eDfDnIUZIzcbgKIXgV8TP8Uwe9DWwqzQv9wDaYpqHgY'

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkDatabase() {
  try {
    console.log('🔍 جاري فحص قاعدة البيانات...')
    
    // 1. فحص الاتصال
    const { data, error } = await supabase
      .from('services')
      .select('count')
      .limit(1)
    
    if (error) {
      console.error('❌ خطأ في الاتصال:', error)
      return false
    }
    
    console.log('✅ الاتصال بقاعدة البيانات ناجح')
    
    // 2. فحص عدد الخدمات
    const { count, error: countError } = await supabase
      .from('services')
      .select('*', { count: 'exact', head: true })
    
    if (countError) {
      console.error('❌ خطأ في عد الخدمات:', countError)
    } else {
      console.log(`📊 عدد الخدمات الموجودة: ${count}`)
    }
    
    // 3. فحص الخدمات المحددة
    const serviceIds = [
      'internet-tweak',
      'gpu-oc', 
      'gaming-windows',
      'windows-tweaking',
      'ram-oc'
    ]
    
    for (const serviceId of serviceIds) {
      const { data: service, error: serviceError } = await supabase
        .from('services')
        .select('id, title')
        .eq('id', serviceId)
        .single()
      
      if (serviceError) {
        console.log(`❌ الخدمة ${serviceId} غير موجودة`)
      } else {
        console.log(`✅ الخدمة ${serviceId}: ${service.title}`)
      }
    }
    
    return true
    
  } catch (error) {
    console.error('💥 خطأ عام:', error)
    return false
  }
}

// تشغيل الفحص
checkDatabase().then(success => {
  if (success) {
    console.log('🎉 قاعدة البيانات تعمل بشكل صحيح!')
  } else {
    console.log('❌ يوجد مشاكل في قاعدة البيانات')
  }
  process.exit(0)
})