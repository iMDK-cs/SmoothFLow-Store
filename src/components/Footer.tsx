'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

const Footer: React.FC = () => {

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <>
      {/* Back to Top Button - Centered above footer */}
      <div className="bg-[#000000] py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center">
            <button
              onClick={scrollToTop}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-full flex items-center justify-center transition-all duration-300"
              aria-label="الرجوع للأعلى"
            >
              <span className="text-sm mr-2">الرجوع للأعلى</span>
              <span className="text-lg">↑</span>
            </button>
          </div>
        </div>
      </div>

      <footer className="bg-[#000000] text-white relative overflow-hidden footer-rtl arabic-text" dir="rtl">

      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Right Column - Brand Section */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-white">SmoothFlow</h2>
            <p className="text-lg text-gray-300">PC Services</p>
            <p className="text-gray-400 text-sm leading-relaxed">
              متجر مختص بخدمات تحسين الأداء التقني
            </p>
          </div>

          {/* Center Column - Important Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">روابط مهمة</h3>
            <nav className="space-y-3">
              <Link href="/privacy" className="block text-gray-300 hover:text-blue-400 transition-colors duration-200 hover:underline">
                سياسة الخصوصية
              </Link>
              <Link href="/terms" className="block text-gray-300 hover:text-blue-400 transition-colors duration-200 hover:underline">
                الشروط والأحكام
              </Link>
            </nav>
          </div>

          {/* Left Column - Contact */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">تواصل معنا</h3>
            <div className="space-y-3">
              <a
                href="https://wa.me/966543156466"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-3 space-x-reverse text-gray-300 hover:text-green-400 transition-colors duration-200"
              >
                <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                  </svg>
                </div>
                <span>واتساب</span>
              </a>
              
              <a
                href="https://x.com/MDK7_"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-3 space-x-reverse text-gray-300 hover:text-blue-400 transition-colors duration-200"
              >
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                </div>
                <span>تويتر</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800 bg-[#000000]"> 
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col lg:flex-row items-center justify-between space-y-4 lg:space-y-0">
            
            {/* Left - Copyright */}
            <div className="text-center lg:text-right">
              <p className="text-sm text-white">
                SmoothFlow © 2025. جميع الحقوق محفوظة
              </p>
            </div>

            {/* Center - Payment Methods */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-3">
                {/* Mada - Using SVG with white background */}
                <div className="h-8 w-20 bg-white rounded hover:scale-105 transition-transform duration-200 cursor-pointer shadow-sm border border-gray-200 flex items-center justify-center">
                  <Image 
                    src="/شعار مدى – SVG.svg" 
                    alt="مدى" 
                    width={72} 
                    height={28} 
                    className="object-contain"
                  />
                </div>

                {/* Visa - Using SVG */}
                <div className="h-8 w-20 bg-white rounded hover:scale-105 transition-transform duration-200 cursor-pointer shadow-sm border border-gray-200 flex items-center justify-center">
                  <Image 
                    src="/visa-svgrepo-com.svg" 
                    alt="Visa" 
                    width={56} 
                    height={28} 
                    className="object-contain"
                  />
                </div>

                {/* Bank Transfer - Smaller */}
                <div className="h-6 w-14 bg-white rounded hover:scale-105 transition-transform duration-200 cursor-pointer shadow-sm border border-gray-200 flex items-center justify-center">
                  <Image 
                    src="/bank-transfer-logo-svgrepo-com.svg" 
                    alt="تحويل بنكي" 
                    width={40} 
                    height={20} 
                    className="object-contain"
                  />
                </div>

                {/* Apple Pay */}
                <div className="h-8 w-20 bg-black rounded hover:scale-105 transition-transform duration-200 cursor-pointer shadow-sm flex items-center justify-center">
                  <svg className="w-5 h-5 text-white mr-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                  </svg>
                  <span className="text-xs font-semibold text-white">Pay</span>
                </div>
              </div>
            </div>

            {/* Right - Empty space for balance */}
            <div></div>
          </div>
        </div>
      </div>
    </footer>
    </>
  );
};

export default Footer;