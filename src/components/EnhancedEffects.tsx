"use client"

import { useEffect, useRef, useState, ReactNode } from 'react';

// Enhanced Background Component
export function EnhancedBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-slate-900 to-black opacity-90" />
      
      {/* Floating geometric shapes */}
      <div className="absolute inset-0">
        {Array.from({ length: 8 }, (_, i) => (
          <div
            key={i}
            className={`geometric-shape absolute`}
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
      
      {/* Floating particles */}
      <div className="absolute inset-0 particles-bg" />
      
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
}

// Magnetic Button Component
interface MagneticButtonProps {
  children: ReactNode;
  className?: string;
  strength?: number;
  [key: string]: any;
}

export function MagneticButton({ 
  children, 
  className = '', 
  strength = 0.3,
  ...props 
}: MagneticButtonProps) {
  const buttonRef = useRef<HTMLButtonElement>(null);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!buttonRef.current) return;
    
    const rect = buttonRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const deltaX = (e.clientX - centerX) * strength;
    const deltaY = (e.clientY - centerY) * strength;
    
    buttonRef.current.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
  };

  const handleMouseLeave = () => {
    if (!buttonRef.current) return;
    buttonRef.current.style.transform = 'translate(0px, 0px)';
  };

  return (
    <button
      ref={buttonRef}
      className={`magnetic ${className}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      {...props}
    >
      {children}
    </button>
  );
}

// Reveal Animation Component
interface RevealAnimationProps {
  children: ReactNode;
  direction?: 'up' | 'down' | 'left' | 'right';
  delay?: number;
  duration?: number;
  className?: string;
}

export function RevealAnimation({
  children,
  direction = 'up',
  delay = 0,
  duration = 800,
  className = ''
}: RevealAnimationProps) {
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
}

// Interactive Card Component
interface InteractiveCardProps {
  children: ReactNode;
  className?: string;
  hoverEffect?: 'glow' | 'lift' | 'tilt' | 'scale';
  glowColor?: string;
  [key: string]: any;
}

export function InteractiveCard({
  children,
  className = '',
  hoverEffect = 'lift',
  glowColor = 'rgba(0, 191, 255, 0.3)',
  ...props
}: InteractiveCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!cardRef.current || hoverEffect !== 'tilt') return;
    
    const rect = cardRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const rotateX = (e.clientY - centerY) / 10;
    const rotateY = (centerX - e.clientX) / 10;
    
    cardRef.current.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
  };

  const handleMouseLeave = () => {
    if (!cardRef.current) return;
    cardRef.current.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg)';
    setIsHovered(false);
  };

  const getHoverStyles = () => {
    if (!isHovered) return {};
    
    switch (hoverEffect) {
      case 'glow':
        return {
          boxShadow: `0 0 30px ${glowColor}, 0 0 60px ${glowColor}20`
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
      ref={cardRef}
      className={`interactive-card ${className}`}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      style={{
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        ...getHoverStyles()
      }}
      {...props}
    >
      {children}
    </div>
  );
}

// Parallax Scroll Component
interface ParallaxScrollProps {
  children: ReactNode;
  speed?: number;
  className?: string;
}

export function ParallaxScroll({
  children,
  speed = 0.5,
  className = ''
}: ParallaxScrollProps) {
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (!elementRef.current) return;
      
      const scrolled = window.pageYOffset;
      const parallax = scrolled * speed;
      
      elementRef.current.style.transform = `translateY(${parallax}px)`;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [speed]);

  return (
    <div ref={elementRef} className={className}>
      {children}
    </div>
  );
}

// Intersection Observer Hook
export function useIntersectionObserver(
  threshold = 0.1,
  rootMargin = '0px'
) {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [hasIntersected, setHasIntersected] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting);
        if (entry.isIntersecting) {
          setHasIntersected(true);
        }
      },
      { threshold, rootMargin }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [threshold, rootMargin]);

  return { ref, isIntersecting, hasIntersected };
}

// Floating Action Button
interface FloatingActionButtonProps {
  onClick: () => void;
  icon: ReactNode;
  label: string;
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  className?: string;
}

export function FloatingActionButton({
  onClick,
  icon,
  label,
  position = 'bottom-right',
  className = ''
}: FloatingActionButtonProps) {
  const getPositionStyles = () => {
    switch (position) {
      case 'bottom-right': return 'bottom-6 right-6';
      case 'bottom-left': return 'bottom-6 left-6';
      case 'top-right': return 'top-6 right-6';
      case 'top-left': return 'top-6 left-6';
      default: return 'bottom-6 right-6';
    }
  };

  return (
    <button
      onClick={onClick}
      className={`
        fixed z-50 w-14 h-14 bg-gradient-to-r from-sky-500 to-blue-600
        rounded-full shadow-2xl hover:shadow-sky-500/50 
        flex items-center justify-center text-white
        transform hover:scale-110 transition-all duration-300
        hover:from-sky-600 hover:to-blue-700
        ${getPositionStyles()} ${className}
      `}
      aria-label={label}
      title={label}
    >
      <div className="relative">
        {icon}
        <div className="absolute inset-0 rounded-full bg-white/20 animate-ping" />
      </div>
    </button>
  );
}

// Loading Spinner Component
interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  className?: string;
}

export function LoadingSpinner({
  size = 'md',
  color = 'border-sky-500',
  className = ''
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-2',
    lg: 'w-12 h-12 border-4'
  };

  return (
    <div className={`${sizeClasses[size]} ${color} border-t-transparent rounded-full animate-spin ${className}`} />
  );
}

// Gradient Text Component
interface GradientTextProps {
  children: ReactNode;
  gradient?: string;
  className?: string;
}

export function GradientText({
  children,
  gradient = 'from-sky-400 via-blue-500 to-cyan-600',
  className = ''
}: GradientTextProps) {
  return (
    <span className={`bg-gradient-to-r ${gradient} bg-clip-text text-transparent ${className}`}>
      {children}
    </span>
  );
}