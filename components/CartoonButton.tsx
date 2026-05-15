import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'accent' | 'success'
}

export default function CartoonButton({ 
  children, 
  variant = 'primary', 
  className, 
  ...props 
}: ButtonProps) {
  const variants = {
    primary: 'bg-primary text-black hover:bg-yellow-400',
    secondary: 'bg-secondary text-white hover:bg-orange-600',
    accent: 'bg-accent text-white hover:bg-blue-600',
    success: 'bg-success text-black hover:bg-emerald-400',
  }

  return (
    <button
      className={cn(
        'cartoon-btn',
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}
