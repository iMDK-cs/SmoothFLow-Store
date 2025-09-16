# 📁 دليل رفع المشروع لـ GitHub

## الخطوة 1: إنشاء Repository على GitHub

1. **اذهب إلى**: [github.com](https://github.com)
2. **سجل دخول** أو أنشئ حساب جديد
3. **اضغط "New repository"** (الزر الأخضر)
4. **املأ البيانات**:
   - Repository name: `pc-services-website`
   - Description: `SmoothFlow PC Services - Complete e-commerce platform`
   - اختر "Public" أو "Private"
   - **لا تضع علامة** على "Initialize with README"
5. **اضغط "Create repository"**

## الخطوة 2: ربط المشروع بـ GitHub

```bash
# إضافة remote repository
git remote add origin https://github.com/YOUR_USERNAME/pc-services-website.git

# تغيير اسم الفرع الرئيسي
git branch -M main

# رفع المشروع
git push -u origin main
```

## الخطوة 3: استبدال YOUR_USERNAME

في الأمر أعلاه، استبدل `YOUR_USERNAME` باسم المستخدم الحقيقي في GitHub.

## الخطوة 4: تأكيد الرفع

بعد الرفع، ستجد:
- ✅ **116 ملف** تم رفعها
- ✅ **29,448 سطر** من الكود
- ✅ **جميع الملفات** محمية بـ .gitignore

## الخطوة 5: التحقق من الرفع

1. **اذهب إلى repository** على GitHub
2. **تأكد من وجود جميع الملفات**
3. **تحقق من أن .env.local غير موجود** (محمي)

## 🔄 التعديلات المستقبلية

### لإضافة تعديلات جديدة:
```bash
# إضافة التعديلات
git add .

# إنشاء commit
git commit -m "وصف التعديل"

# رفع التعديلات
git push
```

### سرعة التحديث:
- **التعديلات البسيطة**: 30 ثانية
- **التعديلات المعقدة**: 1-2 دقيقة
- **إضافة ميزات جديدة**: 2-5 دقائق

## ✅ الملفات المحمية

الملفات التالية **لن تُرفع** لـ GitHub (محمية):
- `.env.local` - متغيرات البيئة
- `node_modules/` - مكتبات Node.js
- `.next/` - ملفات Next.js المؤقتة
- `*.db` - قواعد البيانات
- `.vscode/` - إعدادات VS Code

## 🎯 الخطوة التالية

بعد رفع المشروع لـ GitHub:
1. **اذهب إلى Vercel.com**
2. **اربط المشروع** مع GitHub
3. **انشر الموقع** عالمياً

**موقعك سيكون متاحاً عالمياً في دقائق! 🚀**