import { Rocket, Play } from "lucide-react";
import { Link } from "wouter";
import HeroCard from "./hero-card";

export default function HeroSection() {
  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center px-4 py-20">
      <div className="container mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8 animate-slide-right">
            <div className="space-y-4">
              <h1 className="text-5xl md:text-7xl font-black leading-tight">
                <span className="gradient-text" data-testid="text-hero-title">Crowdfunding</span><br />
                <span className="text-foreground">Reimagined</span>
              </h1>
              <p className="text-xl md:text-2xl text-muted-foreground font-medium max-w-2xl" data-testid="text-hero-subtitle">
                Decentralized, transparent, and community-driven funding platform powered by blockchain technology.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/signup">
                <button className="brutalist-button bg-primary text-primary-foreground px-8 py-4 rounded-xl text-lg" data-testid="button-get-started">
                  <Rocket className="mr-2 inline" size={20} />
                  Get Started
                </button>
              </Link>
              <button className="brutalist-button bg-background text-foreground px-8 py-4 rounded-xl text-lg border-3 border-black" data-testid="button-watch-demo">
                <Play className="mr-2 inline" size={20} />
                Watch Demo
              </button>
            </div>

            <div className="flex items-center space-x-8 pt-8">
              <div className="text-center">
                <div className="text-3xl font-black text-primary" data-testid="stat-projects">500+</div>
                <div className="text-sm font-semibold text-muted-foreground">Active Projects</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-black text-accent" data-testid="stat-funded">$2M+</div>
                <div className="text-sm font-semibold text-muted-foreground">Total Funded</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-black text-secondary" data-testid="stat-backers">10K+</div>
                <div className="text-sm font-semibold text-muted-foreground">Backers</div>
              </div>
            </div>
          </div>

          <div className="relative animate-slide-left">
            <HeroCard 
              title="Revolutionary Solar Panel Project"
              description="Innovative solar technology for sustainable energy solutions"
              progress={73}
              raised="$73,420"
              goal="$100,000"
              category="Clean Energy"
            />
            
            <div className="absolute -top-4 -right-4 brutalist-card bg-secondary text-secondary-foreground p-4 rounded-xl transform -rotate-12 animate-bounce-subtle">
              <div className="text-center">
                <div className="text-2xl font-black">🚀</div>
                <div className="text-sm font-bold" data-testid="text-new-project">New Project!</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
