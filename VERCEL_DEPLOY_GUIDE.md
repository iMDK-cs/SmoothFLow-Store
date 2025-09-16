# 🌐 دليل نشر الموقع على Vercel

## الخطوة 1: إنشاء حساب Vercel

1. **اذهب إلى**: [vercel.com](https://vercel.com)
2. **اضغط "Sign up"**
3. **اختر "Continue with GitHub"**
4. **سجل دخول** بحساب GitHub

## الخطوة 2: ربط المشروع

1. **في Vercel Dashboard**، اضغط "New Project"
2. **اختر repository** `pc-services-website`
3. **اضغط "Import"**

## الخطوة 3: إعداد المشروع

### إعدادات المشروع:
- **Framework Preset**: Next.js (سيتم اكتشافه تلقائياً)
- **Root Directory**: `./` (افتراضي)
- **Build Command**: `npm run build` (افتراضي)
- **Output Directory**: `.next` (افتراضي)

## الخطوة 4: إضافة متغيرات البيئة

### في صفحة المشروع:
1. **اضغط "Settings"**
2. **اضغط "Environment Variables"**
3. **أضف هذه المتغيرات**:

```bash
# NextAuth
NEXTAUTH_URL=https://your-domain.vercel.app
NEXTAUTH_SECRET=your-secret-key-here

# Database (استخدم Supabase أو PlanetScale)
DATABASE_URL=your-database-url

# Stripe
STRIPE_PUBLISHABLE_KEY=pk_live_your_key
STRIPE_SECRET_KEY=sk_live_your_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook

# Email
EMAIL_SERVER_HOST=smtp-mail.outlook.com
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER=SmoothFlowsa@outlook.com
EMAIL_SERVER_PASSWORD=your-app-password
EMAIL_FROM=SmoothFlowsa@outlook.com
```

## الخطوة 5: النشر

1. **اضغط "Deploy"**
2. **انتظر** حتى اكتمال النشر (2-5 دقائق)
3. **احصل على رابط الموقع** (مثل: `https://pc-services-website.vercel.app`)

## الخطوة 6: اختبار النشر

### بعد النشر:
1. **افتح الموقع** على الرابط الجديد
2. **اختبر جميع الوظائف**:
   - ✅ التسجيل وتسجيل الدخول
   - ✅ تصفح الخدمات
   - ✅ إضافة للسلة
   - ✅ إنشاء الطلبات
   - ✅ الدفع
   - ✅ لوحة الإدارة
   - ✅ البريد الإلكتروني

## 🔄 التحديثات التلقائية

### بعد رفع تعديلات لـ GitHub:
1. **Vercel يكتشف التعديلات** تلقائياً
2. **يبدأ البناء** تلقائياً
3. **ينشر التحديثات** تلقائياً
4. **الموقع يصبح محدث** في دقائق

### سرعة التحديث:
- **التعديلات البسيطة**: 1-2 دقيقة
- **التعديلات المعقدة**: 3-5 دقائق
- **إضافة ميزات جديدة**: 5-10 دقائق

## 📊 مراقبة الموقع

### في Vercel Dashboard:
- **Analytics**: إحصائيات الزوار
- **Functions**: مراقبة APIs
- **Logs**: سجلات الأخطاء
- **Domains**: إدارة النطاقات

## 🎯 الميزات المتاحة

### بعد النشر:
- 🌐 **موقع عالمي** - متاح 24/7
- ⚡ **سرعة عالية** - CDN عالمي
- 🔒 **HTTPS** - آمن ومحمي
- 📱 **متجاوب** - يعمل على جميع الأجهزة
- 🔄 **تحديثات تلقائية** - من GitHub

## ✅ اختبار شامل

### اختبر هذه الوظائف:
1. **الصفحة الرئيسية** - تحميل سريع
2. **التسجيل** - إنشاء حساب جديد
3. **تسجيل الدخول** - دخول للحساب
4. **تصفح الخدمات** - جميع الخدمات
5. **السلة** - إضافة وحذف منتجات
6. **الطلبات** - إنشاء طلب جديد
7. **الدفع** - عملية دفع آمنة
8. **البريد الإلكتروني** - تأكيدات الطلبات
9. **لوحة الإدارة** - إدارة الخدمات
10. **الدعم الفني** - دردشة وتذاكر

## 🎉 تهانينا!

**موقعك أصبح متاحاً عالمياً!**

- 🌐 **الرابط**: سيظهر في Vercel Dashboard
- 📧 **البريد**: SmoothFlowsa@outlook.com
- 💳 **الدفع**: Stripe
- 🛠️ **الإدارة**: لوحة إدارة شاملة

**الموقع جاهز لاستقبال العملاء! 🚀**