# 🔑 إعداد مفاتيح Stripe - خطوة بخطوة

## الخطوة 1: إنشاء حساب Stripe
1. اذهب إلى [stripe.com](https://stripe.com)
2. اضغط "Sign up" أو "Get started"
3. املأ البيانات المطلوبة
4. تأكد من البريد الإلكتروني

## الخطوة 2: الحصول على المفاتيح
1. بعد تسجيل الدخول، اذهب إلى Dashboard
2. اضغط على "Developers" في القائمة الجانبية
3. اضغط على "API keys"
4. ستجد:
   - **Publishable key**: `pk_test_...` (للاختبار)
   - **Secret key**: `sk_test_...` (للاختبار)

## الخطوة 3: إضافة المفاتيح للمشروع
1. افتح ملف `.env.local` في المشروع
2. أضف هذه الأسطر:

```bash
# Stripe Configuration
STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
STRIPE_SECRET_KEY=sk_test_your_secret_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
```

## الخطوة 4: اختبار الدفع
1. استخدم بطاقة اختبار: `4242 4242 4242 4242`
2. تاريخ انتهاء: أي تاريخ مستقبلي
3. CVC: أي 3 أرقام

## الخطوة 5: للانتقال للإنتاج
1. في Stripe Dashboard، اضغط "Activate your account"
2. املأ البيانات المطلوبة
3. احصل على المفاتيح الحقيقية:
   - `pk_live_...` (للإنتاج)
   - `sk_live_...` (للإنتاج)

## ⚠️ تحذيرات مهمة:
- **لا تشارك المفاتيح السرية أبداً**
- **استخدم Test Mode للتطوير**
- **استخدم Live Mode للإنتاج فقط**
- **احتفظ بنسخة احتياطية من المفاتيح**