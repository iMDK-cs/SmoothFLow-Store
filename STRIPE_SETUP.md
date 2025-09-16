# 🔑 إعداد مفاتيح Stripe

## الخطوة 1: إنشاء حساب Stripe
1. اذهب إلى [stripe.com](https://stripe.com)
2. أنشئ حساب جديد أو سجل الدخول
3. اذهب إلى Dashboard > Developers > API Keys

## الخطوة 2: الحصول على المفاتيح
### للاختبار (Test Mode):
- **Publishable Key**: `pk_test_...`
- **Secret Key**: `sk_test_...`

### للإنتاج (Live Mode):
- **Publishable Key**: `pk_live_...`
- **Secret Key**: `sk_live_...`

## الخطوة 3: إضافة المفاتيح إلى .env.local
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

## ⚠️ تحذيرات مهمة:
- **لا تشارك المفاتيح السرية أبداً**
- **استخدم Test Mode للتطوير**
- **استخدم Live Mode للإنتاج فقط**
- **احتفظ بنسخة احتياطية من المفاتيح**

## 🧪 بطاقات اختبار Stripe:
- **نجاح**: 4242 4242 4242 4242
- **فشل**: 4000 0000 0000 0002
- **3D Secure**: 4000 0025 0000 3155