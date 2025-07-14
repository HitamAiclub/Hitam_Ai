import React, { useEffect, useRef } from 'react';
import { useTheme } from '../../contexts/ThemeContext';

const AnimatedBackground = () => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const trailRef = useRef([]);
  const { theme } = useTheme();

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    const setCanvasSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    setCanvasSize();
    window.addEventListener('resize', setCanvasSize);

    // Particles system
    const particles = [];
    const particleCount = window.innerWidth < 768 ? 30 : 60; // Fewer on mobile
    
    // Neural network connections
    const connections = [];
    
    // Initialize particles
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        size: Math.random() * 3 + 1,
        opacity: Math.random() * 0.6 + 0.2,
        pulse: Math.random() * 0.02 + 0.01,
        hue: Math.random() * 60 + 180, // Blue to cyan range
        originalSize: 0
      });
      particles[i].originalSize = particles[i].size;
    }

    // Mouse tracking
    const handleMouseMove = (e) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
      
      // Add to trail
      trailRef.current.push({
        x: e.clientX,
        y: e.clientY,
        opacity: 1,
        size: 8
      });
      
      // Limit trail length
      if (trailRef.current.length > 15) {
        trailRef.current.shift();
      }
    };

    // Click effect
    const handleClick = (e) => {
      const ripple = {
        x: e.clientX,
        y: e.clientY,
        radius: 0,
        maxRadius: 100,
        opacity: 0.8,
        expanding: true
      };
      
      const animateRipple = () => {
        if (ripple.expanding) {
          ripple.radius += 3;
          ripple.opacity -= 0.02;
          
          if (ripple.radius >= ripple.maxRadius || ripple.opacity <= 0) {
            return;
          }
          
          requestAnimationFrame(animateRipple);
        }
      };
      
      animateRipple();
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('click', handleClick);

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Update and draw particles
      particles.forEach((particle, index) => {
        // Update position
        particle.x += particle.vx;
        particle.y += particle.vy;
        
        // Update opacity (pulsing effect)
        particle.opacity += particle.pulse;
        if (particle.opacity > 0.8 || particle.opacity < 0.1) {
          particle.pulse *= -1;
        }
        
        // Bounce off edges
        if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1;
        if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1;
        
        // Mouse interaction - particles attracted to cursor
        const dx = mouseRef.current.x - particle.x;
        const dy = mouseRef.current.y - particle.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 150) {
          const force = (150 - distance) / 150;
          particle.size = particle.originalSize + force * 2;
          particle.vx += (dx / distance) * force * 0.01;
          particle.vy += (dy / distance) * force * 0.01;
        } else {
          particle.size = particle.originalSize;
        }
        
        // Draw particle with glow effect
        const gradient = ctx.createRadialGradient(
          particle.x, particle.y, 0,
          particle.x, particle.y, particle.size * 8
        );
        
        const alpha = theme === 'dark' ? particle.opacity : particle.opacity * 0.4;
        const color = `hsl(${particle.hue}, 70%, 60%)`;
        
        gradient.addColorStop(0, `hsla(${particle.hue}, 70%, 60%, ${alpha})`);
        gradient.addColorStop(0.5, `hsla(${particle.hue}, 70%, 60%, ${alpha * 0.3})`);
        gradient.addColorStop(1, `hsla(${particle.hue}, 70%, 60%, 0)`);
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size * 8, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw core particle
        ctx.fillStyle = `hsla(${particle.hue}, 70%, 80%, ${alpha})`;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();
      });
      
      // Draw neural network connections
      particles.forEach((particle, i) => {
        particles.slice(i + 1).forEach(otherParticle => {
          const dx = particle.x - otherParticle.x;
          const dy = particle.y - otherParticle.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < 120) {
            const opacity = (120 - distance) / 120;
            const alpha = theme === 'dark' ? opacity * 0.15 : opacity * 0.08;
            
            ctx.strokeStyle = `hsla(200, 70%, 60%, ${alpha})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(particle.x, particle.y);
            ctx.lineTo(otherParticle.x, otherParticle.y);
            ctx.stroke();
          }
        });
      });
      
      // Draw cursor trail
      trailRef.current.forEach((point, index) => {
        point.opacity -= 0.05;
        point.size -= 0.3;
        
        if (point.opacity > 0 && point.size > 0) {
          const gradient = ctx.createRadialGradient(
            point.x, point.y, 0,
            point.x, point.y, point.size * 3
          );
          
          const alpha = theme === 'dark' ? point.opacity * 0.6 : point.opacity * 0.3;
          gradient.addColorStop(0, `hsla(220, 70%, 70%, ${alpha})`);
          gradient.addColorStop(1, `hsla(220, 70%, 70%, 0)`);
          
          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.arc(point.x, point.y, point.size * 3, 0, Math.PI * 2);
          ctx.fill();
        }
      });
      
      // Clean up trail
      trailRef.current = trailRef.current.filter(point => point.opacity > 0 && point.size > 0);
      
      animationRef.current = requestAnimationFrame(animate);
    };
    
    animate();
    
    return () => {
      window.removeEventListener('resize', setCanvasSize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('click', handleClick);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [theme]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 -z-10 w-full h-full pointer-events-none"
      style={{ 
        background: theme === 'dark' 
          ? 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)'
          : 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #f8fafc 100%)'
      }}
    />
  );
};

export default AnimatedBackground;