interface HeroCardProps {
  title: string;
  description: string;
  progress: number;
  raised: string;
  goal: string;
  category: string;
  imageUrl?: string;
  className?: string;
}

export default function HeroCard({ 
  title, 
  description, 
  progress, 
  raised, 
  goal, 
  category, 
  imageUrl,
  className = "" 
}: HeroCardProps) {
  return (
    <div className={`brutalist-card bg-card p-8 rounded-2xl transform rotate-2 ${className}`}>
      <div className="space-y-6">
        {imageUrl ? (
          <img 
            src={imageUrl} 
            alt={title}
            className="w-full h-48 object-cover rounded-xl border-3 border-black"
            data-testid="img-hero-card"
          />
        ) : (
          <div className="w-full h-48 bg-gradient-to-br from-primary to-accent rounded-xl border-3 border-black" data-testid="img-hero-card-placeholder"></div>
        )}
        
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="brutalist-button bg-secondary text-secondary-foreground px-3 py-1 rounded-lg text-sm font-bold" data-testid="text-category">
              {category}
            </span>
          </div>
          
          <h3 className="text-2xl font-bold" data-testid="text-hero-card-title">{title}</h3>
          
          {description && (
            <p className="text-muted-foreground" data-testid="text-hero-card-description">{description}</p>
          )}
          
          <div className="flex justify-between items-center">
            <span className="text-sm font-semibold text-muted-foreground">Progress</span>
            <span className="text-lg font-black text-accent" data-testid="text-hero-card-progress">{progress}%</span>
          </div>
          
          <div className="w-full bg-muted border-2 border-black rounded-lg h-4">
            <div 
              className="bg-accent h-full rounded-lg border-2 border-black transition-all duration-500" 
              style={{ width: `${Math.min(progress, 100)}%` }}
              data-testid="progress-bar-hero-card"
            ></div>
          </div>
          
          <div className="flex justify-between">
            <span className="font-semibold" data-testid="text-hero-card-raised">{raised} raised</span>
            <span className="font-semibold text-muted-foreground" data-testid="text-hero-card-goal">of {goal}</span>
          </div>
        </div>
      </div>
    </div>
  );
}