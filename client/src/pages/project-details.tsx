import { useState } from "react";
import { ArrowLeft, Heart, Share2, Clock, Users, Target, TrendingUp, CheckCircle, AlertCircle } from "lucide-react";
import { Link, useParams } from "wouter";
import { WalletSimulator } from "../components/wallet-simulator";
import { useAuth } from "../hooks/useAuth";
import { useProject } from "../hooks/useProjects";

export default function ProjectDetails() {
  const [isLiked, setIsLiked] = useState(false);
  const [investAmount, setInvestAmount] = useState("");
  const { user } = useAuth();
  const { id } = useParams<{ id: string }>();
  
  const { data: project, isLoading, error } = useProject(id || "");

  // Handle loading state
  if (isLoading) {
    return (
      <div className="min-h-screen px-4 py-8 flex items-center justify-center">
        <div className="text-center">
          <div className="text-xl font-bold">Loading project...</div>
        </div>
      </div>
    );
  }

  // Handle error state
  if (error || !project) {
    return (
      <div className="min-h-screen px-4 py-8 flex items-center justify-center">
        <div className="text-center">
          <div className="text-xl font-bold text-red-600 mb-4">Project not found</div>
          <Link href="/dashboard">
            <button className="bg-black text-white px-4 py-2 rounded font-bold hover:bg-gray-800">
              Back to Dashboard
            </button>
          </Link>
        </div>
      </div>
    );
  }

  // Calculate dynamic values
  const goalAmount = parseFloat(project.goalAmount || "0");
  const currentAmount = parseFloat(project.currentAmount || "0");
  const progress = goalAmount > 0 ? Math.round((currentAmount / goalAmount) * 100) : 0;
  
  // Calculate days left
  const endDate = new Date(project.endDate);
  const today = new Date();
  const daysLeft = Math.max(0, Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));
  
  // Parse milestones if they exist
  const milestones = project.milestones ? (Array.isArray(project.milestones) ? project.milestones : []) : [];

  const handleInvest = () => {
    if (!investAmount) return;
    console.log("Investing:", investAmount);
    // Handle investment logic
  };

  const handleLike = () => {
    setIsLiked(!isLiked);
  };

  const handleShare = () => {
    console.log("Share project");
  };

  return (
    <div className="min-h-screen px-4 py-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Back Button */}
        <Link href="/dashboard">
          <button className="brutalist-button bg-background text-foreground px-4 py-2 rounded-lg border-3 border-black hover:bg-primary hover:text-primary-foreground transition-colors flex items-center" data-testid="button-back">
            <ArrowLeft className="mr-2" size={16} />
            Back to Dashboard
          </button>
        </Link>

        {/* Project Header */}
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Project Images */}
            <div className="brutalist-card bg-card rounded-2xl overflow-hidden">
              {project.imageUrl ? (
                <img 
                  src={project.imageUrl} 
                  alt={project.title}
                  className="w-full h-80 object-cover border-b-3 border-black"
                  data-testid="img-project-main"
                />
              ) : (
                <div className="w-full h-80 bg-gray-200 border-b-3 border-black flex items-center justify-center">
                  <span className="text-gray-500 text-lg">No image available</span>
                </div>
              )}
              <div className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <span className="brutalist-button bg-secondary text-secondary-foreground px-3 py-1 rounded-lg text-sm font-bold" data-testid="text-category">
                    {project.category}
                  </span>
                  <div className="flex items-center gap-2 ml-auto">
                    <button 
                      onClick={handleLike}
                      className={`brutalist-button p-2 rounded-lg border-3 border-black transition-colors ${isLiked ? 'bg-red-500 text-white' : 'bg-background text-foreground hover:bg-accent hover:text-accent-foreground'}`}
                      data-testid="button-like"
                    >
                      <Heart className={isLiked ? 'fill-current' : ''} size={16} />
                    </button>
                    <button 
                      onClick={handleShare}
                      className="brutalist-button bg-background text-foreground p-2 rounded-lg border-3 border-black hover:bg-primary hover:text-primary-foreground transition-colors"
                      data-testid="button-share"
                    >
                      <Share2 size={16} />
                    </button>
                  </div>
                </div>
                
                <h1 className="text-3xl font-black mb-4" data-testid="text-project-title">
                  {project.title}
                </h1>
                
                <p className="text-lg text-muted-foreground leading-relaxed" data-testid="text-project-description">
                  {project.description}
                </p>
              </div>
            </div>

            {/* Full Description */}
            <div className="brutalist-card bg-card p-6 rounded-2xl">
              <h2 className="text-2xl font-bold mb-4" data-testid="text-full-description-title">Project Details</h2>
              <div className="prose prose-lg max-w-none">
                {project.fullDescription ? (
                  project.fullDescription.split('\n\n').map((paragraph, index) => (
                    <p key={index} className="mb-4 text-muted-foreground leading-relaxed" data-testid={`text-description-paragraph-${index}`}>
                      {paragraph.trim()}
                    </p>
                  ))
                ) : (
                  <p className="text-muted-foreground leading-relaxed">
                    {project.description}
                  </p>
                )}
              </div>
            </div>

            {/* Milestones */}
            {milestones.length > 0 && (
              <div className="brutalist-card bg-card p-6 rounded-2xl">
                <h2 className="text-2xl font-bold mb-6" data-testid="text-milestones-title">Project Milestones</h2>
                <div className="space-y-4">
                  {milestones.map((milestone: any, index: number) => (
                    <div 
                      key={index}
                      className={`brutalist-card p-4 rounded-xl border-3 ${
                        milestone.status === 'completed' ? 'bg-green-50 border-green-500' :
                        milestone.status === 'in-progress' ? 'bg-blue-50 border-blue-500' :
                        'bg-gray-50 border-gray-300'
                      }`}
                      data-testid={`milestone-${index}`}
                    >
                      <div className="flex items-start space-x-4">
                        <div className={`p-2 rounded-lg ${
                          milestone.status === 'completed' ? 'bg-green-500 text-white' :
                          milestone.status === 'in-progress' ? 'bg-blue-500 text-white' :
                          'bg-gray-300 text-gray-600'
                        }`}>
                          {milestone.status === 'completed' ? <CheckCircle size={20} /> :
                           milestone.status === 'in-progress' ? <Clock size={20} /> :
                           <AlertCircle size={20} />}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-bold" data-testid={`milestone-title-${index}`}>{milestone.title}</h3>
                            <span className="font-bold text-lg" data-testid={`milestone-amount-${index}`}>${milestone.amount?.toLocaleString()}</span>
                          </div>
                          <p className="text-sm text-muted-foreground mb-1" data-testid={`milestone-description-${index}`}>
                            {milestone.description}
                          </p>
                          <p className="text-xs font-semibold" data-testid={`milestone-date-${index}`}>
                            {milestone.date}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Investment Card */}
            <div className="brutalist-card bg-card p-6 rounded-2xl sticky top-8">
              <div className="space-y-6">
                <div className="text-center">
                  <div className="text-3xl font-black text-primary mb-2" data-testid="text-raised-amount">
                    ${currentAmount.toLocaleString()}
                  </div>
                  <div className="text-sm text-muted-foreground" data-testid="text-goal-amount">
                    of ${goalAmount.toLocaleString()} goal
                  </div>
                </div>

                <div className="w-full bg-muted border-2 border-black rounded-lg h-4">
                  <div 
                    className="bg-accent h-full rounded-lg border-2 border-black transition-all duration-500" 
                    style={{ width: `${Math.min(progress, 100)}%` }}
                    data-testid="progress-bar"
                  ></div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-xl font-black text-secondary" data-testid="text-days-left">{daysLeft}</div>
                    <div className="text-xs text-muted-foreground">Days Left</div>
                  </div>
                  <div>
                    <div className="text-xl font-black text-primary" data-testid="text-progress">{progress}%</div>
                    <div className="text-xs text-muted-foreground">Funded</div>
                  </div>
                </div>

                {user?.role === 'investor' ? (
                  <WalletSimulator 
                    onInvest={handleInvest}
                    projectId={project.id}
                    className="border-none p-0"
                  />
                ) : (
                  <div className="p-4 bg-yellow-50 border-2 border-yellow-400 rounded-lg text-center">
                    <p className="text-sm text-yellow-800 font-bold">
                      {!user ? "Please log in as an Investor to invest in this project" : 
                       user.role === 'creator' ? "Creators cannot invest in projects" : 
                       "Only approved investors can invest in projects"}
                    </p>
                    {!user && (
                      <Link href="/login">
                        <button className="mt-2 bg-black text-white px-4 py-2 rounded font-bold hover:bg-gray-800">
                          Login
                        </button>
                      </Link>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Creator Info */}
            <div className="brutalist-card bg-card p-6 rounded-2xl">
              <h3 className="text-lg font-bold mb-4" data-testid="text-creator-title">Project Creator</h3>
              <div className="flex items-start space-x-4">
                <div className="w-16 h-16 rounded-full border-3 border-black bg-gradient-to-r from-purple-400 to-pink-400 flex items-center justify-center text-white font-bold text-xl">
                  {(project as any).creator?.username ? (project as any).creator.username.charAt(0).toUpperCase() : 'C'}
                </div>
                <div className="flex-1">
                  <h4 className="font-bold" data-testid="text-creator-name">
                    {(project as any).creator?.firstName || (project as any).creator?.lastName 
                      ? `${(project as any).creator.firstName || ''} ${(project as any).creator.lastName || ''}`.trim()
                      : (project as any).creator?.username || 'Anonymous Creator'
                    }
                  </h4>
                  <p className="text-sm text-muted-foreground mb-2" data-testid="text-creator-company">
                    @{(project as any).creator?.username || 'creator'}
                  </p>
                  <p className="text-xs text-muted-foreground" data-testid="text-creator-bio">
                    Project created on {new Date(project.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Trust Indicators */}
            <div className="brutalist-card bg-primary/10 p-4 rounded-xl">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                  <span className="text-white">🛡️</span>
                </div>
                <div>
                  <div className="text-sm font-bold" data-testid="text-trust-title">Verified Project</div>
                  <div className="text-xs text-muted-foreground" data-testid="text-trust-description">Smart contract secured</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}