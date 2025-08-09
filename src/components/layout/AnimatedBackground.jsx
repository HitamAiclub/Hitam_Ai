import React, { useEffect, useRef } from "react";
import { useTheme } from "../../contexts/ThemeContext";

const AnimatedBackground = () => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const touchRef = useRef({ x: 0, y: 0 });
  const { theme } = useTheme();

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    
    const setCanvasSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    setCanvasSize();
    window.addEventListener("resize", setCanvasSize);

    // Bubble system
    const bubbles = [];
    const poppedBubbles = [];
    const bubbleCount = window.innerWidth < 768 ? 25 : window.innerWidth < 1024 ? 40 : 60;
    
    // Bubble class
    class Bubble {
      constructor(x, y, customSize = null) {
        this.x = x || Math.random() * canvas.width;
        this.y = y || canvas.height + Math.random() * 200;
        this.size = customSize || Math.random() * 30 + 10;
        this.originalSize = this.size;
        this.vx = (Math.random() - 0.5) * 0.8;
        this.vy = -(Math.random() * 1.2 + 0.5);
        this.opacity = Math.random() * 0.8 + 0.4;
        this.originalOpacity = this.opacity;
        this.hue = Math.random() * 60 + 180; // Blue to cyan range
        this.saturation = Math.random() * 30 + 50;
        this.lightness = theme === "dark" ? Math.random() * 30 + 70 : Math.random() * 30 + 50;
        this.pulseSpeed = Math.random() * 0.02 + 0.01;
        this.pulseOffset = Math.random() * Math.PI * 2;
        this.glowIntensity = Math.random() * 0.5 + 0.3;
        this.driftAmplitude = Math.random() * 0.5 + 0.2;
        this.driftSpeed = Math.random() * 0.01 + 0.005;
        this.time = 0;
        this.isPopping = false;
        this.popProgress = 0;
        this.respawnDelay = 0;
      }

      update() {
        if (this.isPopping) {
          this.popProgress += 0.08;
          this.size = this.originalSize * (1 - this.popProgress);
          this.opacity = this.originalOpacity * (1 - this.popProgress);
          
          if (this.popProgress >= 1) {
            this.respawn();
          }
          return;
        }

        this.time += 0.016; // ~60fps

        // Floating movement with drift
        this.x += this.vx + Math.sin(this.time * this.driftSpeed) * this.driftAmplitude;
        this.y += this.vy;

        // Gentle pulsing effect
        const pulse = Math.sin(this.time * this.pulseSpeed + this.pulseOffset) * 0.1;
        this.size = this.originalSize + pulse * this.originalSize;
        this.opacity = this.originalOpacity + pulse * 0.2;

        // Respawn when bubble goes off screen
        if (this.y < -this.size * 2 || this.x < -this.size * 2 || this.x > canvas.width + this.size * 2) {
          this.respawn();
        }

        // Subtle color shifting
        this.hue += 0.1;
        if (this.hue > 240) this.hue = 180;
      }

      respawn() {
        this.x = Math.random() * canvas.width;
        this.y = canvas.height + Math.random() * 200;
        this.size = Math.random() * 30 + 10;
        this.originalSize = this.size;
        this.vx = (Math.random() - 0.5) * 0.8;
        this.vy = -(Math.random() * 1.2 + 0.5);
        this.opacity = Math.random() * 0.6 + 0.2;
        this.originalOpacity = this.opacity;
        this.hue = Math.random() * 60 + 180;
        this.isPopping = false;
        this.popProgress = 0;
        this.time = 0;
      }

      draw() {
        const alpha = Math.max(0, Math.min(1, this.opacity));
        
        // Create gradient for glow effect
        const gradient = ctx.createRadialGradient(
          this.x, this.y, 0,
          this.x, this.y, this.size * 2.5
        );
        
        const baseAlpha = theme === "dark" ? alpha * 1.2 : alpha * 0.8;
        const glowAlpha = theme === "dark" ? alpha * 0.6 : alpha * 0.4;
        
        gradient.addColorStop(0, `hsla(${this.hue}, ${this.saturation}%, ${this.lightness}%, ${baseAlpha})`);
        gradient.addColorStop(0.4, `hsla(${this.hue}, ${this.saturation}%, ${this.lightness}%, ${baseAlpha * 0.6})`);
        gradient.addColorStop(0.7, `hsla(${this.hue}, ${this.saturation}%, ${this.lightness}%, ${glowAlpha})`);
        gradient.addColorStop(1, `hsla(${this.hue}, ${this.saturation}%, ${this.lightness}%, 0)`);

        // Draw outer glow
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size * 2.5, 0, Math.PI * 2);
        ctx.fill();

        // Draw bubble with subtle inner gradient
        const innerGradient = ctx.createRadialGradient(
          this.x - this.size * 0.3, this.y - this.size * 0.3, 0,
          this.x, this.y, this.size
        );
        
        innerGradient.addColorStop(0, `hsla(${this.hue}, ${this.saturation}%, ${this.lightness + 20}%, ${baseAlpha})`);
        innerGradient.addColorStop(0.6, `hsla(${this.hue}, ${this.saturation}%, ${this.lightness}%, ${baseAlpha * 0.8})`);
        innerGradient.addColorStop(1, `hsla(${this.hue}, ${this.saturation}%, ${this.lightness - 10}%, ${baseAlpha * 0.6})`);

        ctx.fillStyle = innerGradient;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();

        // Add highlight for bubble effect
        if (!this.isPopping) {
          const highlightGradient = ctx.createRadialGradient(
            this.x - this.size * 0.4, this.y - this.size * 0.4, 0,
            this.x - this.size * 0.4, this.y - this.size * 0.4, this.size * 0.6
          );
          
          highlightGradient.addColorStop(0, `hsla(${this.hue}, 30%, 90%, ${baseAlpha * 0.8})`);
          highlightGradient.addColorStop(1, `hsla(${this.hue}, 30%, 90%, 0)`);

          ctx.fillStyle = highlightGradient;
          ctx.beginPath();
          ctx.arc(this.x - this.size * 0.4, this.y - this.size * 0.4, this.size * 0.6, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      checkCollision(x, y) {
        const dx = x - this.x;
        const dy = y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance < this.size && !this.isPopping;
      }

      pop() {
        if (!this.isPopping) {
          this.isPopping = true;
          this.popProgress = 0;
          
          // Create pop effect particles
          for (let i = 0; i < 8; i++) {
            poppedBubbles.push({
              x: this.x + (Math.random() - 0.5) * this.size,
              y: this.y + (Math.random() - 0.5) * this.size,
              vx: (Math.random() - 0.5) * 4,
              vy: (Math.random() - 0.5) * 4,
              size: Math.random() * 3 + 1,
              opacity: 0.8,
              hue: this.hue,
              life: 1
            });
          }
        }
      }
    }

    // Initialize bubbles
    for (let i = 0; i < bubbleCount; i++) {
      bubbles.push(new Bubble());
    }

    // Mouse/touch interaction
    const handleInteraction = (x, y) => {
      bubbles.forEach(bubble => {
        if (bubble.checkCollision(x, y)) {
          bubble.pop();
        }
      });
    };

    const handleMouseMove = (e) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };

    const handleClick = (e) => {
      handleInteraction(e.clientX, e.clientY);
    };

    const handleTouchStart = (e) => {
      e.preventDefault();
      const touch = e.touches[0];
      touchRef.current = { x: touch.clientX, y: touch.clientY };
      handleInteraction(touch.clientX, touch.clientY);
    };

    const handleTouchMove = (e) => {
      e.preventDefault();
      const touch = e.touches[0];
      touchRef.current = { x: touch.clientX, y: touch.clientY };
      handleInteraction(touch.clientX, touch.clientY);
    };

    // Event listeners
    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("click", handleClick);
    canvas.addEventListener("touchstart", handleTouchStart, { passive: false });
    canvas.addEventListener("touchmove", handleTouchMove, { passive: false });

    const animate = () => {
      // Clear canvas with subtle background
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Update and draw bubbles
      bubbles.forEach(bubble => {
        bubble.update();
        bubble.draw();
      });

      // Update and draw pop effect particles
      for (let i = poppedBubbles.length - 1; i >= 0; i--) {
        const particle = poppedBubbles[i];
        
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.vx *= 0.98;
        particle.vy *= 0.98;
        particle.life -= 0.02;
        particle.opacity = particle.life;
        particle.size *= 0.98;

        if (particle.life > 0) {
          ctx.fillStyle = `hsla(${particle.hue}, 60%, 70%, ${particle.opacity})`;
          ctx.beginPath();
          ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
          ctx.fill();
        } else {
          poppedBubbles.splice(i, 1);
        }
      }

      // Hover effect - make nearby bubbles slightly larger
      const mouse = mouseRef.current;
      const touch = touchRef.current;
      const interactionPoint = mouse.x ? mouse : touch;
      
      if (interactionPoint.x) {
        bubbles.forEach(bubble => {
          const dx = interactionPoint.x - bubble.x;
          const dy = interactionPoint.y - bubble.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < 100 && !bubble.isPopping) {
            const force = (100 - distance) / 100;
            bubble.size = bubble.originalSize * (1 + force * 0.2);
            bubble.opacity = bubble.originalOpacity * (1 + force * 0.3);
          }
        });
      }

      animationRef.current = requestAnimationFrame(animate);
    };
    
    animate();
    
    return () => {
      window.removeEventListener("resize", setCanvasSize);
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("click", handleClick);
      canvas.removeEventListener("touchstart", handleTouchStart);
      canvas.removeEventListener("touchmove", handleTouchMove);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [theme]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-0 w-full h-full pointer-events-auto"
      style={{ 
        background: theme === "dark" 
          ? "radial-gradient(ellipse at center, #0f172a 0%, #1e293b 50%, #0f172a 100%)"
          : "radial-gradient(ellipse at center, #f8fafc 0%, #f1f5f9 50%, #e2e8f0 100%)",
        touchAction: "none"
      }}
    />
  );
};

export default AnimatedBackground;