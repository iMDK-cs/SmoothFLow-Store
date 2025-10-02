'use client';

import { usePathname } from 'next/navigation';
import Footer from './Footer';

const ConditionalFooter = () => {
  const pathname = usePathname();
  
  // Pages where footer should NOT be displayed
  const excludedPaths = [
    '/payment/temp',
    '/checkout',
    '/auth/signin',
    '/auth/signup',
  ];
  
  // Check if current path should exclude footer
  const shouldExcludeFooter = excludedPaths.some(path => pathname.startsWith(path));
  
  // Don't render footer on excluded pages
  if (shouldExcludeFooter) {
    return null;
  }
  
  // Render footer on all other pages
  return <Footer />;
};

export default ConditionalFooter;
