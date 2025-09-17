# دليل النشر على Vercel

## المشكلة الحالية
```
Environment Variable "DATABASE_URL" references Secret "database_url", which does not exist.
```

## الحلول المتاحة

### الحل الأول: استخدام Supabase (مُوصى به)

1. **اذهب إلى [supabase.com](https://supabase.com)**
2. **أنشئ حساب جديد أو سجل الدخول**
3. **أنشئ مشروع جديد:**
   - اختر اسم للمشروع
   - اختر كلمة مرور قوية
   - اختر المنطقة الأقرب (Frankfurt للشرق الأوسط)
4. **احصل على DATABASE_URL:**
   - اذهب إلى Settings > Database
   - انسخ Connection string
   - استبدل `[YOUR-PASSWORD]` بكلمة المرور التي اخترتها

5. **أضف المتغيرات في Vercel:**
   - اذهب إلى Vercel Dashboard
   - اختر مشروعك
   - اذهب إلى Settings > Environment Variables
   - أضف المتغيرات التالية:

```
DATABASE_URL = postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres
NEXTAUTH_SECRET = [RANDOM-STRING-32-CHARACTERS]
NEXTAUTH_URL = https://smoothflow-store-web.vercel.app
```

6. **إعداد قاعدة البيانات:**
   ```bash
   # في Vercel، أضف Build Command:
   npm run build && npx prisma migrate deploy && npx prisma generate
   ```

### الحل الثاني: استخدام Railway

1. **اذهب إلى [railway.app](https://railway.app)**
2. **أنشئ مشروع جديد**
3. **أضف PostgreSQL database**
4. **احصل على DATABASE_URL**
5. **أضف المتغيرات في Vercel**

### الحل الثالث: استخدام PlanetScale

1. **اذهب إلى [planetscale.com](https://planetscale.com)**
2. **أنشئ حساب جديد**
3. **أنشئ قاعدة بيانات جديدة**
4. **احصل على Connection string**
5. **أضف المتغيرات في Vercel**

## خطوات إضافية

### 1. إعداد Prisma
```bash
# في Vercel، أضف Build Command:
npm run build && npx prisma migrate deploy && npx prisma generate
```

### 2. إعداد NextAuth
```bash
# أنشئ NEXTAUTH_SECRET عشوائي:
openssl rand -base64 32
```

### 3. إعداد البريد الإلكتروني (اختياري)
```
EMAIL_SERVER_HOST=smtp.gmail.com
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER=your-email@gmail.com
EMAIL_SERVER_PASSWORD=your-app-password
EMAIL_FROM=your-email@gmail.com
```

## بعد إضافة المتغيرات

1. **اذهب إلى Deployments**
2. **اضغط على "Redeploy"**
3. **انتظر حتى يكتمل النشر**

## استكشاف الأخطاء

إذا استمرت المشكلة:
1. تأكد من صحة DATABASE_URL
2. تأكد من أن قاعدة البيانات متاحة من الإنترنت
3. تحقق من إعدادات Firewall
4. تأكد من صحة NEXTAUTH_SECRET

## الدعم

إذا واجهت مشاكل، تواصل معي على:
- X (Twitter): @MDK7_
- أو أرسل رسالة هنا