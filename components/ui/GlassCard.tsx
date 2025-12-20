
import React from 'react';
import { motion } from 'framer-motion';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  onClick?: () => void;
}

export const GlassCard: React.FC<GlassCardProps> = ({ children, className = '', delay = 0, onClick }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: "easeOut" }}
      onClick={onClick}
      className={`
        glass-panel
        bg-white/70 
        dark:bg-[#2c2c2e]/70
        backdrop-blur-xl 
        border border-white/40 
        dark:border-white/10
        shadow-glass 
        rounded-2xl 
        p-6 
        transition-all 
        duration-300
        ${onClick ? 'cursor-pointer hover:shadow-glass-hover hover:scale-[1.01]' : ''}
        ${className}
      `}
    >
      {children}
    </motion.div>
  );
};