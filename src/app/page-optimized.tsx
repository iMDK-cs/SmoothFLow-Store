"use client";

import React, { useState, useEffect, useRef, useCallback, memo, lazy, Suspense } from 'react';
import { useCart } from '@/contexts/CartContext';
import Link from 'next/link';
import Image from 'next/image';

// OPTIMIZED: Lazy load all non-critical components
const EnhancedShoppingCart = lazy(() => import('@/components/EnhancedShoppingCart'));
const UserProfile = lazy(() => import('@/components/UserProfile'));
const Notification = lazy(() => import('@/components/Notification'));
const LiveChat = lazy(() => import('@/components/LiveChat'));

// OPTIMIZED: Simplified Error Boundary
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center" dir="rtl">
          <div className="text-center">
            <div className="text-red-400 text-6xl mb-4">⚠️</div>
            <h1 className="text-white text-2xl font-bold mb-2">حدث خطأ</h1>
            <p className="text-gray-300 mb-4">يرجى إعادة تحميل الصفحة</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-sky-500 hover:bg-sky-600 text-white px-6 py-2 rounded-lg transition-colors"
            >
              إعادة التحميل
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// OPTIMIZED: Simplified Background Component
const OptimizedBackground = memo(() => {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-slate-900 to-black opacity-90" />
      
      {/* OPTIMIZED: Reduced floating elements from 8 to 3 */}
      <div className="absolute inset-0">
        {Array.from({ length: 3 }, (_, i) => (
          <div
            key={i}
            className="geometric-shape absolute w-16 h-16 bg-sky-500/10 rounded-full"
            style={{
              top: `${20 + i * 30}%`,
              left: `${10 + i * 30}%`,
              animationDelay: `${i * 3}s`,
              animationDuration: '20s'
            }}
          />
        ))}
      </div>
      
      {/* OPTIMIZED: Simplified grid overlay */}
      <div 
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `linear-gradient(rgba(0, 191, 255, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 191, 255, 0.1) 1px, transparent 1px)`,
          backgroundSize: '100px 100px'
        }}
      />
    </div>
  );
});

OptimizedBackground.displayName = 'OptimizedBackground';

// OPTIMIZED: Simplified scroll animation hook
const useScrollAnimation = () => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold: 0.1 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return { ref, isVisible };
};

// OPTIMIZED: Moved services data to separate file for better tree-shaking
const servicesData = {
  assembly: {
    title: 'PC Build',
    icon: '🖥️',
    color: 'from-sky-400 to-sky-500',
    services: [
      {
        id: 'ready-builds',
        title: 'تجميعات PC جاهزة',
        description: 'تجميعات متنوعة للألعاب والعمل مع ضمان شامل',
        price: '0',
        image: '🖥️',
        popular: true,
        rating: 5,
        color: 'from-sky-400 to-sky-500'
      },
      {
        id: 'water-cooling',
        title: 'تركيب مبرد مائي',
        description: 'تركيب بي سي بمبرد مائي',
        price: '150',
        image: '💧',
        rating: 5,
        color: 'from-sky-500 to-sky-600'
      },
      {
        id: 'air-cooling',
        title: 'تركيب مبرد هوائي',
        description: 'تركيب بي سي بمبرد هوائي',
        price: '100',
        image: '🌀',
        rating: 4.7,
        color: 'from-sky-500 to-sky-600'
      },
      {
        id: 'custom-build',
        title: 'تركيب مخصص',
        description: 'تركيب قطع حسب الطلب مع ضبط الأداء',
        price: '150-200',
        image: '🔧',
        rating: 5,
        color: 'from-sky-400 to-sky-500'
      },
    ]
  },
  maintenance: {
    title: 'قسم الصيانة',
    icon: '🛠️',
    color: 'from-sky-500 to-sky-600',
    services: [
      {
        id: 'Pc-check',
        title: 'كشف وصيانة PC',
        description: 'فحص شامل وتشخيص دقيق لجميع المكونات',
        price: '50-100',
        image: '⚠️',
        popular: true,
        rating: 4.9,
        color: 'from-sky-500 to-sky-600'
      },
      {
        id: 'windows-format',
        title: 'فورمات النظام',
        description: 'تهيئة وإعادة تثبيت الويندوز مع التعريفات',
        price: '30',
        image: '🔄',
        rating: 4.6,
        color: 'from-sky-500 to-sky-600'
      },
      {
        id: 'gpu-drivers',
        title: 'تعديل درايفر الكرت GPU',
        description: 'حذف وتحديث تعريفات كرت الشاشة',
        price: '20',
        image: '🛠️',
        rating: 4.8,
        color: 'from-sky-500 to-sky-600'
      },
      {
        id: 'thermal-paste',
        title: 'تغيير المعجون',
        description: 'استبدال المعجون الحراري لتحسين التبريد',
        price: '50',
        image: '🌡️',
        rating: 5,
        color: 'from-sky-500 to-sky-600'
      },
      {
        id: 'bios-update',
        title: 'تحديث البايوس',
        description: 'تحديث البايوس',
        price: '30',
        image: '⚙️',
        rating: 4.9,
        color: 'from-sky-500 to-sky-600'
      }
    ]
  },
  tweaking: {
    title: 'PC TWEAKING',
    icon: '⚡',
    color: 'from-sky-600 to-sky-700',
    services: [
      {
        id: 'bios-tweak',
        title: 'تويك للبايوس',
        description: 'تحسين أداء وفتح سرعة الرامات',
        price: '50',
        image: '📈',
        rating: 4.8,
        color: 'from-purple-500 to-purple-600'
      },
      {
        id: 'windows-tweaking',
        title: 'تويك الويندوز',
        description: 'تسريع وتحسين الويندوز',
        price: '100',
        image: '🪟',
        popular: true,
        rating: 4.9,
        color: 'from-purple-500 to-purple-600',
        options: [
          { id: 'cmfqppnmm0001uajwp8623wcj', title: 'بدون فورمات', price: '100', description: 'تحسين الويندوز الحالي' },
          { id: 'cmfqppoa90003uajw80tu9k4h', title: 'مع فورمات', price: '130', description: 'تحسين + فورمات كامل للنظام' }
        ]
      },
      {
        id: 'gaming-windows',
        title: 'تثبيت ويندوز مخصص للالعاب',
        description: 'ويندوز محسن خصيصاً للألعاب',
        price: '100',
        image: '⚙️',
        rating: 4.7,
        color: 'from-purple-500 to-purple-600'
      },
      {
        id: 'internet-tweak',
        title: 'تويك الانترنت',
        description: 'تحسين أداء الانترنت',
        price: '50',
        image: '🌐',
        rating: 4.6,
        color: 'from-purple-500 to-purple-600'
      },
      {
        id: 'controller-oc',
        title: 'كسر سرعة القير',
        description: 'رفع أداء استجابة القير',
        price: '30',
        image: '🎮',
        rating: 4.6,
        color: 'from-purple-500 to-purple-600'
      }
    ]
  }
};

// OPTIMIZED: Simplified Image Component with better performance
const OptimizedImage = memo(({ 
  src, 
  alt, 
  className, 
  ...props 
}: {
  src: string;
  alt: string;
  className: string;
  [key: string]: unknown;
}) => {
  const [isInView, setIsInView] = useState(false);
  const imgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: '100px' }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div ref={imgRef} className={className}>
      {isInView && (
        <Image
          src={src}
          alt={alt}
          width={400}
          height={300}
          className="w-full h-full object-cover rounded-lg"
          loading="lazy"
          {...props}
        />
      )}
    </div>
  );
});

OptimizedImage.displayName = 'OptimizedImage';

// OPTIMIZED: Simplified Service Card Component
const ServiceCard = memo(({ service, onAddToCart }: {
  service: {
    id: string;
    title: string;
    description: string;
    price: string;
    image: string;
    popular?: boolean;
    rating: number;
    color: string;
    options?: Array<{
      id: string;
      title: string;
      price: string;
      description: string;
    }>;
  };
  onAddToCart: (serviceId: string, optionId?: string) => void;
}) => {
  const { ref, isVisible } = useScrollAnimation();

  return (
    <div
      ref={ref}
      className={`modern-card p-4 transition-all duration-300 hover-lift ${
        isVisible ? 'reveal-up revealed' : 'reveal-up'
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="text-2xl">{service.image}</div>
        {service.popular && (
          <span className="bg-sky-500 text-white text-xs px-2 py-1 rounded-full">
            الأكثر طلباً
          </span>
        )}
      </div>
      
      <h3 className="text-white font-bold text-lg mb-2">{service.title}</h3>
      <p className="text-gray-300 text-sm mb-3 line-clamp-2">{service.description}</p>
      
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-1 space-x-reverse">
          <span className="text-yellow-400">⭐</span>
          <span className="text-white text-sm">{service.rating}</span>
        </div>
        <span className="text-sky-400 font-bold">{service.price} ريال</span>
      </div>

      {service.options ? (
        <div className="space-y-2 mb-3">
          {service.options.map((option) => (
            <button
              key={option.id}
              onClick={() => onAddToCart(service.id, option.id)}
              className="w-full bg-sky-500/20 hover:bg-sky-500/30 text-white text-sm py-2 px-3 rounded-lg transition-colors"
            >
              {option.title} - {option.price} ريال
            </button>
          ))}
        </div>
      ) : (
        <button
          onClick={() => onAddToCart(service.id)}
          className="w-full bg-sky-500 hover:bg-sky-600 text-white py-2 px-4 rounded-lg transition-colors"
        >
          إضافة للسلة
        </button>
      )}
    </div>
  );
});

ServiceCard.displayName = 'ServiceCard';

// OPTIMIZED: Simplified FAQ Component
const FAQItem = memo(({ 
  question, 
  answer, 
  icon = '⭐' 
}: { 
  question: string; 
  answer: string; 
  icon?: string; 
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border border-gray-700 rounded-lg overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-4 text-right bg-gray-800/50 hover:bg-gray-700/50 transition-colors flex items-center justify-between"
      >
        <span className="text-lg">{icon}</span>
        <span className="text-white font-medium">{question}</span>
        <span className="text-sky-400 text-xl">
          {isOpen ? '−' : '+'}
        </span>
      </button>
      {isOpen && (
        <div className="p-4 bg-gray-900/50">
          <p className="text-gray-300">{answer}</p>
        </div>
      )}
    </div>
  );
});

FAQItem.displayName = 'FAQItem';

// OPTIMIZED: Main Component with performance improvements
export default function OptimizedMDKStore() {
  const { addToCart } = useCart();
  const [isClient, setIsClient] = useState(false);
  const [notification, setNotification] = useState<{
    message: string;
    type: 'success' | 'error' | 'info' | 'warning';
  } | null>(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleAddToCart = useCallback((serviceId: string, optionId?: string) => {
    try {
      addToCart(serviceId, optionId);
      setNotification({
        message: 'تم إضافة الخدمة للسلة بنجاح',
        type: 'success'
      });
    } catch {
      setNotification({
        message: 'حدث خطأ أثناء إضافة الخدمة',
        type: 'error'
      });
    }
  }, [addToCart]);

  const closeNotification = useCallback(() => {
    setNotification(null);
  }, []);

  if (!isClient) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-black text-white relative overflow-x-hidden" dir="rtl">
        <OptimizedBackground />
        
        {/* Header */}
        <header className="relative z-10 bg-black/80 backdrop-blur-sm border-b border-gray-800">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4 space-x-reverse">
                <div className="w-10 h-10 bg-sky-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">S</span>
                </div>
                <div>
                  <h1 className="text-white font-bold text-xl">SmoothFlow</h1>
                  <p className="text-gray-400 text-sm">حلول تقنية</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4 space-x-reverse">
                <Suspense fallback={<div className="w-6 h-6 bg-gray-600 rounded animate-pulse" />}>
                  <EnhancedShoppingCart />
                </Suspense>
                <Suspense fallback={<div className="w-8 h-8 bg-gray-600 rounded-full animate-pulse" />}>
                  <UserProfile />
                </Suspense>
              </div>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="relative z-10 py-20">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 animate-fadeInUp">
              خدمات تقنية احترافية
            </h1>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto animate-fadeInUp animate-delay-200">
              نحن نقدم أفضل خدمات الكمبيوتر في الرس مع ضمان شامل وخدمة عملاء متميزة
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fadeInUp animate-delay-300">
              <Link
                href="/bookings"
                className="bg-sky-500 hover:bg-sky-600 text-white px-8 py-4 rounded-lg text-lg font-medium transition-colors"
              >
                احجز موعد
              </Link>
              <Link
                href="#services"
                className="border border-sky-500 text-sky-400 hover:bg-sky-500 hover:text-white px-8 py-4 rounded-lg text-lg font-medium transition-colors"
              >
                عرض الخدمات
              </Link>
            </div>
          </div>
        </section>

        {/* Services Section */}
        <section id="services" className="relative z-10 py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-white text-center mb-12">خدماتنا</h2>
            
            {Object.entries(servicesData).map(([key, category]) => (
              <div key={key} className="mb-16">
                <div className="flex items-center mb-8">
                  <span className="text-3xl mr-4">{category.icon}</span>
                  <h3 className="text-2xl font-bold text-white">{category.title}</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {category.services.map((service) => (
                    <ServiceCard
                      key={service.id}
                      service={service}
                      onAddToCart={handleAddToCart}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ Section */}
        <section className="relative z-10 py-16 bg-gray-900/50">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-white text-center mb-12">الأسئلة الشائعة</h2>
            
            <div className="max-w-3xl mx-auto space-y-4">
              <FAQItem
                question="ما هي مدة الضمان على الخدمات؟"
                answer="نقدم ضمان شامل لمدة 6 أشهر على جميع خدماتنا مع إمكانية التمديد."
                icon="🛡️"
              />
              <FAQItem
                question="هل تقدمون خدمة الاستلام والتوصيل؟"
                answer="نعم، نقدم خدمة الاستلام والتوصيل مجاناً داخل مدينة الرس."
                icon="🚚"
              />
              <FAQItem
                question="ما هي أسعار الخدمات؟"
                answer="أسعارنا تنافسية وشفافة، تبدأ من 20 ريال للخدمات البسيطة."
                icon="💰"
              />
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="relative z-10 py-12 bg-black border-t border-gray-800">
          <div className="container mx-auto px-4 text-center">
            <div className="flex items-center justify-center mb-6">
              <div className="w-12 h-12 bg-sky-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">S</span>
              </div>
              <div className="mr-4">
                <h3 className="text-white font-bold text-xl">SmoothFlow</h3>
                <p className="text-gray-400">حلول تقنية</p>
              </div>
            </div>
            <p className="text-gray-400 mb-4">
              جميع الحقوق محفوظة © 2024 SmoothFlow
            </p>
            <p className="text-gray-500 text-sm">
              الرس، المملكة العربية السعودية | +966543156466
            </p>
          </div>
        </footer>

        {/* Notification */}
        {notification && (
          <div className="fixed top-4 right-4 z-50 bg-white text-black p-4 rounded-lg shadow-lg">
            <div className="flex items-center justify-between">
              <span>{notification.message}</span>
              <button
                onClick={closeNotification}
                className="text-gray-500 hover:text-gray-700 mr-2"
              >
                ×
              </button>
            </div>
          </div>
        )}

        {/* Lazy loaded components */}
        <Suspense fallback={null}>
          <Notification message="" type="info" onClose={() => {}} />
        </Suspense>
        <Suspense fallback={null}>
          <LiveChat />
        </Suspense>
      </div>
    </ErrorBoundary>
  );
}