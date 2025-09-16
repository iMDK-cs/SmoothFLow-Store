# دليل النشر - موقع خدمات الكمبيوتر

## 🚀 خطوات النشر

### 1. إعداد البيئة
```bash
# نسخ ملف البيئة
cp .env.example .env.local

# تحديث المتغيرات
NEXTAUTH_URL=https://yourdomain.com
NEXTAUTH_SECRET=your-secret-key
DATABASE_URL=your-production-database-url
STRIPE_PUBLIC_KEY=your-stripe-public-key
STRIPE_SECRET_KEY=your-stripe-secret-key
```

### 2. إعداد قاعدة البيانات
```bash
# توليد Prisma Client
npm run db:generate

# تطبيق التغييرات على قاعدة البيانات
npm run db:push

# إضافة البيانات الأولية
npm run db:seed
```

### 3. بناء المشروع
```bash
# بناء المشروع للإنتاج
npm run build

# تشغيل الخادم
npm start
```

## 🔧 متطلبات الخادم

### الحد الأدنى:
- Node.js 18+
- 1GB RAM
- 10GB Storage

### الموصى به:
- Node.js 20+
- 2GB RAM
- 20GB Storage
- SSD Storage

## 🌐 خيارات النشر

### 1. Vercel (موصى به)
```bash
# تثبيت Vercel CLI
npm i -g vercel

# نشر المشروع
vercel

# ربط بمستودع Git
vercel --prod
```

### 2. Netlify
```bash
# بناء المشروع
npm run build

# رفع مجلد .next
```

### 3. خادم VPS
```bash
# تثبيت PM2
npm i -g pm2

# تشغيل التطبيق
pm2 start npm --name "pc-services" -- start

# حفظ إعدادات PM2
pm2 save
pm2 startup
```

## 🔒 الأمان

### 1. HTTPS
- تأكد من تفعيل SSL
- استخدام Let's Encrypt

### 2. متغيرات البيئة
- لا تشارك ملف .env
- استخدم متغيرات البيئة الآمنة

### 3. قاعدة البيانات
- استخدم قاعدة بيانات محمية
- قم بعمل نسخ احتياطية دورية

## 📊 المراقبة

### 1. Google Analytics
- إضافة Google Analytics
- تتبع الأحداث المهمة

### 2. Error Tracking
- إضافة Sentry أو مشابه
- مراقبة الأخطاء

### 3. Performance
- مراقبة سرعة التحميل
- تحسين الصور

## 🧪 الاختبار

### 1. اختبار الوظائف
- [ ] تسجيل الدخول/الخروج
- [ ] إضافة للسلة
- [ ] إنشاء طلب
- [ ] الدفع
- [ ] لوحة الإدارة

### 2. اختبار الأجهزة
- [ ] الهاتف
- [ ] التابلت
- [ ] الكمبيوتر

### 3. اختبار المتصفحات
- [ ] Chrome
- [ ] Firefox
- [ ] Safari
- [ ] Edge

## 📈 التحسينات المستقبلية

### 1. الأداء
- تحسين الصور
- إضافة CDN
- تحسين SEO

### 2. الميزات
- إضافة المزيد من طرق الدفع
- تحسين نظام الإشعارات
- إضافة تقييمات العملاء

### 3. الأمان
- إضافة 2FA
- تحسين أمان API
- إضافة rate limiting

## 🆘 الدعم

للحصول على المساعدة:
- 📧 البريد الإلكتروني: support@yourdomain.com
- 📱 الهاتف: +966-XX-XXX-XXXX
- 💬 الدردشة المباشرة: متوفرة في الموقع