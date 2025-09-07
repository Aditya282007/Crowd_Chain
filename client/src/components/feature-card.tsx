import { LucideIcon } from "lucide-react";

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  bgColor?: string;
  textColor?: string;
  className?: string;
  style?: React.CSSProperties;
  onLearnMore?: () => void;
}

export default function FeatureCard({ 
  icon: Icon, 
  title, 
  description, 
  bgColor = "bg-primary", 
  textColor = "text-primary-foreground",
  className = "",
  style,
  onLearnMore
}: FeatureCardProps) {
  return (
    <div 
      className={`brutalist-card bg-card p-8 rounded-2xl animate-slide-up transform hover:rotate-1 transition-transform ${className}`}
      style={style}
      data-testid={`card-feature-${title.toLowerCase().replace(/\s+/g, '-')}`}
    >
      <div className="space-y-4">
        <div className={`brutalist-button ${bgColor} ${textColor} p-4 rounded-xl w-fit`}>
          <Icon className="text-2xl" size={32} />
        </div>
        
        <h3 className="text-2xl font-bold" data-testid={`text-feature-title-${title.toLowerCase().replace(/\s+/g, '-')}`}>
          {title}
        </h3>
        
        <p className="text-muted-foreground" data-testid={`text-feature-description-${title.toLowerCase().replace(/\s+/g, '-')}`}>
          {description}
        </p>
        
        <div className="pt-4">
          <button 
            onClick={onLearnMore}
            className="brutalist-button bg-background text-foreground px-4 py-2 rounded-lg text-sm border-3 border-black hover:bg-accent hover:text-accent-foreground transition-colors"
            data-testid={`button-learn-more-${title.toLowerCase().replace(/\s+/g, '-')}`}
          >
            Learn More
          </button>
        </div>
      </div>
    </div>
  );
}