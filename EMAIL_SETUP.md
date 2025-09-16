# 📧 إعداد البريد الإلكتروني

## الخطوة 1: إعداد Gmail (مستحسن)

### 1.1 تفعيل المصادقة الثنائية
1. اذهب إلى [myaccount.google.com](https://myaccount.google.com)
2. اختر "الأمان" > "المصادقة الثنائية"
3. فعّل المصادقة الثنائية

### 1.2 إنشاء كلمة مرور التطبيق
1. اذهب إلى [myaccount.google.com](https://myaccount.google.com)
2. اختر "الأمان" > "كلمات مرور التطبيقات"
3. اختر "البريد الإلكتروني" و "الكمبيوتر"
4. انسخ كلمة المرور المولدة

## الخطوة 2: إضافة متغيرات البيئة

أضف هذه المتغيرات إلى ملف `.env.local`:

```bash
# Email Configuration
EMAIL_SERVER_HOST=smtp.gmail.com
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER=your-email@gmail.com
EMAIL_SERVER_PASSWORD=your-app-password
EMAIL_FROM=your-email@gmail.com
```

## الخطوة 3: خيارات أخرى

### 3.1 Outlook/Hotmail
```bash
EMAIL_SERVER_HOST=smtp-mail.outlook.com
EMAIL_SERVER_PORT=587
```

### 3.2 Yahoo
```bash
EMAIL_SERVER_HOST=smtp.mail.yahoo.com
EMAIL_SERVER_PORT=587
```

### 3.3 خادم SMTP مخصص
```bash
EMAIL_SERVER_HOST=your-smtp-server.com
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER=your-username
EMAIL_SERVER_PASSWORD=your-password
EMAIL_FROM=noreply@yourdomain.com
```

## الخطوة 4: اختبار الإعداد

1. أنشئ طلب جديد
2. تحقق من وصول إشعار تأكيد الطلب
3. قم بعملية دفع
4. تحقق من وصول إشعار تأكيد الدفع
5. أنشئ تذكرة دعم
6. تحقق من وصول إشعار التذكرة

## 📋 أنواع الإشعارات المتاحة

### ✅ إشعارات الطلبات
- تأكيد الطلب
- تحديث حالة الطلب
- إلغاء الطلب

### ✅ إشعارات الدفع
- تأكيد الدفع
- فشل الدفع
- استرداد المبلغ

### ✅ إشعارات الدعم الفني
- تأكيد التذكرة
- رد على التذكرة
- إغلاق التذكرة

## 🔧 استكشاف الأخطاء

### مشكلة: "Authentication failed"
- تأكد من كلمة مرور التطبيق وليس كلمة المرور العادية
- تأكد من تفعيل المصادقة الثنائية

### مشكلة: "Connection timeout"
- تأكد من رقم المنفذ (587 للـ TLS)
- تأكد من إعدادات الجدار الناري

### مشكلة: "Invalid credentials"
- تأكد من صحة البريد الإلكتروني
- تأكد من كلمة مرور التطبيق

## 📱 اختبار سريع

```bash
# اختبار إرسال بريد إلكتروني
curl -X POST http://localhost:3000/api/test-email \
  -H "Content-Type: application/json" \
  -d '{"to": "test@example.com", "subject": "Test", "message": "Hello"}'
```

## ⚠️ تحذيرات مهمة

- **لا تشارك كلمات مرور التطبيق**
- **استخدم كلمات مرور قوية**
- **فعّل المصادقة الثنائية دائماً**
- **احتفظ بنسخة احتياطية من الإعدادات**