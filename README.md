# PC Services Website

موقع خدمات أجهزة الكمبيوتر - نظام إدارة شامل لخدمات صيانة وتجميع أجهزة الكمبيوتر.

## المميزات

- 🔐 نظام مصادقة متكامل (تسجيل دخول/تسجيل)
- 🛒 سلة تسوق ذكية
- 📦 إدارة الطلبات
- 💳 دفع آمن عبر Stripe
- 📅 نظام حجز المواعيد
- ⭐ نظام التقييمات
- 🎧 دعم فني مباشر
- 👨‍💼 لوحة تحكم إدارية

## التقنيات المستخدمة

- **Frontend:** Next.js 15, React 18, TypeScript
- **Backend:** Next.js API Routes
- **Database:** PostgreSQL (Supabase)
- **Authentication:** NextAuth.js
- **Styling:** Tailwind CSS
- **ORM:** Prisma
- **Payments:** Stripe

## الإعداد المحلي

### 1. تثبيت المتطلبات

```bash
npm install
```

### 2. إعداد متغيرات البيئة

أنشئ ملف `.env.local` في المجلد الجذر:

```env
# Database
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@db.megpayzkgmuoncswuasn.supabase.co:5432/postgres"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"

# Supabase
NEXT_PUBLIC_SUPABASE_URL="https://megpayzkgmuoncswuasn.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key-here"
```

### 3. إعداد قاعدة البيانات

```bash
# دفع المخطط إلى قاعدة البيانات
npx prisma db push

# توليد Prisma Client
npx prisma generate

# إعداد البيانات الأولية
npm run db:setup
```

### 4. تشغيل المشروع

```bash
npm run dev
```

## النشر على Vercel

### 1. إعداد متغيرات البيئة على Vercel

اذهب إلى Vercel Dashboard → Settings → Environment Variables وأضف:

```
DATABASE_URL = postgresql://postgres:YOUR_PASSWORD@db.megpayzkgmuoncswuasn.supabase.co:5432/postgres
NEXTAUTH_URL = https://your-app-name.vercel.app
NEXTAUTH_SECRET = your-very-long-random-secret-key
```

### 2. النشر

```bash
# رفع التغييرات إلى GitHub
git add .
git commit -m "Deploy to Vercel"
git push origin main
```

Vercel سيقوم بنشر المشروع تلقائياً.

### 3. التحقق من الاتصال

بعد النشر، تحقق من الاتصال عبر:
`https://your-app.vercel.app/api/health`

## الأوامر المتاحة

```bash
npm run dev          # تشغيل في وضع التطوير
npm run build        # بناء المشروع للإنتاج
npm run start        # تشغيل في وضع الإنتاج
npm run lint         # فحص الكود
npm run db:push      # دفع المخطط إلى قاعدة البيانات
npm run db:generate  # توليد Prisma Client
npm run db:setup     # إعداد قاعدة البيانات
npm run db:seed      # إضافة بيانات تجريبية
```

## هيكل المشروع

```
src/
├── app/                 # صفحات Next.js
│   ├── api/            # API Routes
│   ├── auth/           # صفحات المصادقة
│   └── ...
├── components/         # مكونات React
├── lib/               # مكتبات مساعدة
├── types/             # تعريفات TypeScript
└── contexts/          # React Contexts
```

## استكشاف الأخطاء

### مشكلة "Internal server error" في التسجيل

1. تأكد من إعداد `DATABASE_URL` بشكل صحيح
2. تأكد من أن قاعدة البيانات متصلة
3. تحقق من سجلات Vercel Functions

### مشكلة الاتصال بقاعدة البيانات

1. تحقق من كلمة مرور Supabase
2. تأكد من أن قاعدة البيانات نشطة
3. تحقق من إعدادات Firewall في Supabase

## الدعم

للمساعدة والدعم، يرجى التواصل عبر:
- البريد الإلكتروني: support@example.com
- الهاتف: +966 50 123 4567

## الترخيص

هذا المشروع مرخص تحت رخصة MIT.
