export const FadeIn = ({ children, className, delay = 0 }: { children: React.ReactNode, className?: string, delay?: number }) => (
  <div className={`animate-in fade-in slide-in-from-bottom-2 duration-500 ${className}`} style={{ animationDelay: `${delay * 1000}ms` }}>
    {children}
  </div>
)

export const StaggerContainer = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <div className={className}>
    {children}
  </div>
)

export const StaggerItem = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <div className={`animate-in fade-in slide-in-from-bottom-4 duration-500 ${className}`}>
    {children}
  </div>
)

export const ScaleIn = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <div className={`animate-in zoom-in-95 duration-300 ${className}`}>
    {children}
  </div>
)
