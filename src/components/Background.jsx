import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

const Background = () => {
  const canvasRef = useRef(null);
  const [score, setScore] = useState(0);
  const [showScore, setShowScore] = useState(false);
  const bubblesRef = useRef([]);
  const particlesRef = useRef([]);
  const animationIdRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    class Bubble {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = canvas.height + Math.random() * 200;
        this.size = Math.random() * 80 + 30;
        this.speed = Math.random() * 1 + 0.5;
        this.opacity = Math.random() * 0.4 + 0.3;
        this.angle = Math.random() * Math.PI * 2;
        this.wobble = Math.random() * 0.02 + 0.01;
        this.hue = Math.random() * 60 + 200; // Blue to purple range
        this.clickable = true;
        this.pulsePhase = Math.random() * Math.PI * 2;
      }

      update() {
        this.y -= this.speed;
        this.x += Math.sin(this.angle) * 0.5;
        this.angle += this.wobble;
        this.pulsePhase += 0.05;
        
        // Remove bubble if it goes off screen
        if (this.y < -this.size) {
          this.reset();
        }
      }

      reset() {
        this.x = Math.random() * canvas.width;
        this.y = canvas.height + Math.random() * 200;
        this.size = Math.random() * 80 + 30;
        this.speed = Math.random() * 1 + 0.5;
        this.opacity = Math.random() * 0.4 + 0.3;
        this.hue = Math.random() * 60 + 200;
        this.clickable = true;
        this.pulsePhase = Math.random() * Math.PI * 2;
      }

      draw() {
        ctx.save();
        
        // Pulsing effect
        const pulse = Math.sin(this.pulsePhase) * 0.1 + 1;
        const currentSize = this.size * pulse;
        
        ctx.globalAlpha = this.opacity;
        
        // Outer glow
        const gradient = ctx.createRadialGradient(
          this.x, this.y, 0,
          this.x, this.y, currentSize
        );
        gradient.addColorStop(0, `hsla(${this.hue}, 70%, 60%, 0.8)`);
        gradient.addColorStop(0.7, `hsla(${this.hue}, 70%, 50%, 0.4)`);
        gradient.addColorStop(1, `hsla(${this.hue}, 70%, 40%, 0)`);
        
        ctx.beginPath();
        ctx.arc(this.x, this.y, currentSize, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
        
        // Inner highlight
        ctx.globalAlpha = this.opacity * 0.6;
        const highlightGradient = ctx.createRadialGradient(
          this.x - currentSize * 0.3, this.y - currentSize * 0.3, 0,
          this.x, this.y, currentSize * 0.7
        );
        highlightGradient.addColorStop(0, `hsla(${this.hue}, 70%, 90%, 0.8)`);
        highlightGradient.addColorStop(1, `hsla(${this.hue}, 70%, 60%, 0)`);
        
        ctx.beginPath();
        ctx.arc(this.x, this.y, currentSize * 0.7, 0, Math.PI * 2);
        ctx.fillStyle = highlightGradient;
        ctx.fill();
        
        ctx.restore();
      }

      isClicked(mouseX, mouseY) {
        const distance = Math.sqrt((mouseX - this.x) ** 2 + (mouseY - this.y) ** 2);
        return distance < this.size && this.clickable;
      }

      pop() {
        this.clickable = false;
        // Create particles
        for (let i = 0; i < 8; i++) {
          particlesRef.current.push(new Particle(this.x, this.y, this.hue));
        }
        this.reset();
      }
    }

    class Particle {
      constructor(x, y, hue) {
        this.x = x;
        this.y = y;
        this.vx = (Math.random() - 0.5) * 8;
        this.vy = (Math.random() - 0.5) * 8;
        this.life = 1;
        this.decay = Math.random() * 0.02 + 0.02;
        this.size = Math.random() * 6 + 2;
        this.hue = hue;
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vy += 0.1; // gravity
        this.life -= this.decay;
        this.size *= 0.98;
      }

      draw() {
        ctx.save();
        ctx.globalAlpha = this.life;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = `hsl(${this.hue}, 70%, 60%)`;
        ctx.fill();
        ctx.restore();
      }

      isDead() {
        return this.life <= 0 || this.size <= 0.5;
      }
    }

    const init = () => {
      resizeCanvas();
      bubblesRef.current = [];
      for (let i = 0; i < 12; i++) {
        bubblesRef.current.push(new Bubble());
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Update and draw bubbles
      bubblesRef.current.forEach(bubble => {
        bubble.update();
        bubble.draw();
      });

      // Update and draw particles
      particlesRef.current = particlesRef.current.filter(particle => {
        particle.update();
        particle.draw();
        return !particle.isDead();
      });

      animationIdRef.current = requestAnimationFrame(animate);
    };

    const handleClick = (event) => {
      const rect = canvas.getBoundingClientRect();
      const mouseX = event.clientX - rect.left;
      const mouseY = event.clientY - rect.top;

      bubblesRef.current.forEach(bubble => {
        if (bubble.isClicked(mouseX, mouseY)) {
          bubble.pop();
          setScore(prev => prev + 10);
          setShowScore(true);
          setTimeout(() => setShowScore(false), 1000);
        }
      });
    };

    const handleResize = () => {
      resizeCanvas();
    };

    init();
    animate();

    canvas.addEventListener('click', handleClick);
    window.addEventListener('resize', handleResize);

    return () => {
      canvas.removeEventListener('click', handleClick);
      window.removeEventListener('resize', handleResize);
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
    };
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-auto cursor-crosshair"
        style={{ mixBlendMode: 'multiply' }}
      />
      
      {/* Score Display */}
      {showScore && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5, y: 50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.5, y: -50 }}
          className="fixed top-20 right-4 z-50 pointer-events-none"
        >
          <div className="bg-gradient-to-r from-purple-500 to-blue-500 text-white px-6 py-3 rounded-full shadow-lg">
            <span className="text-lg font-bold">Score: {score}</span>
          </div>
        </motion.div>
      )}

      {/* Game Instructions */}
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 2, duration: 0.8 }}
        className="fixed bottom-4 left-4 z-50 pointer-events-none"
      >
        <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-lg p-4 shadow-lg max-w-xs">
          <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-1">
            🎮 Bubble Pop Game
          </h3>
          <p className="text-xs text-gray-600 dark:text-gray-300">
            Click the floating bubbles to pop them and earn points! Score: {score}
          </p>
        </div>
      </motion.div>

      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-blue-500/5 to-teal-500/5 dark:from-purple-400/10 dark:via-blue-400/10 dark:to-teal-400/10 pointer-events-none" />
    </div>
  );
};

export default Background;