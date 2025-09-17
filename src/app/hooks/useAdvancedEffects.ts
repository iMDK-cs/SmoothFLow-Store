"use client";

import { useState, useEffect, useCallback, useRef } from 'react';

// Enhanced scroll effects hook
export const useAdvancedScrollEffects = () => {
  const [scrollY, setScrollY] = useState(0);
  const [scrollDirection, setScrollDirection] = useState<'up' | 'down'>('up');
  const [scrollVelocity, setScrollVelocity] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);
  const [parallaxOffset, setParallaxOffset] = useState(0);

  useEffect(() => {
    let lastScrollY = window.scrollY;
    let ticking = false;

    const updateScrollData = () => {
      const currentScrollY = window.scrollY;
      const velocity = Math.abs(currentScrollY - lastScrollY);
      
      setScrollY(currentScrollY);
      setScrollDirection(currentScrollY > lastScrollY ? 'down' : 'up');
      setScrollVelocity(velocity);
      setIsScrolled(currentScrollY > 50);
      setParallaxOffset(currentScrollY * 0.5);
      
      lastScrollY = currentScrollY;
      ticking = false;
    };

    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(updateScrollData);
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return { scrollY, scrollDirection, scrollVelocity, isScrolled, parallaxOffset };
};

// Magnetic effect hook
export const useMagneticEffect = (strength = 0.3) => {
  const ref = useRef<HTMLElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!ref.current) return;

    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const deltaX = (e.clientX - centerX) * strength;
    const deltaY = (e.clientY - centerY) * strength;
    
    setPosition({ x: deltaX, y: deltaY });
  }, [strength]);

  const handleMouseLeave = useCallback(() => {
    setPosition({ x: 0, y: 0 });
  }, []);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    element.addEventListener('mousemove', handleMouseMove);
    element.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      element.removeEventListener('mousemove', handleMouseMove);
      element.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [handleMouseMove, handleMouseLeave]);

  return { ref, position };
};

// Intersection observer hook for reveal animations
export const useRevealAnimation = (threshold = 0.1) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const currentRef = ref.current;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold }
    );

    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [threshold]);

  return { ref, isVisible };
};

// Particle system hook
export const useParticleSystem = (count = 50) => {
  const [particles, setParticles] = useState<Array<{
    id: number;
    x: number;
    y: number;
    vx: number;
    vy: number;
    size: number;
    opacity: number;
    color: string;
  }>>([]);

  useEffect(() => {
    const newParticles = Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      size: Math.random() * 3 + 1,
      opacity: Math.random() * 0.5 + 0.2,
      color: Math.random() > 0.5 ? '#00bfff' : '#87ceeb'
    }));
    
    setParticles(newParticles);
  }, [count]);

  const updateParticles = useCallback(() => {
    setParticles(prev => prev.map(particle => ({
      ...particle,
      x: (particle.x + particle.vx + window.innerWidth) % window.innerWidth,
      y: (particle.y + particle.vy + window.innerHeight) % window.innerHeight,
    })));
  }, []);

  useEffect(() => {
    const interval = setInterval(updateParticles, 50);
    return () => clearInterval(interval);
  }, [updateParticles]);

  return particles;
};

// Cursor trail effect hook
export const useCursorTrail = () => {
  const [trail, setTrail] = useState<Array<{ x: number; y: number; id: number }>>([]);
  // const trailRef = useRef<number[]>([]); // Removed unused variable

  useEffect(() => {
    let animationId: number;

    const updateTrail = () => {
      setTrail(prev => {
        const newTrail = [...prev];
        // Remove old trail points
        if (newTrail.length > 20) {
          newTrail.shift();
        }
        return newTrail;
      });
      animationId = requestAnimationFrame(updateTrail);
    };

    const handleMouseMove = (e: MouseEvent) => {
      const newPoint = {
        x: e.clientX,
        y: e.clientY,
        id: Date.now()
      };
      
      setTrail(prev => [...prev, newPoint]);
    };

    window.addEventListener('mousemove', handleMouseMove);
    animationId = requestAnimationFrame(updateTrail);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return trail;
};

// Typing animation hook
export const useTypingAnimation = (text: string, speed = 100) => {
  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(true);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayedText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, speed);

      return () => clearTimeout(timeout);
    } else {
      setIsTyping(false);
    }
  }, [currentIndex, text, speed]);

  const reset = useCallback(() => {
    setDisplayedText('');
    setCurrentIndex(0);
    setIsTyping(true);
  }, []);

  return { displayedText, isTyping, reset };
};

// Glitch effect hook
export const useGlitchEffect = (trigger = false) => {
  const [isGlitching, setIsGlitching] = useState(false);

  useEffect(() => {
    if (trigger) {
      setIsGlitching(true);
      const timeout = setTimeout(() => {
        setIsGlitching(false);
      }, 200);

      return () => clearTimeout(timeout);
    }
  }, [trigger]);

  return isGlitching;
};

// Sound wave visualization hook
export const useSoundWave = () => {
  const [waveData, setWaveData] = useState<number[]>([]);

  useEffect(() => {
    const generateWave = () => {
      const data = Array.from({ length: 64 }, () => Math.random() * 100);
      setWaveData(data);
    };

    const interval = setInterval(generateWave, 100);
    return () => clearInterval(interval);
  }, []);

  return waveData;
};