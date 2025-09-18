"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo, memo } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/contexts/CartContext';
import { getUserFromSession } from '@/lib/auth';
import Link from 'next/link';
import Image from 'next/image';

// Import components with fallbacks
import EnhancedShoppingCart from '@/components/EnhancedShoppingCart';
import UserProfile from '@/components/UserProfile';
import ScrollProgress from '@/components/ScrollProgress';
import Notification from '@/components/Notification';
import LiveChat from '@/components/LiveChat';
import SupportChat from '@/components/SupportChat';

// Enhanced Error Boundary Component
class ErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ComponentType<{ error?: Error }> },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode; fallback?: React.ComponentType<{ error?: Error }> }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      const Fallback = this.props.fallback;
      if (Fallback) {
        return <Fallback error={this.state.error} />;
      }
      
      return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center" dir="rtl">
          <div className="text-center p-8">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h1 className="text-white text-2xl font-bold mb-2">حدث خطأ غير متوقع</h1>
            <p className="text-gray-400 mb-6">يرجى تحديث الصفحة والمحاولة مرة أخرى</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-sky-500 hover:bg-sky-600 text-white px-6 py-3 rounded-lg transition-colors"
            >
              تحديث الصفحة
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Enhanced Background Component
const EnhancedBackground = memo(() => {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-slate-900 to-black opacity-90" />
      
      {/* Floating geometric shapes */}
      <div className="absolute inset-0">
        {Array.from({ length: 8 }, (_, i) => (
          <div
            key={i}
            className="geometric-shape absolute"
            style={{
              width: `${60 + i * 10}px`,
              height: `${60 + i * 10}px`,
              top: `${10 + i * 10}%`,
              left: `${5 + i * 12}%`,
              animationDelay: `${i * 2}s`,
              animationDuration: `${15 + i * 2}s`
            }}
          />
        ))}
      </div>
      
      {/* Animated grid overlay */}
      <div 
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0, 191, 255, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 191, 255, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px'
        }}
      />
    </div>
  );
});

EnhancedBackground.displayName = 'EnhancedBackground';

// useScrollAnimation hook
const useScrollAnimation = ({ threshold = 0.1 } = {}) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [threshold]);

  return { ref, isVisible };
};

// Store Configuration
const storeConfig = {
  storeName: "SmoothFlow",
  tagline: "PC Services",
  logo: "/images/logo/store logo.png",
  contact: {
    email: "m7md.dk7@gmail.com",
    location: "الرس، المملكة العربية السعودية",
    whatsapp: "966543156466"
  }
};

// Image Configuration
const imageConfig = {
  categories: {
    assembly: "/images/categories/pc-biuld.jpg",
    maintenance: "/images/categories/pc-fix.jpg", 
    tweaking: "/images/categories/Pc-tweak.jpg"
  },
  services: {
    'ready-builds': "/images/services/ready-builds.jpg",
    'custom-build': "/images/services/custom-build.jpg",
    'water-cooling': "/images/services/water-cooling.jpg",
    'air-cooling': "/images/services/air-cooling.jpg",
    'diagnosis': "/images/services/diagnosis.jpg",
    'format': "/images/services/format.png",
    'gpu-drivers': "/images/services/gpu-drivers.jpg",
    'thermal-paste': "/images/services/thermal-paste.jpg",
    'bios-update': "/images/services/bios-update.jpg",
    'ram-oc': "/images/services/bios-tweak.jpg",
    'windows-tweaking': "/images/services/tweak.jpg",
    'gaming-windows': "/images/services/custom-windows1.jpg",
    'gpu-oc': "/images/services/controller-oc.jpg",
    'internet-tweak': "/images/services/Network.jpg"
  },
  fallback: {
    category: "/images/categories/pc-biuld.jpg",
    service: "/images/services/pc-assembly.jpg",
    logo: "/images/logo/store logo.png"
  }
};

// Services Data
const servicesData = {
  assembly: {
    title: 'PC Build',
    icon: '🖥️',
    image: imageConfig.categories.assembly,
    color: 'from-sky-400 to-sky-500',
    services: [
      {
        id: 'ready-builds',
        title: 'تجميعات PC جاهزة',
        description: 'تجميعات متنوعة للألعاب والعمل مع ضمان شامل',
        price: '0',
        image: '🖥️',
        serviceImage: imageConfig.services['ready-builds'],
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
        serviceImage: imageConfig.services['water-cooling'],
        rating: 5,
        color: 'from-sky-500 to-sky-600'
      },
      {
        id: 'air-cooling',
        title: 'تركيب مبرد هوائي',
        description: 'تركيب بي سي بمبرد هوائي',
        price: '100',
        image: '🌀',
        serviceImage: imageConfig.services['air-cooling'],
        rating: 4.7,
        color: 'from-sky-500 to-sky-600'
      },
      {
        id: 'custom-build',
        title: 'تركيب مخصص',
        description: 'تركيب قطع حسب الطلب مع ضبط الأداء',
        price: '150-200',
        image: '🔧',
        serviceImage: imageConfig.services['custom-build'],
        rating: 5,
        color: 'from-sky-400 to-sky-500'
      },
    ]
  },
  maintenance: {
    title: 'قسم الصيانة',
    icon: '🛠️',
    image: imageConfig.categories.maintenance,
    color: 'from-sky-500 to-sky-600',
    services: [
      {
        id: 'diagnosis',
        title: 'كشف وصيانة PC',
        description: 'فحص شامل وتشخيص دقيق لجميع المكونات',
        price: '50-100',
        image: '⚠️',
        serviceImage: imageConfig.services['diagnosis'],
        popular: true,
        rating: 4.9,
        color: 'from-sky-500 to-sky-600'
      },
      {
        id: 'format',
        title: 'فورمات النظام',
        description: 'تهيئة وإعادة تثبيت الويندوز مع التعريفات',
        price: '30',
        image: '🔄',
        serviceImage: imageConfig.services['format'],
        rating: 4.6,
        color: 'from-sky-500 to-sky-600'
      },
      {
        id: 'gpu-drivers',
        title: 'تعديل درايفر الكرت GPU',
        description: 'حذف وتحديث تعريفات كرت الشاشة',
        price: '20',
        image: '🛠️',
        serviceImage: imageConfig.services['gpu-drivers'],
        rating: 4.8,
        color: 'from-sky-500 to-sky-600'
      },
      {
        id: 'thermal-paste',
        title: 'تغيير المعجون',
        description: 'استبدال المعجون الحراري لتحسين التبريد',
        price: '50',
        image: '🌡️',
        serviceImage: imageConfig.services['thermal-paste'],
        rating: 5,
        color: 'from-sky-500 to-sky-600'
      },
      {
        id: 'bios-update',
        title: 'تحديث البايوس',
        description: 'تحديث البايوس لأحدث إصدار بأمان',
        price: '30',
        image: '⚙️',
        serviceImage: imageConfig.services['bios-update'],
        rating: 4.9,
        color: 'from-sky-500 to-sky-600'
      }
    ]
  },
  tweaking: {
    title: 'PC TWEAKING',
    icon: '⚡',
    image: imageConfig.categories.tweaking,
    color: 'from-sky-600 to-sky-700',
    services: [
      {
        id: 'ram-oc',
        title: 'تويك للبايوس',
        description: 'تحسين أداء وفتح سرعة الرامات',
        price: '50',
        image: '📈',
        serviceImage: imageConfig.services['ram-oc'],
        rating: 4.8,
        color: 'from-purple-500 to-purple-600'
      },
      {
        id: 'windows-tweaking',
        title: 'تويك الويندوز',
        description: 'تسريع وتحسين الويندوز',
        price: '100',
        addon: 'مع فورمات +30 ريال',
        optional: true,
        image: '🪟',
        serviceImage: imageConfig.services['windows-tweaking'],
        popular: true,
        rating: 4.9,
        color: 'from-purple-500 to-purple-600',
        options: [
          { id: 'without-format', title: 'بدون فورمات', price: '100', description: 'تحسين الويندوز الحالي' },
          { id: 'with-format', title: 'مع فورمات', price: '130', description: 'تحسين + فورمات كامل للنظام' }
        ]
      },
      {
        id: 'gaming-windows',
        title: 'تثبيت ويندوز مخصص للالعاب',
        description: 'ويندوز محسن خصيصاً للألعاب',
        price: '100',
        image: '⚙️',
        serviceImage: imageConfig.services['gaming-windows'],
        rating: 4.7,
        color: 'from-purple-500 to-purple-600'
      },
      {
        id: 'internet-tweak',
        title: 'تويك الانترنت',
        description: 'تحسين أداء الانترنت',
        price: '50',
        image: '🌐',
        serviceImage: imageConfig.services['internet-tweak'],
        rating: 4.6,
        color: 'from-purple-500 to-purple-600'
      },
      {
        id: 'gpu-oc',
        title: 'كسر سرعة القير',
        description: 'رفع أداء استجابة القير',
        price: '30',
        image: '🎮',
        serviceImage: imageConfig.services['gpu-oc'],
        rating: 4.6,
        color: 'from-purple-500 to-purple-600'
      }
    ]
  }
};

// Enhanced Image Component
const EnhancedImage = memo(({ 
  src, 
  fallback, 
  alt, 
  className, 
  ...props 
}: {
  src: string;
  fallback: string;
  alt: string;
  className: string;
  [key: string]: unknown;
}) => {
  const [imgSrc, setImgSrc] = useState(src);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const imgRef = useRef<HTMLDivElement>(null);

  // Intersection Observer for lazy loading
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: '50px' }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const handleError = useCallback(() => {
    if (imgSrc !== fallback) {
      setImgSrc(fallback);
      setError(false);
    } else {
      setError(true);
    }
    setLoading(false);
  }, [imgSrc, fallback]);

  const handleLoad = useCallback(() => {
    setLoading(false);
    setError(false);
  }, []);

  if (error && imgSrc === fallback) {
    return (
      <div className={`${className} bg-gray-700 flex items-center justify-center`}>
        <span className="text-gray-400 text-sm">صورة غير متوفرة</span>
      </div>
    );
  }

  return (
    <div ref={imgRef} className="relative">
      {loading && (
        <div className={`${className} bg-gray-700 animate-pulse flex items-center justify-center absolute inset-0`}>
          <div className="w-6 h-6 border-2 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
      {isInView && (
        <Image
          src={imgSrc}
          alt={alt}
          width={500}
          height={300}
          className={`${className} ${loading ? 'opacity-0' : 'opacity-100 transition-opacity duration-300'}`}
          onError={handleError}
          onLoad={handleLoad}
          loading="lazy"
          {...props}
        />
      )}
    </div>
  );
});

EnhancedImage.displayName = 'EnhancedImage';

// Enhanced Popular Badge
const PopularBadge = memo(({ isHovered }: { isHovered: boolean }) => {
  return (
    <div className="absolute -top-3 -right-3 z-20">
      <div className="relative">
        <div className={`bg-gradient-to-r from-pink-500 via-red-500 to-pink-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg transform transition-all duration-500 ${
          isHovered ? 'scale-125 rotate-6 shadow-pink-500/50' : 'scale-100 rotate-0'
        }`}>
          <span className="relative z-10 animate-pulse">الأكثر مبيعاً</span>
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-red-500 rounded-full animate-ping opacity-20"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-pink-500 rounded-full animate-pulse opacity-30"></div>
        <div className="absolute -inset-1 bg-gradient-to-r from-pink-400 to-red-400 rounded-full animate-spin opacity-10" style={{ animationDuration: '3s' }}></div>
        
        <div className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-400 rounded-full animate-bounce"></div>
        <div className="absolute -bottom-1 -left-1 w-1 h-1 bg-white rounded-full animate-ping"></div>
        <div className="absolute top-0 left-0 w-1 h-1 bg-blue-400 rounded-full animate-pulse delay-300"></div>
        
        <div className={`absolute inset-0 rounded-full transition-all duration-500 ${
          isHovered ? 'bg-gradient-to-r from-pink-400 to-red-400 opacity-30 blur-sm scale-150' : 'opacity-0'
        }`}></div>
      </div>
    </div>
  );
});

PopularBadge.displayName = 'PopularBadge';

// Dynamic Header Component
const DynamicHeader = memo(({ 
  activeSection, 
  isScrolled, 
  scrollY,
  scrollToSection,
  session
}: { 
  activeSection: string; 
  isScrolled: boolean; 
  scrollY: number;
  scrollToSection: (sectionId: string) => void;
  session: { user?: { name?: string | null; email?: string | null; image?: string | null } } | null;
}) => {
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    const checkUserRole = async () => {
      const user = await getUserFromSession(session);
      setUserRole(user?.role || null);
    };
    checkUserRole();
  }, [session]);
  const getSectionTheme = useCallback((section: string) => {
    switch (section) {
      case 'assembly':
        return {
          bg: 'from-sky-400/20 to-sky-600/20',
          border: 'border-sky-500/30',
          text: 'text-sky-400',
          glow: 'shadow-sky-500/20'
        };
      case 'maintenance':
        return {
          bg: 'from-blue-500/20 to-blue-700/20',
          border: 'border-blue-500/30',
          text: 'text-blue-400',
          glow: 'shadow-blue-500/20'
        };
      case 'tweaking':
        return {
          bg: 'from-purple-500/20 to-purple-700/20',
          border: 'border-purple-500/30',
          text: 'text-purple-400',
          glow: 'shadow-purple-500/20'
        };
      default:
        return {
          bg: 'from-gray-500/20 to-gray-700/20',
          border: 'border-gray-500/30',
          text: 'text-gray-400',
          glow: 'shadow-gray-500/20'
        };
    }
  }, []);

  const theme = getSectionTheme(activeSection);
  const progressWidth = useMemo(() => {
    if (typeof document === 'undefined') return 0;
    return Math.min(100, (scrollY / (document.body.scrollHeight - window.innerHeight)) * 100);
  }, [scrollY]);

  return (
    <nav className={`fixed w-full top-0 z-50 transition-all duration-500 ${
      isScrolled 
        ? `bg-gray-900/95 backdrop-blur-xl shadow-2xl ${theme.border} border-b` 
        : 'bg-transparent'
    }`}>
      <div className="container mx-auto px-4 md:px-6 py-3">
        <div className="flex justify-between items-center">
          {/* Left: Enhanced User Account Section */}
          <div className="flex items-center space-x-reverse space-x-6 md:space-x-8">
            <div className="relative group">
              <div className={`w-16 h-16 md:w-20 md:h-20 rounded-2xl overflow-hidden shadow-2xl transition-all duration-700 ${
                isScrolled ? theme.glow : ''
              } group-hover:shadow-sky-500/60 group-hover:scale-110 group-hover:rotate-2`}>
                <EnhancedImage
                  src={storeConfig.logo}
                  fallback={imageConfig.fallback.logo}
                  alt="SmoothFlow Logo"
                  className="w-full h-full object-contain bg-transparent"
                />
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-sky-400 to-blue-500 rounded-full flex items-center justify-center border-3 border-gray-900 shadow-lg animate-pulse">
                <span className="text-sm">⚡</span>
              </div>
            </div>
            <div>
              <h1 className={`text-2xl md:text-4xl font-bold transition-all duration-700 text-white ${
                isScrolled ? 'text-sky-300' : 'text-gray-100'
              } group-hover:scale-105`} style={{
                textShadow: '0 0 10px rgba(0, 191, 255, 0.3), 0 0 20px rgba(0, 191, 255, 0.2)',
                filter: 'contrast(1.1) brightness(0.9)'
              }}>
                {storeConfig.storeName}
              </h1>
              <p className={`text-lg font-semibold transition-all duration-700 ${
                isScrolled ? 'text-gray-300' : 'text-sky-400'
              } group-hover:text-sky-300`}>
                {storeConfig.tagline}
              </p>
            </div>
          </div>
          
          {/* Center: Navigation Items */}
          <div className="hidden md:flex items-center space-x-reverse space-x-8">
            {Object.entries(servicesData).map(([key, category]) => (
              <button 
                key={key}
                onClick={() => scrollToSection(key)}
                className={`px-8 py-4 rounded-xl font-semibold transition-all duration-500 relative overflow-hidden group ${
                  activeSection === key
                    ? `${theme.text} bg-gradient-to-r ${theme.bg} ${theme.border} border enhanced-glow` 
                    : 'text-gray-300 hover:text-white hover:bg-gray-700/50 hover:scale-105'
                }`}
                aria-label={`الانتقال إلى قسم ${category.title}`}
              >
                <span className="relative z-10 flex items-center space-x-reverse space-x-2">
                  <span className="text-lg" role="img" aria-label={category.title}>{category.icon}</span>
                  <span>{category.title}</span>
                </span>
                {activeSection === key && (
                  <div className={`absolute inset-0 bg-gradient-to-r ${theme.bg}`}></div>
                )}
              </button>
            ))}
          </div>
          
          {/* Right: Shopping Cart */}
          <div className="flex items-center space-x-reverse space-x-4">
            <ErrorBoundary>
              <UserProfile />
            </ErrorBoundary>
            <div className="w-px h-6 bg-gray-600"></div>
            <ErrorBoundary>
              <EnhancedShoppingCart />
            </ErrorBoundary>
            {userRole === 'ADMIN' && (
              <>
                <div className="w-px h-6 bg-gray-600"></div>
                <Link
                  href="/admin-dashboard"
                  className="text-gray-300 hover:text-sky-300 transition-colors text-sm font-medium"
                >
                  لوحة الإدارة
                </Link>
              </>
            )}
          </div>
        </div>
        
        {/* Progress bar */}
        <div className={`absolute bottom-0 left-0 h-1 bg-gradient-to-r ${theme.bg} transition-all duration-500 ${
          isScrolled ? 'opacity-100' : 'opacity-0'
        }`} style={{ width: `${progressWidth}%` }}></div>
      </div>
    </nav>
  );
});

DynamicHeader.displayName = 'DynamicHeader';

// Enhanced Section Divider
const SectionDivider = memo(({ title, icon, color, image }: { 
  title: string; 
  icon: string; 
  color: string; 
  image?: string; 
}) => {
  return (
    <div className="relative py-16">
      <div className="absolute top-8 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent"></div>
      <div className="absolute top-8 left-0 right-0 h-px bg-gradient-to-r from-transparent via-sky-400/30 to-transparent"></div>
      
      <div className="absolute top-6 left-1/4 w-8 h-0.5 bg-gradient-to-r from-cyan-400 to-transparent"></div>
      <div className="absolute top-6 right-1/4 w-8 h-0.5 bg-gradient-to-r from-transparent to-cyan-400"></div>
      
      <div className="relative flex justify-center">
        {image ? (
          <div className="relative">
            <div className="w-24 h-24 rounded-2xl overflow-hidden shadow-2xl border-4 border-gray-900">
              <EnhancedImage 
                src={image}
                fallback={imageConfig.fallback.category}
                alt={title}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        ) : (
          <div className={`bg-gradient-to-r ${color} p-4 rounded-2xl shadow-2xl border-4 border-gray-900`}>
            <span className="text-4xl block" role="img" aria-label={title}>{icon}</span>
          </div>
        )}
      </div>
      
      <div className="text-center mt-6">
        <h2 className="text-3xl md:text-4xl font-semibold text-gray-200 mb-4" style={{
          textShadow: '0 0 10px rgba(0, 191, 255, 0.3)',
          filter: 'contrast(1.1) brightness(0.9)'
        }}>{title}</h2>
        <div className="w-24 h-1 bg-gradient-to-r from-sky-400 to-sky-600 mx-auto rounded-full"></div>
      </div>
      
      <div className="absolute top-1/2 left-10 w-2 h-2 bg-sky-400 rounded-full animate-pulse"></div>
      <div className="absolute top-1/2 right-10 w-2 h-2 bg-sky-600 rounded-full animate-pulse delay-500"></div>
    </div>
  );
});

SectionDivider.displayName = 'SectionDivider';

// Service interface
interface Service {
  id: string;
  title: string;
  description: string;
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
  options?: Array<{
    id: string;
    title: string;
    price: string;
    description: string;
  }>;
}

// Enhanced Service Card
const ServiceCard = memo(({ 
  service, 
  index, 
  onAddToCart 
}: { 
  service: Service; 
  index: number; 
  onAddToCart: (message: string, type: 'success' | 'error' | 'info') => void; 
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showOptions, setShowOptions] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.1 });
  const { addToCart } = useCart();
  const { data: session } = useSession();
  const router = useRouter();

  const handleCardClick = useCallback((e: React.SyntheticEvent) => {
    // Don't navigate if clicking on the button or options
    if (e.target instanceof HTMLElement) {
      const isButton = e.target.closest('button');
      const isOption = e.target.closest('[data-option]');
      
      if (isButton || isOption) {
        return; // Don't navigate if clicking on button or options
      }
    }
    
    // Navigate to service detail page
    router.push(`/service/${service.id}`);
  }, [router, service.id]);

  const handleAddToCart = useCallback(async () => {
    if (session) {
      // For services with options, use the first option if none selected
      const optionToUse = service.options && service.options.length > 0 
        ? (selectedOption || service.options[0].id)
        : undefined;
        
      setIsAdding(true);
      try {
        await addToCart(service.id, optionToUse);
        const optionText = optionToUse && service.options 
          ? service.options.find(opt => opt.id === optionToUse)?.title 
          : '';
        onAddToCart(`تم إضافة ${service.title}${optionText ? ` (${optionText})` : ''} إلى السلة بنجاح!`, 'success');
      } catch (error) {
        console.error('Error adding to cart:', error);
        const errorMessage = error instanceof Error ? error.message : 'حدث خطأ أثناء إضافة الخدمة إلى السلة';
        onAddToCart(errorMessage, 'error');
      } finally {
        setIsAdding(false);
      }
    } else {
      onAddToCart('يجب تسجيل الدخول أولاً', 'info');
      setTimeout(() => {
        router.push('/auth/signin');
      }, 1500);
    }
  }, [session, service, selectedOption, addToCart, onAddToCart, router]);

  const handleOptionSelect = useCallback((optionId: string) => {
    setSelectedOption(optionId);
    setShowOptions(false);
  }, []);

  const handleOptionsToggle = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowOptions(!showOptions);
  }, [showOptions]);

  // Add safety check for service
  if (!service) return null;

  return (
    <ErrorBoundary>
      <div
        ref={ref}
        className={`group relative transform transition-all duration-700 cursor-pointer ${
          isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
        }`}
        style={{ transitionDelay: `${index * 100}ms` }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={handleCardClick}
        data-service-id={service.id}
        role="article"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && handleCardClick(e)}
        aria-label={`خدمة ${service.title} - ${service.description}`}
      >
        {service.popular && <PopularBadge isHovered={isHovered} />}

        <div className={`modern-card hover:shadow-sky-500/30 transition-all duration-700 overflow-hidden group border border-sky-500/20 ${
          isHovered ? 'transform -translate-y-3 scale-105 enhanced-glow border-sky-400/40' : ''
        }`}>
          
          {/* Service Image Section */}
          <div className="relative bg-gradient-to-br from-gray-700 via-gray-800 to-gray-900 h-24 flex items-center justify-center overflow-hidden group-hover:from-sky-900/20 group-hover:via-gray-800 group-hover:to-blue-900/20 transition-all duration-500">
            {service.serviceImage ? (
              <EnhancedImage
                src={service.serviceImage}
                fallback={imageConfig.fallback.service}
                alt={service.title}
                className="w-full h-full object-cover opacity-70 group-hover:opacity-90 transition-all duration-500 group-hover:scale-110"
              />
            ) : (
              <div className={`text-3xl transform transition-all duration-500 ${
                isHovered ? 'scale-110 rotate-3 drop-shadow-2xl' : 'drop-shadow-lg'
              }`} role="img" aria-label={service.title}>
                {service.image}
              </div>
            )}
            
            {/* Enhanced Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent group-hover:from-black/20 transition-all duration-500"></div>
            
            {/* Enhanced Service Tag */}
            <div className="absolute top-2 right-2 bg-gradient-to-r from-sky-600/90 to-blue-600/90 backdrop-blur-sm text-white px-2 py-1 rounded-full text-xs font-bold shadow-lg border border-white/20">
              خدمة تقنية
            </div>
            
            {/* Hover Effect Overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-sky-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          </div>

          {/* Service Details */}
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 bg-gradient-to-r ${service.color} rounded-lg flex items-center justify-center group-hover:scale-110 transition-all duration-300 shadow-lg group-hover:shadow-xl`}>
                <span className="text-lg" role="img" aria-label={service.title}>{service.image}</span>
              </div>
              
              <div className="flex items-center space-x-reverse space-x-1 bg-gray-700/50 px-2 py-1 rounded-full">
                <span className="text-yellow-400 text-xs" role="img" aria-label="تقييم">⭐</span>
                <span className="text-white text-xs font-bold">{service.rating}</span>
              </div>
            </div>

            <h3 className="text-sm font-semibold text-gray-200 mb-2 line-clamp-1 group-hover:text-sky-200 transition-colors duration-300" style={{
              textShadow: '0 0 5px rgba(0, 191, 255, 0.2)',
              filter: 'contrast(1.05) brightness(0.9)'
            }}>
              {service.title}
            </h3>

            <p className="text-gray-400 text-xs mb-3 line-clamp-2 leading-relaxed group-hover:text-gray-300 transition-colors duration-300" style={{
              filter: 'contrast(1.05) brightness(0.9)'
            }}>
              {service.description}
            </p>

            {/* Service Options */}
            {service.options && service.options.length > 0 && (
              <div className="mb-2">
                <button 
                  data-option
                  onClick={handleOptionsToggle}
                  className="w-full text-left p-2 bg-sky-500/10 rounded-md border border-sky-500/30 hover:bg-sky-500/20 transition-colors"
                  aria-expanded={showOptions}
                  aria-label="اختيار خيارات الخدمة"
                >
                  <span className="text-sky-400 text-xs font-medium">
                    {selectedOption ? 
                      service.options.find(opt => opt.id === selectedOption)?.title : 
                      'اختر الخيار'
                    }
                  </span>
                  <svg className={`w-3 h-3 inline mr-1 transition-transform ${showOptions ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {showOptions && (
                  <div className="mt-2 space-y-1" role="listbox">
                    {service.options.map((option) => (
                      <button
                        key={option.id}
                        data-option
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleOptionSelect(option.id);
                        }}
                        className={`w-full text-right p-2 rounded-md border transition-colors ${
                          selectedOption === option.id
                            ? 'bg-sky-500/20 border-sky-500/50 text-sky-400'
                            : 'bg-gray-700/50 border-gray-600/50 text-gray-300 hover:bg-gray-600/50'
                        }`}
                        role="option"
                        aria-selected={selectedOption === option.id}
                      >
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-bold">{option.price} ريال</span>
                          <span className="text-xs">{option.title}</span>
                        </div>
                        <p className="text-xs text-gray-400 mt-1">{option.description}</p>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {service.addon && !service.options && (
              <div className="mb-2 p-2 bg-sky-500/10 rounded-md border border-sky-500/30">
                <span className="text-sky-400 text-xs font-medium">{service.addon}</span>
              </div>
            )}

            <div className="flex items-center justify-between mb-3">
              <div className="flex flex-col">
                <div className="flex items-center">
                  <span className="text-base font-semibold text-sky-300" style={{
                    textShadow: '0 0 5px rgba(0, 191, 255, 0.3)',
                    filter: 'contrast(1.05) brightness(0.9)'
                  }}>
                    {selectedOption && service.options ? 
                      service.options.find(opt => opt.id === selectedOption)?.price : 
                      service.price
                    }
                  </span>
                  <span className="text-gray-300 text-xs mr-1 font-medium">ريال</span>
                </div>
                {service.originalPrice && (
                  <span className="text-gray-500 text-xs line-through">
                    {service.originalPrice} ريال
                  </span>
                )}
              </div>
              
              {service.discount && (
                <div className="text-green-400 text-xs font-bold bg-gradient-to-r from-green-500/20 to-emerald-500/20 px-3 py-1 rounded-full border border-green-400/50 shadow-lg">
                  وفر %{service.discount}
                </div>
              )}
            </div>

            <button 
              className={`w-full sky-blue-gradient text-white py-3 rounded-lg font-bold transition-all duration-300 transform ${
                isHovered ? 'scale-105 shadow-lg shadow-sky-500/50' : 'shadow-md'
              } hover:shadow-lg text-sm ${isAdding ? 'animate-pulse' : ''} group-hover:shadow-sky-500/30 relative overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed`}
              disabled={isAdding}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleAddToCart();
              }}
              aria-label={`إضافة ${service.title} إلى السلة`}
            >
              {/* Animated background effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-sky-400/20 to-sky-600/20 animate-pulse-slow"></div>
              
              <span className="flex items-center justify-center relative z-10">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <span className="font-bold" style={{
                  filter: 'contrast(1.2) brightness(1.1)',
                  textShadow: '0 0 3px rgba(255, 255, 255, 0.7)'
                }}>
                  {isAdding ? 
                    'جاري الإضافة...' :
                    !session ? 
                      'تسجيل الدخول مطلوب' : 
                      'إضافة للسلة'
                  }
                </span>
                {isAdding ? (
                  <div className="w-3 h-3 mr-1 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 1.5M7 13l1.5-1.5M17 21a2 2 0 100-4 2 2 0 000 4zM9 21a2 2 0 100-4 2 2 0 000 4z" />
                  </svg>
                )}
              </span>
            </button>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
});

ServiceCard.displayName = 'ServiceCard';

// Enhanced Service Section Component
const EnhancedServiceSection = memo(({ 
  sectionKey, 
  category, 
  activeSection,
  onAddToCart
}: { 
  sectionKey: string; 
  category: { title: string; icon: string; color: string; image: string; services: Service[] }; 
  activeSection: string;
  onAddToCart: (message: string, type: 'success' | 'error' | 'info') => void;
}) => {
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.2 });
  
  return (
    <section 
      id={sectionKey} 
      className="py-8 relative z-10"
      style={{
        background: activeSection === sectionKey 
          ? `linear-gradient(135deg, ${sectionKey === 'assembly' ? 'rgba(0, 191, 255, 0.05)' : sectionKey === 'maintenance' ? 'rgba(0, 191, 255, 0.05)' : 'rgba(135, 206, 250, 0.05)'} 0%, transparent 100%)`
          : 'transparent'
      }}
      aria-labelledby={`${sectionKey}-heading`}
    >
      <div 
        ref={ref}
        className={`transform transition-all duration-1000 ${
          isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
        }`}
      >
        <SectionDivider 
          title={category.title}  
          icon={category.icon}
          color={category.color}
          image={category.image}
        />
      </div>
      
      <div className="container mx-auto px-4 mt-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 sm:gap-4">
          {category.services.map((service: Service, index: number) => (
            <ServiceCard 
              key={service.id} 
              service={service} 
              index={index}
              onAddToCart={onAddToCart}
            />
          ))}
        </div>
      </div>
      
      {/* Section-specific background effects */}
      <div className="absolute inset-0 pointer-events-none opacity-15">
        <div 
          className={`absolute top-1/2 left-1/2 w-80 h-80 rounded-full blur-3xl ${
            sectionKey === 'assembly' ? 'bg-sky-500' : 
            sectionKey === 'maintenance' ? 'bg-sky-400' : 
            'bg-blue-400'
          }`}
          style={{
            transform: `translate(-50%, -50%) scale(${activeSection === sectionKey ? 1 : 0.5})`,
            transition: 'transform 1s ease-out'
          }}
        ></div>
      </div>
    </section>
  );
});

EnhancedServiceSection.displayName = 'EnhancedServiceSection';

// Enhanced Custom Hooks
const useScrollPosition = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  // const [scrollDirection, setScrollDirection] = useState<'up' | 'down'>('down'); // Removed unused variable
  const [isClient, setIsClient] = useState(false);

  const handleScroll = useCallback(() => {
    if (typeof window !== 'undefined') {
      const currentScrollY = window.scrollY;
      setIsScrolled(currentScrollY > 50);
      setScrollY(currentScrollY);
    }
  }, []);

  useEffect(() => {
    setIsClient(true);
    
    if (typeof window !== 'undefined') {
      let ticking = false;
      const throttledHandleScroll = () => {
        if (!ticking) {
          requestAnimationFrame(() => {
            handleScroll();
            ticking = false;
          });
          ticking = true;
        }
      };

      window.addEventListener('scroll', throttledHandleScroll, { passive: true });
      return () => window.removeEventListener('scroll', throttledHandleScroll);
    }
  }, [handleScroll]);

  return { 
    isScrolled: isClient ? isScrolled : false, 
    scrollY: isClient ? scrollY : 0
  };
};

// Enhanced Section Observer Hook
const useSectionObserver = () => {
  const [activeSection, setActiveSection] = useState('assembly');
  const [sectionProgress, setSectionProgress] = useState(0);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    
    if (typeof window !== 'undefined') {
      const sections = Object.keys(servicesData);
      const sectionElements = sections.map(id => document.getElementById(id));
      
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const sectionId = entry.target.id;
              setActiveSection(sectionId);
              
              // Calculate progress within the section
              const rect = entry.boundingClientRect;
              const windowHeight = window.innerHeight;
              const sectionHeight = entry.target.clientHeight;
              const progress = Math.max(0, Math.min(1, 
                (windowHeight - rect.top) / (windowHeight + sectionHeight)
              ));
              setSectionProgress(progress);
            }
          });
        },
        { 
          threshold: [0, 0.25, 0.5, 0.75, 1],
          rootMargin: '-100px 0px -100px 0px'
        }
      );

      sectionElements.forEach(element => {
        if (element) observer.observe(element);
      });

      return () => observer.disconnect();
    }
  }, []);

  return { 
    activeSection: isClient ? activeSection : 'assembly',
    sectionProgress: isClient ? sectionProgress : 0
  };
};

// Interactive Card Component
const InteractiveCard = memo(({ 
  children, 
  className = '', 
  hoverEffect = 'glow',
  ...props 
}: {
  children: React.ReactNode;
  className?: string;
  hoverEffect?: 'glow' | 'lift' | 'scale';
  [key: string]: unknown;
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const getHoverStyles = () => {
    if (!isHovered) return {};
    
    switch (hoverEffect) {
      case 'glow':
        return {
          boxShadow: '0 0 30px rgba(0, 191, 255, 0.3), 0 0 60px rgba(0, 191, 255, 0.2)'
        };
      case 'lift':
        return {
          transform: 'translateY(-8px)',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)'
        };
      case 'scale':
        return {
          transform: 'scale(1.05)'
        };
      default:
        return {};
    }
  };

  return (
    <div
      className={`interactive-card ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        ...getHoverStyles()
      }}
      {...props}
    >
      {children}
    </div>
  );
});

InteractiveCard.displayName = 'InteractiveCard';

// Reveal Animation Component
const RevealAnimation = memo(({
  children,
  direction = 'up',
  delay = 0,
  duration = 800,
  className = ''
}: {
  children: React.ReactNode;
  direction?: 'up' | 'down' | 'left' | 'right';
  delay?: number;
  duration?: number;
  className?: string;
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setIsVisible(true), delay);
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [delay]);

  const getTransform = () => {
    if (isVisible) return 'translate(0, 0)';
    
    switch (direction) {
      case 'up': return 'translate(0, 30px)';
      case 'down': return 'translate(0, -30px)';
      case 'left': return 'translate(30px, 0)';
      case 'right': return 'translate(-30px, 0)';
      default: return 'translate(0, 30px)';
    }
  };

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: getTransform(),
        transition: `all ${duration}ms cubic-bezier(0.25, 0.46, 0.45, 0.94)`
      }}
    >
      {children}
    </div>
  );
});

RevealAnimation.displayName = 'RevealAnimation';

// FAQ Item Component
const FAQItem = memo(({ 
  id, 
  question, 
  answer, 
  icon = '⭐' 
}: { 
  id: string; 
  question: string; 
  answer: string; 
  icon?: string; 
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleOpen = useCallback(() => {
    setIsOpen(!isOpen);
  }, [isOpen]);

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 hover:border-sky-500/30 transition-all duration-300 hover:shadow-lg hover:shadow-sky-500/10 overflow-hidden">
      <button 
        className="w-full text-right p-4 flex items-center justify-between cursor-pointer group"
        onClick={toggleOpen}
        aria-expanded={isOpen}
        aria-controls={`faq-answer-${id}`}
      >
        <h3 className="text-base font-semibold text-white flex items-center">
          <span className="text-sky-400 mr-2" role="img" aria-label="نجمة">{icon}</span>
          {question}
        </h3>
        <svg 
          className={`h-5 w-5 text-sky-400 transform transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      <div 
        id={`faq-answer-${id}`}
        className={`transition-all duration-300 overflow-hidden ${isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}
      >
        <div className="px-4 pb-4 pt-0">
          <p className="text-gray-300 text-sm">{answer}</p>
        </div>
      </div>
    </div>
  );
});

FAQItem.displayName = 'FAQItem';

// Main Component
export default function MDKStore() {
  const { isScrolled, scrollY } = useScrollPosition();
  const { activeSection } = useSectionObserver();
  const [isClient, setIsClient] = useState(false);
  const [notification, setNotification] = useState<{
    message: string;
    type: 'success' | 'error' | 'info' | 'warning';
  } | null>(null);
  const { data: session } = useSession();

  useEffect(() => {
    setIsClient(true);
  }, []);

  const scrollToSection = useCallback((sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  }, []);

  const handleNotification = useCallback((message: string, type: 'success' | 'error' | 'info' | 'warning') => {
    setNotification({ message, type });
    
    // Auto-hide notification after 5 seconds
    setTimeout(() => {
      setNotification(null);
    }, 5000);
  }, []);

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

  // FAQ Data
  const faqData = [
    {
      id: '1',
      question: 'كيف يمكنني طلب خدمة؟',
      answer: 'يمكنك طلب الخدمة بسهولة من خلال إضافتها إلى سلة التسوق ثم إكمال عملية الدفع. سيتواصل معك فريقنا لتحديد موعد مناسب لتقديم الخدمة.'
    },
    {
      id: '2',
      question: 'هل تقدمون ضمان على الخدمات؟',
      answer: 'نعم، نقدم ضمان شامل على جميع خدماتنا'
    },
    {
      id: '3',
      question: 'ما هي طرق الدفع المتاحة؟',
      answer: 'نقبل الدفع عبر البطاقات الائتمانية'
    },
    {
      id: '4',
      question: 'كم تستغرق عملية الصيانة؟',
      answer: 'تختلف المدة حسب نوع الخدمة، لكن معظم الخدمات تستغرق من ساعة إلى ثلاث ساعات، بينما قد تستغرق خدمات الصيانة المعقدة وقتاً أطول. سنخبرك بالوقت المتوقع عند تأكيد طلبك.'
    },
    {
      id: '5',
      question: 'هل تقدمون خدمات الصيانة في المنزل؟',
      answer: 'نعم، نقدم خدمات الصيانة والتركيب في منزلك أو مكتبك مقابل رسوم إضافية بسيطة للانتقال. يمكنك أيضاً إحضار جهازك'
    },
    {
      id: '6',
      question: 'هل يمكنني إلغاء الطلب؟',
      answer: 'نعم، يمكنك إلغاء الطلب'
    }
  ];

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-black relative overflow-x-hidden" dir="rtl">
        {/* Enhanced Background Effects */}
        <EnhancedBackground />
        
        {/* Enhanced Dynamic Background */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          {/* Floating Geometric Shapes */}
          <div className="absolute inset-0">
            <div className="floating-element absolute w-20 h-20 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-full top-20 left-10 blur-sm"></div>
            <div className="floating-element absolute w-16 h-16 bg-gradient-to-r from-blue-500/15 to-cyan-500/15 rounded-lg top-40 right-20 blur-sm"></div>
            <div className="floating-element absolute w-24 h-24 bg-gradient-to-r from-sky-500/10 to-blue-500/10 rounded-full bottom-40 left-1/4 blur-sm"></div>
            <div className="floating-element absolute w-12 h-12 bg-gradient-to-r from-cyan-400/25 to-blue-400/25 rounded-lg top-60 right-1/3 blur-sm"></div>
            <div className="floating-element absolute w-18 h-18 bg-gradient-to-r from-blue-400/20 to-cyan-400/20 rounded-full bottom-60 right-10 blur-sm"></div>
          </div>
          
          {/* Drifting Particles */}
          <div className="absolute inset-0">
            <div className="drift-element absolute w-2 h-2 bg-cyan-400/30 rounded-full top-10 left-10"></div>
            <div className="drift-element absolute w-1 h-1 bg-blue-400/40 rounded-full top-20 left-20" style={{animationDelay: '2s'}}></div>
            <div className="drift-element absolute w-3 h-3 bg-sky-400/20 rounded-full top-30 left-30" style={{animationDelay: '4s'}}></div>
            <div className="drift-element absolute w-1.5 h-1.5 bg-cyan-300/35 rounded-full top-40 left-40" style={{animationDelay: '6s'}}></div>
            <div className="drift-element absolute w-2.5 h-2.5 bg-blue-300/25 rounded-full top-50 left-50" style={{animationDelay: '8s'}}></div>
          </div>
          
          {/* Pulse Elements */}
          <div className="absolute inset-0">
            <div className="pulse-element absolute w-32 h-32 bg-gradient-to-r from-cyan-500/5 to-blue-500/5 rounded-full top-1/4 left-1/4"></div>
            <div className="pulse-element absolute w-24 h-24 bg-gradient-to-r from-blue-500/8 to-cyan-500/8 rounded-full bottom-1/4 right-1/4" style={{animationDelay: '2s'}}></div>
          </div>
          
          {/* Shimmer Effect */}
          <div className="absolute inset-0 shimmer opacity-30"></div>
        </div>
        
        {/* Additional floating elements */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="floating-square floating-square-1"></div>
          <div className="floating-square floating-square-2"></div>
          <div className="floating-square floating-square-3"></div>
          <div className="floating-square floating-square-4"></div>
        </div>

        {/* Scroll Progress Indicator */}
        <ErrorBoundary>
          <ScrollProgress />
        </ErrorBoundary>

        {/* Dynamic Header */}
        <DynamicHeader 
          activeSection={activeSection}
          isScrolled={isScrolled}
          scrollY={scrollY}
          scrollToSection={scrollToSection}
          session={session}
        />

        {/* Enhanced Hero Section */}
        <section className="relative min-h-[85vh] flex items-center justify-center pt-20 pb-16 z-10 overflow-hidden">
          <div className="absolute inset-0">
            {/* Animated Sky Blue Grid Background */}
            <div 
              className="absolute inset-0 opacity-20"
              style={{
                backgroundImage: `radial-gradient(circle at 25% 25%, #00BFFF 1px, transparent 1px), radial-gradient(circle at 75% 75%, #87CEEB 1px, transparent 1px)`,
                backgroundSize: '50px 50px',
                transform: `translate(${scrollY * 0.1}px, ${scrollY * 0.1}px)`
              }}
            ></div>
            
            {/* Multi-layer Dark Gradient Overlays */}
            <div className="absolute inset-0 bg-gradient-to-br from-gray-900/30 via-slate-900/25 to-black/30"></div>
            <div className="absolute inset-0 bg-gradient-to-tr from-sky-600/8 via-transparent to-blue-600/8"></div>
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-sky-500/10 via-transparent to-blue-500/10"></div>
            
            {/* Enhanced Animated Mesh Gradient */}
            <div 
              className="absolute inset-0 opacity-25"
              style={{
                background: `
                  radial-gradient(at 20% 20%, #00BFFF 0px, transparent 50%),
                  radial-gradient(at 80% 80%, #87CEEB 0px, transparent 50%),
                  radial-gradient(at 40% 60%, #87CEFA 0px, transparent 50%),
                  radial-gradient(at 60% 40%, #00BFFF 0px, transparent 50%)
                `,
                transform: `rotate(${scrollY * 0.01}deg) scale(${1 + scrollY * 0.0001})`
              }}
            ></div>
            
            {/* Subtle Static Elements */}
            <div className="absolute inset-0">
              <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-sky-500/10 rounded-full blur-2xl"></div>
              <div className="absolute bottom-1/4 right-1/4 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl"></div>
            </div>
          </div>

          <div className="container mx-auto px-4 md:px-6 text-center relative z-10 max-w-6xl">
            <RevealAnimation direction="up" delay={200}>
              {/* Enhanced Badge */}
              <InteractiveCard className="inline-block px-8 py-4 glass-dark rounded-full border border-sky-500/60 mb-8 enhanced-glow hover:scale-105 transition-all duration-700 group" hoverEffect="glow">
                <div className="flex items-center space-x-3 space-x-reverse">
                  <div className="w-3 h-3 bg-sky-400 rounded-full animate-pulse neon-glow"></div>
                  <span className="font-bold text-base sky-blue-gradient-text">
                    خدمات تقنية احترافية
                  </span>
                  <div className="w-3 h-3 bg-sky-400 rounded-full animate-pulse neon-glow"></div>
                </div>
              </InteractiveCard>
              
              {/* Enhanced Main Title - Better Responsive */}
              <h1 className="text-3xl xs:text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold text-white mb-4 sm:mb-6 md:mb-8 leading-tight px-2">
                <span className="text-gray-100 hover:scale-105 transition-transform duration-500 inline-block" style={{
                  textShadow: '0 0 15px rgba(0, 191, 255, 0.4), 0 0 30px rgba(0, 191, 255, 0.2)',
                  filter: 'contrast(1.1) brightness(0.9)'
                }}>
                  {storeConfig.storeName}
                </span>
              </h1>
              
              {/* Enhanced Subtitle - Better Responsive */}
              <p className="text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl text-gray-200 mb-6 sm:mb-8 md:mb-12 max-w-5xl mx-auto leading-relaxed font-light px-4">
                <span className="bg-gradient-to-r from-gray-200 to-gray-400 bg-clip-text text-transparent hover:from-sky-200 hover:to-sky-400 transition-all duration-500">
                  حلول شاملة وخدمات متخصصة لجميع احتياجاتك التقنية
                </span>
                <br />
                <span className="text-lg sm:text-xl md:text-2xl text-gray-400 mt-2 sm:mt-4 block hover:text-sky-300 transition-colors duration-500">
                  بأعلى معايير الجودة والاحترافية
                </span>
              </p>

              <div className="flex justify-center items-center mb-6 sm:mb-8 md:mb-12 px-4">
                <button 
                  onClick={() => scrollToSection('assembly')}
                  className="group relative bg-gradient-to-r from-sky-500 via-blue-600 to-sky-700 text-white px-3 py-2 rounded-lg font-semibold text-sm sm:text-base w-fit hover:from-sky-600 hover:via-blue-700 hover:to-sky-800 transition-all duration-300 transform hover:scale-105 shadow-lg shadow-sky-500/15 overflow-hidden border border-sky-400/30"
                  style={{
                    boxShadow: '0 0 15px rgba(0, 191, 255, 0.15), 0 0 30px rgba(0, 191, 255, 0.08)',
                    filter: 'contrast(1.05) brightness(0.95)'
                  }}
                  aria-label="استكشف خدماتنا"
                >
                  {/* Animated background gradient */}
                  <div className="absolute inset-0 bg-gradient-to-r from-sky-300 via-blue-400 to-sky-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  
                  {/* Shimmer effect */}
                  <div className="absolute inset-0 -top-1 -left-1 bg-gradient-to-r from-transparent via-white/25 to-transparent transform -skew-x-12 group-hover:translate-x-full transition-transform duration-700"></div>
                  
                  <span className="relative z-10 flex items-center justify-center space-x-reverse space-x-1" style={{
                    textShadow: '0 0 3px rgba(255, 255, 255, 0.2)',
                    filter: 'contrast(1.1) brightness(0.9)'
                  }}>
                    <span className="group-hover:scale-105 transition-transform duration-200 font-semibold">استكشف خدماتنا</span>
                    <div className="relative">
                      <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                      {/* Animated dot */}
                      <div className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-white rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-ping"></div>
                    </div>
                  </span>
                  
                  {/* Enhanced glow effect on hover */}
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-sky-400/20 to-blue-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm"></div>
                </button>
              </div>
            </RevealAnimation>
          </div>
        </section>

        {/* Enhanced Services Sections with Scroll Animations */}
        <main className="space-y-12 md:space-y-16">
          {Object.entries(servicesData).map(([key, category]) => (
            <EnhancedServiceSection 
              key={key}
              sectionKey={key}
              category={category}
              activeSection={activeSection}
              onAddToCart={handleNotification}
            />
          ))}
        </main>

        {/* FAQ Section */}
        <section className="py-10 bg-gradient-to-br from-gray-900 to-black relative overflow-hidden z-10" aria-labelledby="faq-heading">
          <div className="absolute inset-0 bg-gradient-to-r from-sky-500/3 to-sky-700/3"></div>
          
          <div className="container mx-auto px-4 md:px-6 relative z-10">
            <div className="text-center mb-8">
              <h2 id="faq-heading" className="text-2xl md:text-3xl font-bold text-white mb-3">
                الأسئلة الشائعة
              </h2>
              <p className="text-gray-300 text-base max-w-2xl mx-auto">
                إجابات على الأسئلة الأكثر شيوعاً حول خدماتنا
              </p>
            </div>

            <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {faqData.map((faq) => (
                <FAQItem
                  key={faq.id}
                  id={faq.id}
                  question={faq.question}
                  answer={faq.answer}
                />
              ))}
            </div>
          </div>
        </section>

        {/* Enhanced Contact Section */}
        <section className="py-6 bg-gradient-to-br from-gray-900/95 to-slate-900/95 backdrop-blur-sm relative overflow-hidden z-10 rounded-2xl mx-4 my-6 border border-gray-700/60 shadow-xl" aria-labelledby="contact-heading">
          <div className="absolute inset-0 bg-gradient-to-r from-sky-500/5 to-blue-500/5 rounded-2xl"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(0,191,255,0.08),transparent_50%)]"></div>
          
          {/* Floating Elements */}
          <div className="absolute top-3 right-6 w-1.5 h-1.5 bg-sky-400 rounded-full animate-pulse"></div>
          <div className="absolute bottom-4 left-8 w-2 h-2 bg-blue-400 rounded-full animate-pulse delay-1000"></div>
          
          <div className="container mx-auto px-4 md:px-6 relative z-10">
            <div className="text-center mb-4">
              <div className="inline-block px-4 py-2 bg-gradient-to-r from-sky-500/15 to-blue-500/15 rounded-full border border-sky-500/20 mb-3">
                <span className="text-sky-300 text-xs font-medium">تواصل معنا</span>
              </div>
              <h2 id="contact-heading" className="text-xl md:text-2xl font-bold text-white mb-2">
                تواصل مع <span className="bg-clip-text text-transparent bg-gradient-to-r from-sky-400 via-blue-400 to-cyan-300">{storeConfig.storeName}</span>
              </h2>
              <p className="text-gray-300 text-sm max-w-xl mx-auto">
                نحن هنا لمساعدتك في جميع احتياجاتك التقنية
              </p>
            </div>

            <div className="flex justify-center gap-4 max-w-md mx-auto">
              {/* X (Twitter) Link */}
              <a 
                href="https://x.com/MDK7_" 
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-gray-800/60 backdrop-blur-sm rounded-xl p-4 border border-gray-700/60 hover:border-sky-500/50 transition-all duration-300 group hover:scale-105 hover:shadow-lg hover:shadow-sky-500/20 flex-1"
                aria-label="تابعنا على X"
              >
                <div className="flex flex-col items-center text-center">
                  <div className="w-10 h-10 bg-gradient-to-r from-sky-500 to-cyan-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-md mb-2">
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                    </svg>
                  </div>
                  <h3 className="text-white font-medium text-sm group-hover:text-sky-300 transition-colors">X</h3>
                  <p className="text-gray-400 text-xs">للتواصل</p>
                </div>
              </a>
              
              {/* WhatsApp Link */}
              <a 
                href={`https://wa.me/${(storeConfig.contact.whatsapp || '').replace(/\D/g,'') || '966543156466'}`}
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-gray-800/60 backdrop-blur-sm rounded-xl p-4 border border-gray-700/60 hover:border-green-500/50 transition-all duration-300 group hover:scale-105 hover:shadow-lg hover:shadow-green-500/20 flex-1"
                aria-label="تواصل معنا عبر واتساب"
              >
                <div className="flex flex-col items-center text-center">
                  <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-md mb-2">
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                    </svg>
                  </div>
                  <h3 className="text-white font-medium text-sm group-hover:text-green-300 transition-colors">واتساب</h3>
                  <p className="text-gray-400 text-xs">راسلنا</p>
                </div>
              </a>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-black/90 backdrop-blur-sm text-white py-8 border-t border-gray-800">
          <div className="container mx-auto px-4 md:px-6">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="mb-4 md:mb-0">
                <h3 className="text-lg font-bold">{storeConfig.storeName}</h3>
                <p className="text-sky-400 text-xs">{storeConfig.tagline}</p>
              </div>
              
              <div className="text-center md:text-right">
                <p className="text-gray-400 text-sm mb-1">© 2025 {storeConfig.storeName}. جميع الحقوق محفوظة</p>
                <p className="text-xs text-gray-500">الرس . المملكة العربية السعودية</p>
              </div>
            </div>
          </div>
        </footer>

        {/* Live Chat */}
        <ErrorBoundary>
          <LiveChat />
        </ErrorBoundary>

        {/* Notification */}
        {notification && (
          <ErrorBoundary>
            <Notification
              message={notification.message}
              type={notification.type}
              onClose={closeNotification}
            />
          </ErrorBoundary>
        )}

        {/* Support Chat */}
        <ErrorBoundary>
          <SupportChat />
        </ErrorBoundary>
      </div>
    </ErrorBoundary>
  );
}