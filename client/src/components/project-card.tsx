interface ProjectCardProps {
  id: string;
  title: string;
  description: string;
  goal: string;
  raised: string;
  progress: number;
  category: string;
  creator: string;
  daysLeft: number;
  imageUrl?: string;
  className?: string;
  onInvest?: (projectId: string) => void;
  onViewDetails?: (projectId: string) => void;
}

export default function ProjectCard({ 
  id,
  title, 
  description, 
  goal,
  raised, 
  progress, 
  category,
  creator,
  daysLeft,
  imageUrl,
  className = "",
  onInvest,
  onViewDetails
}: ProjectCardProps) {
  return (
    <div 
      className={`brutalist-card bg-card p-6 rounded-2xl hover:rotate-1 transition-all duration-300 ${className}`}
      data-testid={`card-project-${id}`}
    >
      <div className="space-y-4">
        {imageUrl ? (
          <img 
            src={imageUrl} 
            alt={title}
            className="w-full h-40 object-cover rounded-xl border-3 border-black"
            data-testid={`img-project-${id}`}
          />
        ) : (
          <div className="w-full h-40 bg-gradient-to-br from-primary to-accent rounded-xl border-3 border-black" data-testid={`img-project-placeholder-${id}`}></div>
        )}
        
        <div className="flex items-center justify-between">
          <span className="brutalist-button bg-secondary text-secondary-foreground px-3 py-1 rounded-lg text-xs font-bold" data-testid={`text-category-${id}`}>
            {category}
          </span>
          <span className="text-sm font-semibold text-muted-foreground" data-testid={`text-days-left-${id}`}>
            {daysLeft} days left
          </span>
        </div>
        
        <div className="space-y-2">
          <h3 className="text-xl font-bold line-clamp-2" data-testid={`text-project-title-${id}`}>
            {title}
          </h3>
          
          <p className="text-sm text-muted-foreground line-clamp-2" data-testid={`text-project-description-${id}`}>
            {description}
          </p>
          
          <p className="text-sm font-semibold" data-testid={`text-creator-${id}`}>
            by {creator}
          </p>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-semibold text-muted-foreground">Progress</span>
            <span className="text-lg font-black text-accent" data-testid={`text-progress-${id}`}>{progress}%</span>
          </div>
          
          <div className="w-full bg-muted border-2 border-black rounded-lg h-3">
            <div 
              className="bg-accent h-full rounded-lg border-2 border-black transition-all duration-500" 
              style={{ width: `${Math.min(progress, 100)}%` }}
              data-testid={`progress-bar-${id}`}
            ></div>
          </div>
          
          <div className="flex justify-between">
            <span className="font-semibold" data-testid={`text-raised-${id}`}>{raised}</span>
            <span className="font-semibold text-muted-foreground" data-testid={`text-goal-${id}`}>of {goal}</span>
          </div>
        </div>
        
        <div className="flex gap-2 pt-2">
          <button 
            onClick={() => onViewDetails?.(id)}
            className="flex-1 brutalist-button bg-background text-foreground px-4 py-2 rounded-lg text-sm border-3 border-black hover:bg-primary hover:text-primary-foreground transition-colors"
            data-testid={`button-view-details-${id}`}
          >
            View Details
          </button>
          
          <button 
            onClick={() => onInvest?.(id)}
            className="flex-1 brutalist-button bg-accent text-accent-foreground px-4 py-2 rounded-lg text-sm hover:bg-secondary hover:text-secondary-foreground transition-colors"
            data-testid={`button-invest-${id}`}
          >
            Invest Now
          </button>
        </div>
      </div>
    </div>
  );
}