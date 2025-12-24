import { motion } from 'motion/react';
import { LucideIcon } from 'lucide-react';

interface PremiumButtonProps {
  children: React.ReactNode;
  href?: string;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  icon?: LucideIcon;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  className?: string;
}

export function PremiumButton({
  children,
  href,
  onClick,
  variant = 'primary',
  size = 'md',
  icon: Icon,
  iconPosition = 'right',
  fullWidth = false,
  className = ''
}: PremiumButtonProps) {
  const baseClasses = "relative inline-flex items-center justify-center gap-3 font-semibold rounded-xl transition-all duration-300 overflow-hidden group";
  
  const variantClasses = {
    primary: "bg-gradient-to-r from-primary to-orange-600 text-white shadow-lg hover:shadow-primary/40 hover:shadow-2xl",
    secondary: "bg-secondary text-foreground border-2 border-border hover:border-primary/50 hover:bg-secondary/80",
    outline: "bg-transparent border-2 border-primary text-primary hover:bg-primary/10 hover:border-primary"
  };

  const sizeClasses = {
    sm: "px-6 py-2.5 text-sm",
    md: "px-8 py-3.5 text-base",
    lg: "px-10 py-4 text-lg"
  };

  const combinedClasses = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${fullWidth ? 'w-full' : ''} ${className}`;

  const content = (
    <>
      {/* Animated gradient overlay on hover */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0"
        initial={{ x: '-100%' }}
        whileHover={{ x: '100%' }}
        transition={{ duration: 0.6, ease: "easeInOut" }}
      />

      {/* Ripple effect container */}
      <motion.div className="absolute inset-0 bg-white/10 rounded-xl" />

      {/* Content */}
      <span className="relative z-10 flex items-center gap-3">
        {Icon && iconPosition === 'left' && (
          <motion.div
            whileHover={{ x: -3 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <Icon size={size === 'sm' ? 16 : size === 'md' ? 20 : 24} />
          </motion.div>
        )}
        
        {children}
        
        {Icon && iconPosition === 'right' && (
          <motion.div
            whileHover={{ x: 3 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <Icon size={size === 'sm' ? 16 : size === 'md' ? 20 : 24} />
          </motion.div>
        )}
      </span>
    </>
  );

  const MotionComponent = motion[href ? 'a' : 'button'];

  return (
    <MotionComponent
      href={href}
      onClick={onClick}
      className={combinedClasses}
      whileHover={{ 
        scale: 1.02,
        y: -2
      }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
    >
      {content}
    </MotionComponent>
  );
}
