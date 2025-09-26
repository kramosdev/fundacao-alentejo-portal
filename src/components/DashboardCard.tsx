import { ReactNode } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LucideIcon } from "lucide-react";

interface DashboardCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  children?: ReactNode;
  className?: string;
  onClick?: () => void;
  variant?: 'default' | 'primary' | 'secondary' | 'accent';
}

export function DashboardCard({ 
  title, 
  description, 
  icon: Icon, 
  children, 
  className = "", 
  onClick,
  variant = 'default'
}: DashboardCardProps) {
  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return "portal-card-interactive border-primary/20 hover:border-primary/40 hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] group";
      case 'secondary':
        return "portal-card-interactive border-secondary/20 hover:border-secondary/40 hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] group";
      case 'accent':
        return "portal-card-interactive border-accent/20 hover:border-accent/40 hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] group";
      default:
        return "portal-card-interactive group";
    }
  };

  const CardWrapper = onClick ? 'div' : Card;
  const cardProps = onClick ? { 
    className: `${getVariantStyles()} ${className} cursor-pointer`,
    onClick 
  } : { 
    className: `portal-card ${className}` 
  };

  return (
    <CardWrapper {...cardProps}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg transition-all duration-200 ${
              variant === 'primary' ? 'bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground' :
              variant === 'secondary' ? 'bg-secondary/10 text-secondary group-hover:bg-secondary group-hover:text-secondary-foreground' :
              variant === 'accent' ? 'bg-accent/10 text-accent group-hover:bg-accent group-hover:text-accent-foreground' :
              'bg-muted text-muted-foreground group-hover:bg-primary group-hover:text-primary-foreground'
            }`}>
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-lg group-hover:text-foreground transition-colors">{title}</CardTitle>
              <CardDescription className="text-sm text-muted-foreground group-hover:text-muted-foreground/80">
                {description}
              </CardDescription>
            </div>
          </div>
        </div>
      </CardHeader>
      {children && (
        <CardContent className="pt-0">
          {children}
        </CardContent>
      )}
    </CardWrapper>
  );
}