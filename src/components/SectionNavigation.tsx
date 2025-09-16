"use client"

import { useState, useEffect, useCallback, useRef } from 'react'

interface SectionNavigationProps {
  activeSection: string
  onSectionClick: (sectionId: string) => void
  headerStyle?: 'default' | 'maintenance' | 'tweaking' | 'assembly' | 'contact'
  sectionProgress?: number
}

  const scrollToSection = useCallback((sectionId: string) => {
    if (sectionId === 'hero') {
      window.scrollTo({ 
        top: 0,
        behavior: 'smooth'
      })
    } else {
      // Try to find the section by ID first
      let element = document.getElementById(sectionId)
      
      // If not found by ID, try to find by section content
      if (!element) {
        const sections = document.querySelectorAll('section')
        for (const section of sections) {
          const categoryTitle = section.querySelector('h2, h3')
          if (categoryTitle) {
            const titleText = categoryTitle.textContent?.toLowerCase()
            if (sectionId === 'assembly' && (titleText?.includes('تركيب') || titleText?.includes('ويندوز'))) {
              element = section as HTMLElement
              break
            } else if (sectionId === 'maintenance' && (titleText?.includes('صيانة') || titleText?.includes('إصلاح'))) {
              element = section as HTMLElement
              break
            } else if (sectionId === 'tweaking' && (titleText?.includes('تطوير') || titleText?.includes('تحسين'))) {
              element = section as HTMLElement
              break
            }
          }
        }
      }
      
      // If still not found, try to find contact section
      if (!element && sectionId === 'contact') {
        const sections = document.querySelectorAll('section')
        element = sections[sections.length - 1] as HTMLElement
      }
      
      if (element) {
        const headerHeight = 80
        const elementTop = element.getBoundingClientRect().top + window.pageYOffset
        
        window.scrollTo({ 
          top: elementTop - headerHeight,
          behavior: 'smooth'
        })
      }
    }
    
    onSectionClick(sectionId)
  }, [onSectionClick])

  // Get background style based on header style
  const getBackgroundStyle = () => {
    switch (headerStyle) {
      case 'maintenance':
        return 'bg-orange-900/95 border-orange-500/30 shadow-orange-500/20'
      case 'tweaking':
        return 'bg-green-900/95 border-green-500/30 shadow-green-500/20'
      case 'assembly':
        return 'bg-purple-900/95 border-purple-500/30 shadow-purple-500/20'
      case 'contact':
        return 'bg-red-900/95 border-red-500/30 shadow-red-500/20'
      default:
        return 'bg-gray-800/95 border-gray-600/50 shadow-gray-500/20'
    }
  }

  if (!isVisible) return null

  return (
    <div 
      className={`fixed top-20 right-4 z-40 backdrop-blur-md rounded-xl shadow-2xl border transition-all duration-500 animate-in slide-in-from-right-2 ${getBackgroundStyle()}`}
      dir="rtl"
    >
      {/* Progress Bar */}
      <div 
        className="absolute top-0 left-0 h-full bg-gradient-to-b from-blue-500/20 to-transparent rounded-xl transition-all duration-300" 
        style={{ height: `${sectionProgress * 100}%` }} 
      />
      
      {/* Sections List */}
      <div className="flex flex-col space-y-1 p-3 relative z-10">
        {sections.map((section) => {
          const isActive = activeSection === section.id
          
          return (
            <button
              key={section.id}
              onClick={() => scrollToSection(section.id)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 group relative overflow-hidden ${
                isActive
                  ? `bg-gradient-to-r ${section.color} text-white shadow-xl scale-105 shadow-black/25`
                  : 'text-gray-300 hover:text-white hover:bg-white/10 hover:scale-105'
              }`}
              title={section.label}
            >
              {/* Active indicator */}
              {isActive && (
                <div className="absolute -right-1 top-1/2 transform -translate-y-1/2 w-1 h-6 bg-white rounded-full shadow-lg animate-pulse"></div>
              )}
              
              {/* Icon */}
              <span className={`text-lg transition-all duration-300 ${
                isActive ? 'scale-110' : 'group-hover:scale-110'
              }`}>
                {section.icon}
              </span>
              
              {/* Label */}
              <span className="hidden sm:block transition-all duration-300 font-arabic">
                {section.label}
              </span>
              
              {/* Pulse effect for active section */}
              {isActive && (
                <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent rounded-lg animate-pulse"></div>
              )}
            </button>
          )
        })}
      </div>
      
      {/* Current Section Indicator */}
      <div className="px-3 py-2 bg-black/20 rounded-b-xl text-xs text-center text-gray-300 border-t border-white/10">
        <div className="font-arabic text-white/80">
          {sections.find(s => s.id === activeSection)?.label || 'غير معروف'}
        </div>
        <div className="text-white/40 text-[10px] mt-1">
          {Math.round(sectionProgress * 100)}%
        </div>
      </div>
    </div>
  )


// Simplified scroll detection hook
interface ScrollState {
  currentSection: string;
  previousSection: string;
  scrollDirection: 'up' | 'down' | 'none';
  scrollY: number;
  isScrolled: boolean;
  sectionProgress: number;
  headerStyle: 'default' | 'maintenance' | 'tweaking' | 'assembly' | 'contact';
}

interface SectionInfo {
  id: string;
  element: HTMLElement;
  top: number;
  bottom: number;
  height: number;
}

export const useAdvancedScrollDetection = () => {
  const [scrollState, setScrollState] = useState<ScrollState>({
    currentSection: 'hero',
    previousSection: '',
    scrollDirection: 'none',
    scrollY: 0,
    isScrolled: false,
    sectionProgress: 0,
    headerStyle: 'default'
  });

  const lastScrollY = useRef(0);
  const ticking = useRef(false);
  const sectionsRef = useRef<SectionInfo[]>([]);

  const sectionIds = ['hero', 'assembly', 'maintenance', 'tweaking', 'contact'];

  // Get header style based on current section
  const getHeaderStyle = useCallback((section: string): ScrollState['headerStyle'] => {
    switch (section) {
      case 'maintenance':
        return 'maintenance';
      case 'tweaking':
        return 'tweaking';
      case 'assembly':
        return 'assembly';
      case 'contact':
        return 'contact';
      default:
        return 'default';
    }
  }, []);

  // Calculate section progress (0-1)
  const calculateSectionProgress = useCallback((section: SectionInfo, scrollY: number): number => {
    const viewportHeight = window.innerHeight;
    const sectionTop = section.top;
    const sectionHeight = section.height;

    const scrollProgress = Math.max(0, Math.min(1, (scrollY - sectionTop + viewportHeight / 2) / sectionHeight));
    return scrollProgress;
  }, []);

  // Update sections information
  const updateSections = useCallback(() => {
    const sections: SectionInfo[] = [];
    
    const sectionSelectors = [
      { 
        id: 'hero', 
        selectors: ['#hero', 'section:first-of-type', '.hero-section'] 
      },
      { 
        id: 'assembly', 
        selectors: ['#assembly', '[data-section="assembly"]'] 
      },
      { 
        id: 'maintenance', 
        selectors: ['#maintenance', '[data-section="maintenance"]'] 
      },
      { 
        id: 'tweaking', 
        selectors: ['#tweaking', '[data-section="tweaking"]'] 
      },
      { 
        id: 'contact', 
        selectors: ['#contact', '[data-section="contact"]', 'section:last-of-type'] 
      }
    ];

    sectionSelectors.forEach(({ id, selectors }) => {
      let element: HTMLElement | null = null;
      
      for (const selector of selectors) {
        try {
          element = document.querySelector(selector) as HTMLElement;
          if (element) break;
        } catch (e) {
          continue;
        }
      }
      
      if (element) {
        const rect = element.getBoundingClientRect();
        const scrollY = window.pageYOffset;
        
        sections.push({
          id,
          element,
          top: rect.top + scrollY,
          bottom: rect.bottom + scrollY,
          height: rect.height
        });
      }
    });

    sectionsRef.current = sections;
  }, []);

  // Find current section
  const findCurrentSection = useCallback((scrollY: number): string => {
    const viewportHeight = window.innerHeight;
    const scrollCenter = scrollY + viewportHeight / 3;

    for (const section of sectionsRef.current) {
      if (scrollCenter >= section.top && scrollCenter <= section.bottom) {
        return section.id;
      }
    }

    // Fallback to most visible section
    let mostVisibleSection = sectionsRef.current[0]?.id || 'hero';
    let maxVisibleArea = 0;

    sectionsRef.current.forEach(section => {
      const visibleTop = Math.max(scrollY, section.top);
      const visibleBottom = Math.min(scrollY + viewportHeight, section.bottom);
      const visibleArea = Math.max(0, visibleBottom - visibleTop);
      
      if (visibleArea > maxVisibleArea) {
        maxVisibleArea = visibleArea;
        mostVisibleSection = section.id;
      }
    });

    return mostVisibleSection;
  }, []);

  // Handle scroll
  const handleScroll = useCallback(() => {
    if (!ticking.current) {
      requestAnimationFrame(() => {
        const currentScrollY = window.pageYOffset;
        const direction = currentScrollY > lastScrollY.current ? 'down' : 
                         currentScrollY < lastScrollY.current ? 'up' : 'none';
        
        const currentSection = findCurrentSection(currentScrollY);
        const currentSectionInfo = sectionsRef.current.find(s => s.id === currentSection);
        const sectionProgress = currentSectionInfo ? 
          calculateSectionProgress(currentSectionInfo, currentScrollY) : 0;

        setScrollState(prevState => ({
          ...prevState,
          scrollY: currentScrollY,
          scrollDirection: direction,
          currentSection,
          previousSection: prevState.currentSection !== currentSection ? prevState.currentSection : prevState.previousSection,
          isScrolled: currentScrollY > 50,
          sectionProgress,
          headerStyle: getHeaderStyle(currentSection)
        }));

        lastScrollY.current = currentScrollY;
        ticking.current = false;
      });
      ticking.current = true;
    }
  }, [findCurrentSection, calculateSectionProgress, getHeaderStyle]);

  // Initialize
  useEffect(() => {
    const initializeTimeout = setTimeout(() => {
      updateSections();
      handleScroll();
    }, 100);

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', updateSections, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', updateSections);
      clearTimeout(initializeTimeout);
    };
  }, [handleScroll, updateSections]);

  // Scroll to section
  const scrollToSection = useCallback((sectionId: string) => {
    const section = sectionsRef.current.find(s => s.id === sectionId);
    if (section) {
      window.scrollTo({
        top: section.top - 80,
        behavior: 'smooth'
      });
    } else if (sectionId === 'hero') {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
  }, []);

  return {
    ...scrollState,
    scrollToSection,
    updateSections
  };
};