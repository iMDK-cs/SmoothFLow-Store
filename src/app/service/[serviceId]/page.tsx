'use client';

import { useState, useEffect, use } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/contexts/CartContext';
import Link from 'next/link';
import Image from 'next/image';

// Enhanced Service interface with additional fields
interface ServiceDetail {
  id: string;
  title: string;
  description: string;
  fullDescription: string;
  price: string;
  originalPrice?: string;
  image: string;
  serviceImage?: string;
  popular?: boolean;
  rating: number;
  discount?: number;
  color: string;
  addon?: string;
  optional?: boolean;
  estimatedTime: string;
  features: string[];
  images: string[];
  addOns?: Array<{
    id: string;
    name: string;
    description: string;
    price: number;
    optional: boolean;
  }>;
  options?: Array<{
    id: string;
    title: string;
    price: string;
    description: string;
  }>;
}

// Service data with enhanced details
const enhancedServicesData: Record<string, ServiceDetail> = {
  'ready-builds': {
    id: 'ready-builds',
    title: 'تجميعات PC جاهزة',
    description: 'تجميعات متنوعة للألعاب والعمل',
    fullDescription: 'نقدم تجميعات PC احترافية جاهزة للاستخدام الفوري، مصممة خصيصاً لتلبية احتياجاتك المختلفة.',
    price: '0',
    image: '🖥️',
    serviceImage: '/images/services/ready-builds.jpg',
    popular: true,
    rating: 5,
    color: 'from-sky-400 to-sky-500',
    estimatedTime: '',
    features: [
      'تجميع احترافي',    
      'اختبار شامل للأداء والاستقرار',
      'تثبيت النظام والبرامج الأساسية',
    ],
    images: [
      '/images/services/ready-builds.jpg',
      
    ],
    addOns: [
      {
        id: 'express-service',
        name: 'خدمة سريعة',
        description: 'تجميع وتركيب في وقت اسرع ',
        price: 50,
        optional: true
      }
    ]
  },
  'water-cooling': {
    id: 'water-cooling',
    title: 'تركيب مبرد مائي',
    description: 'تركيب بي سي بمبرد مائي',
    fullDescription: 'تركيب نظام تبريد مائي احترافي لضمان أداء مثالي وهدوء تام. مناسب للألعاب والاستخدامات الثقيلة.',
    price: '150',
    image: 'مائي',
    serviceImage: '/images/services/water-cooling.jpg',
    rating: 5,
    color: 'from-sky-500 to-sky-600',
    estimatedTime: '3-4 ساعات',
    features: [
      'تركيب نظام تبريد مائي كامل',
      'اختبار التسريب والأداء',
      'ضبط السرعات والتحكم',    
    ],
    images: [
      '/images/services/water-cooling.jpg'
    ],
    addOns: [
      {
        id: 'rgb-lighting',
        name: 'المراوح ',
        description: 'أكثر من 7 مراوح',
        price: 30,
        optional: true
      },
      {
        id: 'custom-tubing',
        name: 'كيابل RGB',
        description: 'كيابل مثل Lina li rgb',
        price: 20,
        optional: true
      }
    ]
  },
  'air-cooling': {
    id: 'air-cooling',
    title: 'تركيب مبرد هوائي',
    description: 'تركيب بي سي بمبرد هوائي',
    fullDescription: 'تركيب نظام تبريد هوائي عالي الجودة لضمان تبريد فعال وهادئ للمعالج والقطع الأخرى.',
    price: '100',
    image: '🌀',
    serviceImage: '/images/services/air-cooling.jpg',
    rating: 4.7,
    color: 'from-sky-500 to-sky-600',
    estimatedTime: '1-2 ساعات',
    features: [
      'تركيب مبرد هوائي احترافي',
      'اختبار درجات الحرارة',
      'ضبط السرعات',
    ],
    images: [
      '/images/services/air-cooling.jpg'
    ]
  },
  'custom-build': {
    id: 'custom-build',
    title: 'تركيب مخصص',
    description: 'تركيب قطع حسب الطلب مع ضبط الأداء',
    fullDescription: 'تجميع مخصص للكمبيوتر حسب مواصفاتك المحددة مع ضبط الأداء وتحسين الاستقرار.',
    price: '150-200',
    image: '🔧',
    serviceImage: '/images/services/custom-build.jpg',
    rating: 5,
    color: 'from-sky-400 to-sky-500',
    estimatedTime: '2-3 ساعات',
    features: [
      'تجميع حسب المواصفات المطلوبة',
      'ضبط الأداء والاستقرار',
      'اختبار شامل للمكونات',
    ],
    images: [
      '/images/services/custom-build.jpg'
    ],
    addOns: [
      {
        id: 'overclocking',
        name: 'رفع الأداء',
        description: 'كسر سرعة المعالج او الكرت ',
        price: 100,
        optional: true
      },
  
    ]
  },
  'Pc-check': {
    id: 'Pc-check',
    title: 'كشف وصيانة PC',
    description: 'فحص شامل وتشخيص دقيق لجميع المكونات',
    fullDescription: 'فحص شامل وتشخيص دقيق لجميع مكونات الكمبيوتر لتحديد المشاكل وإصلاحها بأعلى جودة.',
    price: '50-100',
    image: '⚠️',
    serviceImage: '/images/services/diagnosis.jpg',
    popular: true,
    rating: 4.9,
    color: 'from-sky-500 to-sky-600',
    estimatedTime: '1-3 ساعات',
    features: [
      'فحص شامل لجميع المكونات',
      'تشخيص دقيق للمشاكل',
      'تقرير مفصل عن الحالة',
      'اقتراحات للإصلاح',
    ],
    images: [
      '/images/services/diagnosis.jpg'
    ]
  },
  'windows-format': {
    id: 'windows-format',
    title: 'فورمات النظام',
    description: 'تهيئة وإعادة تثبيت الويندوز مع التعريفات',
    fullDescription: 'فورمات كامل للنظام مع إعادة تثبيت الويندوز والتعريفات والبرامج الأساسية.',
    price: '30',
    image: '🔄️',
    serviceImage: '/images/services/format.png',
    rating: 4.6,
    color: 'from-sky-500 to-sky-600',
    estimatedTime: '1-2 ساعات',
    features: [
      'فورمات كامل للنظام',
      'تثبيت الويندوز الأحدث',
      'تثبيت جميع التعريفات',
      'تثبيت البرامج الأساسية',
    ],
    images: [
      '/images/services/format.png'
    ]
  },
  'gpu-drivers': {
    id: 'gpu-drivers',
    title: 'تعديل درايفر الكرت GPU',
    description: 'حذف وتحديث تعريفات كرت الشاشة',
    fullDescription: 'حذف التعريفات القديمة وتثبيت أحدث تعريفات كرت الشاشة لضمان أفضل أداء.',
    price: '20',
    image: '🛠️',
    serviceImage: '/images/services/gpu-drivers.jpg',
    rating: 4.8,
    color: 'from-sky-500 to-sky-600',
    estimatedTime: '30-45 دقيقة',
    features: [
      'حذف التعريفات القديمة',
      'تثبيت أحدث التعريفات',
      'ضبط إعدادات الأداء',
      'اختبار الاستقرار',
    ],
    images: [
      '/images/services/gpu-drivers.jpg'
    ]
  },
  'thermal-paste': {
    id: 'thermal-paste',
    title: 'تغيير المعجون الحراري',
    description: 'تغيير المعجون الحراري للمعالج',
    fullDescription: 'تغيير المعجون الحراري للمعالج لتحسين التبريد وخفض درجات الحرارة.',
    price: '25',
    image: '🧊',
    serviceImage: '/images/services/thermal-paste.jpg',
    rating: 4.7,
    color: 'from-sky-500 to-sky-600',
    estimatedTime: '30-45 دقيقة',
    features: [
      'تنظيف البي سي ',
      'تغيير معجون حراري عالي الجودة',
      'اختبار درجات الحرارة',
    ],
    images: [
      '/images/services/thermal-paste.jpg'
    ]
  },
  'bios-update': {
    id: 'bios-update',
    title: 'تحديث البايوس',
    description: 'تحديث البايوس لأحدث إصدار بأمان',
    fullDescription: 'تحديث البايوس لأحدث إصدار بأمان لضمان الاستقرار والأداء الأمثل.',
    price: '30',
    image: '⚙️',
    serviceImage: '/images/services/bios-update.jpg',
    rating: 4.8,
    color: 'from-sky-500 to-sky-600',
    estimatedTime: '45-60 دقيقة',
    features: [
      'تحديث البايوس بأمان',
      'اختبار الاستقرار',
      'ضبط الإعدادات',
    ],
    images: [
      '/images/services/bios-update.jpg'
    ]
  },
  'bios-tweak': {
    id: 'bios-tweak',
    title: 'تويك للبايوس',
    description: 'تحسين أداء وفتح سرعة الرامات',
    fullDescription: 'تحسين أداء الرامات عبر ضبط إعدادات البايوس لرفع السرعة والاستقرار.',
    price: '50',
    image: '📈',
    serviceImage: '/images/services/bios-tweak.jpg',
    rating: 4.8,
    color: 'from-sky-500 to-sky-600',
    estimatedTime: '30-45 دقيقة',
    features: [
      'ضبط إعدادات الرام في البايوس',
      'رفع السرعة بأمان',
      'اختبار الاستقرار',
    ],
    images: [
      '/images/services/bios-tweak.jpg'
    ]
  },
  'windows-tweaking': {
    id: 'windows-tweaking',
    title: 'تويك الويندوز',
    description: 'تسريع وتحسين الويندوز',
    fullDescription: 'تحسين شامل لأداء الويندوز عبر إزالة البرامج غير الضرورية وتحسين الإعدادات.',
    price: '130',
    image: '⚙️',
    serviceImage: '/images/services/tweak.jpg?v=2',
    rating: 4.9,
    color: 'from-purple-500 to-purple-600',
    estimatedTime: '1-2 ساعات',
    features: [
      'إزالة البرامج غير الضرورية',
      'تحسين إعدادات النظام',
      'تسريع بدء التشغيل',
      'تحسين الأداء العام',
    ],
    images: [
      '/images/services/tweak.jpg?v=2'
    ],
    options: [
      { id: 'cmfqppnmm0001uajwp8623wcj', title: 'بدون فورمات', price: '100', description: 'تحسين الويندوز الحالي' },
      { id: 'cmfqppoa90003uajw80tu9k4h', title: 'مع فورمات', price: '130', description: 'تحسين + فورمات كامل للنظام' }
    ]
  },
  'gaming-windows': {
    id: 'gaming-windows',
    title: 'ويندوز الألعاب',
    description: 'ويندوز محسن خصيصاً للألعاب',
    fullDescription: 'ويندوز محسن خصيصاً للألعاب مع إزالة جميع البرامج غير الضرورية وتحسين الأداء.',
    price: '150',
    image: '⚙️',
    serviceImage: '/images/services/custom-windows1.jpg?v=2',
    rating: 4.7,
    color: 'from-purple-500 to-purple-600',
    estimatedTime: '2-3 ساعات',
    features: [
      'ويندوز محسن للألعاب',
      'إزالة البرامج غير الضرورية',
      'تحسين إعدادات الألعاب',
      'تسريع بدء التشغيل',
      'تحسين الأداء العام'
    ],
    images: [
      '/images/services/custom-windows1.jpg?v=2'
    ]
  },
  'controller-oc': {
    id: 'controller-oc',
    title: 'كسر سرعة القير',
    description: 'رفع أداء استجابة القير',
    fullDescription: 'رفع أداء سرعة استجابة القير لتحسين الأداء في الألعاب.',
    price: '30',
    image: '🎮',
    serviceImage: '/images/services/controller-oc.jpg',
    rating: 4.6,
    color: 'from-sky-500 to-sky-600',
    estimatedTime: '1-30 دقيقة',
    features: [
      'رفع سرعة استجابة القير',
      'اختبار الاستقرار',
    
    ],
    images: [
      '/images/services/controller-oc.jpg'
    ]
  },
  'internet-tweak': {
    id: 'internet-tweak',
    title: 'تويك الانترنت',
    description: 'تحسين أداء الانترنت',
    fullDescription: 'تحسين سرعة واستقرار الاتصال بالانترنت عبر ضبط إعدادات الشبكة.',
    price: '50',
    image: '🌐',
    serviceImage: '/images/services/Network.jpg?v=2',
    rating: 4.6,
    color: 'from-purple-500 to-purple-600',
    estimatedTime: '1-2 ساعات',
    features: [
      'تحسين إعدادات الشبكة',
      'ضبط DNS',
      'تحسين سرعة التحميل',
      'اختبار السرعة',
    ],
    images: [
      '/images/services/Network.jpg?v=2'
    ]
  }
};

export default function ServiceDetailPage({ params }: { params: Promise<{ serviceId: string }> }) {
  const { data: session } = useSession();
  const router = useRouter();
  const { addToCart } = useCart();
  const [service, setService] = useState<ServiceDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  const [selectedAddOns, setSelectedAddOns] = useState<Record<string, boolean>>({});
  const [quantity, setQuantity] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Unwrap the params Promise using React.use()
  const resolvedParams = use(params);

  useEffect(() => {
    const serviceData = enhancedServicesData[resolvedParams.serviceId];
    if (serviceData) {
      setService(serviceData);
    } else {
      router.push('/');
    }
    setLoading(false);
  }, [resolvedParams.serviceId, router]);

  const handleAddToCart = async () => {
    if (!session) {
      setNotification({ message: 'يجب تسجيل الدخول أولاً', type: 'info' });
      setTimeout(() => router.push('/auth/signin'), 1500);
      return;
    }

    if (!service) return;

    setIsAddingToCart(true);
    try {
      // Prepare cart item with selected options and add-ons
      // const cartItem = { // Removed unused variable
      //   serviceId: service.id,
      //   options: selectedOptions,
      //   addOns: Object.keys(selectedAddOns).filter(key => selectedAddOns[key]),
      //   quantity
      // };

      await addToCart(service.id, selectedOptions.serviceOption, quantity);
      
      setNotification({ 
        message: `تم إضافة ${service.title} إلى السلة بنجاح!`, 
        type: 'success' 
      });
    } catch {
      setNotification({ 
        message: 'حدث خطأ أثناء إضافة الخدمة إلى السلة', 
        type: 'error' 
      });
    } finally {
      setIsAddingToCart(false);
    }
  };

  const calculateTotalPrice = () => {
    if (!service) return 0;
    
    let basePrice = parseFloat(service.price.split('-')[0]) || 0;
    
    // Add selected option price
    if (service.options && selectedOptions.serviceOption) {
      const selectedOption = service.options.find(opt => opt.id === selectedOptions.serviceOption);
      if (selectedOption) {
        basePrice = parseFloat(selectedOption.price);
      }
    }
    
    // Add add-ons price
    Object.keys(selectedAddOns).forEach(addOnId => {
      if (selectedAddOns[addOnId] && service.addOns) {
        const addOn = service.addOns.find(ao => ao.id === addOnId);
        if (addOn) {
          basePrice += addOn.price;
        }
      }
    });
    
    return basePrice * quantity;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">الخدمة غير موجودة</h2>
          <Link href="/" className="text-blue-400 hover:text-blue-300">
            العودة للصفحة الرئيسية
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 py-8" dir="rtl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 space-x-reverse mb-8">
          <Link href="/" className="text-gray-400 hover:text-white transition-colors">
            الرئيسية
          </Link>
          <span className="text-gray-500">/</span>
          <span className="text-white">{service.title}</span>
        </nav>

        {/* Notification */}
        {notification && (
          <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg ${
            notification.type === 'success' ? 'bg-green-600' :
            notification.type === 'error' ? 'bg-red-600' : 'bg-blue-600'
          } text-white`}>
            {notification.message}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Service Images */}
          <div className="space-y-4">
            <div className="aspect-square bg-gray-800 rounded-lg overflow-hidden">
              <Image
                src={service.serviceImage || service.images[0] || '/images/services/ready-builds.jpg'}
                alt={service.title}
                width={600}
                height={600}
                className="w-full h-full object-cover"
              />
            </div>
            
            {service.images.length > 1 && (
              <div className="grid grid-cols-3 gap-2">
                {service.images.slice(1).map((image, index) => (
                  <div key={index} className="aspect-square bg-gray-800 rounded-lg overflow-hidden">
                    <Image
                      src={image}
                      alt={`${service.title} ${index + 2}`}
                      width={200}
                      height={200}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Service Details */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-white mb-4">{service.title}</h1>
              <p className="text-gray-300 text-lg leading-relaxed">{service.fullDescription}</p>
            </div>

            {/* Rating and Time */}
            <div className="flex items-center space-x-6 space-x-reverse">
              <div className="flex items-center space-x-1 space-x-reverse">
                <span className="text-yellow-400">★</span>
                <span className="text-white font-semibold">{service.rating}</span>
              </div>
              <div className="flex items-center space-x-2 space-x-reverse">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-gray-300">{service.estimatedTime}</span>
              </div>
            </div>

            {/* Features */}
            <div>
              <h3 className="text-xl font-semibold text-white mb-4">المميزات</h3>
              <ul className="space-y-2">
                {service.features.map((feature, index) => (
                  <li key={index} className="flex items-center space-x-3 space-x-reverse">
                    <svg className="w-5 h-5 text-green-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-300">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Service Options */}
            {service.options && service.options.length > 0 && (
              <div>
                <h3 className="text-xl font-semibold text-white mb-4">خيارات الخدمة</h3>
                <div className="space-y-3">
                  {service.options.map((option) => (
                    <label key={option.id} className="flex items-center space-x-3 space-x-reverse cursor-pointer">
                      <input
                        type="radio"
                        name="serviceOption"
                        value={option.id}
                        checked={selectedOptions.serviceOption === option.id}
                        onChange={(e) => setSelectedOptions({...selectedOptions, serviceOption: e.target.value})}
                        className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 focus:ring-blue-500"
                      />
                      <div className="flex-1">
                        <div className="flex justify-between items-center">
                          <span className="text-white font-medium">{option.title}</span>
                          <span className="text-blue-400 font-semibold">{option.price} ريال</span>
                        </div>
                        <p className="text-gray-400 text-sm">{option.description}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Add-ons */}
            {service.addOns && service.addOns.length > 0 && (
              <div>
                <h3 className="text-xl font-semibold text-white mb-4">إضافات اختيارية</h3>
                <div className="space-y-3">
                  {service.addOns.map((addOn) => (
                    <label key={addOn.id} className="flex items-center space-x-3 space-x-reverse cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedAddOns[addOn.id] || false}
                        onChange={(e) => setSelectedAddOns({...selectedAddOns, [addOn.id]: e.target.checked})}
                        className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                      />
                      <div className="flex-1">
                        <div className="flex justify-between items-center">
                          <span className="text-white font-medium">{addOn.name}</span>
                          <span className="text-blue-400 font-semibold">+{addOn.price} ريال</span>
                        </div>
                        <p className="text-gray-400 text-sm">{addOn.description}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity and Price */}
            <div className="bg-gray-800 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-white">الكمية</h3>
                <div className="flex items-center space-x-3 space-x-reverse">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center text-white hover:bg-gray-600 transition-colors"
                  >
                    -
                  </button>
                  <span className="text-white font-semibold w-8 text-center">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center text-white hover:bg-gray-600 transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between mb-6">
                <span className="text-2xl font-bold text-white">المجموع</span>
                <span className="text-3xl font-bold text-blue-400">{calculateTotalPrice()} ريال</span>
              </div>

              <button
                onClick={handleAddToCart}
                disabled={isAddingToCart}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isAddingToCart ? 'جاري الإضافة...' : 'أضف للسلة'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}