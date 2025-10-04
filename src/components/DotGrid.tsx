'use client';

import React, { useEffect, useRef } from 'react';

interface DotGridProps {
  dotSize?: number;
  gap?: number;
  baseColor?: string;
  activeColor?: string;
  proximity?: number;
  shockRadius?: number;
  shockStrength?: number;
  resistance?: number;
  returnDuration?: number;
}

const DotGrid: React.FC<DotGridProps> = ({
  dotSize = 10,
  gap = 15,
  baseColor = "#5227FF",
  activeColor = "#5227FF",
  proximity = 120,
  shockRadius = 250,
  shockStrength = 5,
  resistance = 750,
  returnDuration = 1.5
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const dotsRef = useRef<Array<{
    x: number;
    y: number;
    originalX: number;
    originalY: number;
    vx: number;
    vy: number;
    targetX: number;
    targetY: number;
  }>>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };

    const initDots = () => {
      dotsRef.current = [];
      const cols = Math.floor(canvas.width / gap) + 1;
      const rows = Math.floor(canvas.height / gap) + 1;

      for (let i = 0; i < cols * rows; i++) {
        const x = (i % cols) * gap;
        const y = Math.floor(i / cols) * gap;
        dotsRef.current.push({
          x,
          y,
          originalX: x,
          originalY: y,
          vx: 0,
          vy: 0,
          targetX: x,
          targetY: y
        });
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      dotsRef.current.forEach((dot, i) => {
        // Apply resistance
        dot.vx *= resistance / 1000;
        dot.vy *= resistance / 1000;

        // Move towards target
        const dx = dot.targetX - dot.x;
        const dy = dot.targetY - dot.y;
        dot.vx += dx * 0.1;
        dot.vy += dy * 0.1;

        // Update position
        dot.x += dot.vx;
        dot.y += dot.vy;

        // Draw dot
        ctx.beginPath();
        ctx.arc(dot.x, dot.y, dotSize / 2, 0, Math.PI * 2);
        ctx.fillStyle = baseColor;
        ctx.fill();
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    resizeCanvas();
    initDots();
    animate();

    const handleResize = () => {
      resizeCanvas();
      initDots();
    };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      dotsRef.current.forEach((dot) => {
        const dx = mouseX - dot.x;
        const dy = mouseY - dot.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < proximity) {
          const force = (proximity - distance) / proximity;
          const angle = Math.atan2(dy, dx);
          const pushX = Math.cos(angle) * force * shockStrength;
          const pushY = Math.sin(angle) * force * shockStrength;

          dot.targetX = dot.originalX + pushX;
          dot.targetY = dot.originalY + pushY;
        } else {
          dot.targetX = dot.originalX;
          dot.targetY = dot.originalY;
        }
      });
    };

    window.addEventListener('resize', handleResize);
    canvas.addEventListener('mousemove', handleMouseMove);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      window.removeEventListener('resize', handleResize);
      canvas.removeEventListener('mousemove', handleMouseMove);
    };
  }, [dotSize, gap, baseColor, activeColor, proximity, shockRadius, shockStrength, resistance, returnDuration]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{ background: 'transparent' }}
    />
  );
};

export default DotGrid;
