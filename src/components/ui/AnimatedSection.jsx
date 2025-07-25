import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

function AnimatedSection({ 
  children, 
  className = '', 
  delay = 0, 
  duration = 0.5, 
  animation = 'fade-up' 
}) {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });
  
  const animations = {
    'fade-up': {
      hidden: { y: 50, opacity: 0 },
      visible: { y: 0, opacity: 1 }
    },
    'fade-down': {
      hidden: { y: -50, opacity: 0 },
      visible: { y: 0, opacity: 1 }
    },
    'fade-left': {
      hidden: { x: -50, opacity: 0 },
      visible: { x: 0, opacity: 1 }
    },
    'fade-right': {
      hidden: { x: 50, opacity: 0 },
      visible: { x: 0, opacity: 1 }
    },
    'zoom-in': {
      hidden: { scale: 0.8, opacity: 0 },
      visible: { scale: 1, opacity: 1 }
    },
    'zoom-out': {
      hidden: { scale: 1.2, opacity: 0 },
      visible: { scale: 1, opacity: 1 }
    }
  };
  
  const selectedAnimation = animations[animation] || animations['fade-up'];
  
  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={inView ? 'visible' : 'hidden'}
      variants={selectedAnimation}
      transition={{ duration, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export default AnimatedSection;