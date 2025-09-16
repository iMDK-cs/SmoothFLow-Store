# 🚀 إعداد شامل للموقع - SmoothFlow

## 📧 إعداد البريد الإلكتروني (SmoothFlowsa@outlook.com)

### الخطوة 1: تفعيل المصادقة الثنائية
1. اذهب إلى [account.microsoft.com](https://account.microsoft.com)
2. سجل دخول بحساب `SmoothFlowsa@outlook.com`
3. اضغط "Security" في القائمة الجانبية
4. اضغط "Advanced security options"
5. فعّل "Two-step verification"

### الخطوة 2: إنشاء كلمة مرور التطبيق
1. في نفس صفحة الأمان
2. اضغط "App passwords"
3. اختر "Mail" و "Outlook"
4. انسخ كلمة المرور المولدة (16 حرف)

### الخطوة 3: إضافة المفاتيح للمشروع
1. أنشئ ملف `.env.local` في مجلد المشروع
2. أضف هذه الأسطر:

```bash
# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret-key-here

# Database
DATABASE_URL="file:./dev.db"

# Stripe Configuration (Test Keys)
STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
STRIPE_SECRET_KEY=sk_test_your_secret_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# Email Configuration - SmoothFlowsa@outlook.com
EMAIL_SERVER_HOST=smtp-mail.outlook.com
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER=SmoothFlowsa@outlook.com
EMAIL_SERVER_PASSWORD=your-16-character-app-password
EMAIL_FROM=SmoothFlowsa@outlook.com
```

## 🔑 إعداد Stripe

### الخطوة 1: إنشاء حساب Stripe
1. اذهب إلى [stripe.com](https://stripe.com)
2. اضغط "Sign up"
3. املأ البيانات المطلوبة
4. تأكد من البريد الإلكتروني

### الخطوة 2: الحصول على المفاتيح
1. بعد تسجيل الدخول، اذهب إلى Dashboard
2. اضغط على "Developers" في القائمة الجانبية
3. اضغط على "API keys"
4. انسخ:
   - **Publishable key**: `pk_test_...`
   - **Secret key**: `sk_test_...`

### الخطوة 3: إضافة المفاتيح
أضف المفاتيح إلى ملف `.env.local` كما هو موضح أعلاه.

## 📁 إعداد Git ورفع المشروع

### الخطوة 1: إنشاء ملف .gitignore
أنشئ ملف `.gitignore` في مجلد المشروع:

```gitignore
# Dependencies
node_modules/
.pnp
.pnp.js

# Testing
coverage/

# Next.js
.next/
out/

# Production
build/
dist/

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Database
*.db
*.sqlite

# Logs
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Runtime data
pids
*.pid
*.seed
*.pid.lock

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db
```

### الخطوة 2: رفع المشروع لـ Git
```bash
# إضافة جميع الملفات
git add .

# إنشاء commit أول
git commit -m "Initial commit - SmoothFlow PC Services Website"

# إضافة remote repository (GitHub)
git remote add origin https://github.com/yourusername/pc-services-website.git

# رفع المشروع
git push -u origin main
```

### الخطوة 3: إنشاء repository على GitHub
1. اذهب إلى [github.com](https://github.com)
2. اضغط "New repository"
3. اسم المشروع: `pc-services-website`
4. اختر "Public" أو "Private"
5. لا تضع علامة على "Initialize with README"
6. اضغط "Create repository"
7. انسخ رابط الـ repository
8. استخدمه في الأمر `git remote add origin`

## 🌐 نشر الموقع على Vercel

### الخطوة 1: إنشاء حساب Vercel
1. اذهب إلى [vercel.com](https://vercel.com)
2. اضغط "Sign up"
3. اختر "Continue with GitHub"
4. سجل دخول بحساب GitHub

### الخطوة 2: ربط المشروع
1. في Vercel Dashboard، اضغط "New Project"
2. اختر repository `pc-services-website`
3. اضغط "Import"

### الخطوة 3: إضافة متغيرات البيئة
1. في صفحة المشروع، اضغط "Settings"
2. اضغط "Environment Variables"
3. أضف جميع المتغيرات من `.env.local`:
   - `NEXTAUTH_URL`
   - `NEXTAUTH_SECRET`
   - `DATABASE_URL`
   - `STRIPE_PUBLISHABLE_KEY`
   - `STRIPE_SECRET_KEY`
   - `STRIPE_WEBHOOK_SECRET`
   - `EMAIL_SERVER_HOST`
   - `EMAIL_SERVER_PORT`
   - `EMAIL_SERVER_USER`
   - `EMAIL_SERVER_PASSWORD`
   - `EMAIL_FROM`

### الخطوة 4: النشر
1. اضغط "Deploy"
2. انتظر حتى اكتمال النشر
3. احصل على رابط الموقع

## 🔄 التعديلات المستقبلية

### للتعديل على الموقع:
1. **عدل الكود** محلياً
2. **اختبر التعديلات** محلياً
3. **ارفع التعديلات** لـ Git:
   ```bash
   git add .
   git commit -m "وصف التعديل"
   git push
   ```
4. **Vercel يحدث الموقع** تلقائياً في دقائق

### سرعة التحديث:
- **التعديلات البسيطة**: 1-2 دقيقة
- **التعديلات المعقدة**: 5-10 دقائق
- **إضافة ميزات جديدة**: 10-30 دقيقة

## ✅ اختبار النشر

### بعد النشر:
1. **افتح الموقع** على الرابط الجديد
2. **اختبر جميع الوظائف**:
   - التسجيل وتسجيل الدخول
   - تصفح الخدمات
   - إضافة للسلة
   - إنشاء الطلبات
   - الدفع
   - لوحة الإدارة
3. **تحقق من البريد الإلكتروني**:
   - تأكيد الطلبات
   - تأكيد الدفع
   - تذاكر الدعم

## 🎉 تهانينا!

**موقعك أصبح متاحاً عالمياً!**

- 🌐 **رابط الموقع**: سيظهر في Vercel Dashboard
- 📧 **البريد الإلكتروني**: SmoothFlowsa@outlook.com
- 💳 **الدفع**: Stripe
- 🛠️ **الإدارة**: لوحة إدارة شاملة

**الموقع جاهز لاستقبال العملاء! 🚀**