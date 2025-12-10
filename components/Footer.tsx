import React from 'react';
import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full py-6 mt-12 text-center no-print">
      <div className="flex items-center justify-center space-x-2 text-sm text-slate-500 font-medium tracking-wide">
        <span>&copy; {currentYear} All rights reserved by AARAA Infrastructure Pvt Ltd.</span>
        
        <div className="relative group cursor-pointer inline-flex items-center justify-center w-6 h-6">
           {/* Static Heart (visible by default) */}
           <Heart className="w-4 h-4 text-red-500 group-hover:opacity-0 transition-opacity duration-300" fill="currentColor" />
           
           {/* Flying Heart (animates on hover) */}
           <motion.div
             className="absolute inset-0 flex items-center justify-center opacity-0"
             whileHover={{
               y: -40,
               opacity: [0, 1, 0],
               scale: [0.8, 1.2, 0.8],
               transition: { duration: 0.8, ease: "easeOut" }
             }}
           >
              <Heart className="w-4 h-4 text-red-500" fill="currentColor" />
           </motion.div>
        </div>
      </div>
    </footer>
  );
};
