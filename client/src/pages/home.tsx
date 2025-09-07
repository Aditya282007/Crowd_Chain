import { useAuth } from "@/hooks/useAuth";
import { useProjects, useInvestInProject } from "@/hooks/useProjects";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";
import { 
  Wallet, 
  Target, 
  Calendar, 
  Users, 
  TrendingUp, 
  ArrowRight,
  Shield,
  Globe,
  Zap
} from "lucide-react";
import { Link } from "wouter";
import Navigation from "@/components/navigation";
import Footer from "@/components/footer";

function HeroSection() {
  const { isAuthenticated } = useAuth();

  return (
    <section 
      id="home" 
      className="py-20 px-4"
      style={{
        backgroundImage: `
          linear-gradient(to right, rgba(139, 92, 246, 0.03) 1px, transparent 1px),
          linear-gradient(to bottom, rgba(139, 92, 246, 0.03) 1px, transparent 1px)
        `,
        backgroundSize: "40px 40px",
      }}
    >
      <div className="container mx-auto text-center">
        <h1 className="text-6xl md:text-8xl font-black mb-6 leading-tight">
          <span className="gradient-text">Crowd</span>
          <span className="text-black">Chain</span>
        </h1>
        <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
          The future of crowdfunding is here. Built on blockchain technology for transparency, 
          security, and community-driven innovation.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          {!isAuthenticated ? (
            <>
              <Link href="/signup">
                <Button 
                  size="lg" 
                  className="brutalist-button bg-accent text-accent-foreground text-lg px-8 py-4"
                  data-testid="hero-signup"
                >
                  Start Investing
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/login">
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="brutalist-button border-3 border-black bg-background text-lg px-8 py-4"
                  data-testid="hero-login"
                >
                  Log In
                </Button>
              </Link>
            </>
          ) : (
            <Link href="/dashboard">
              <Button 
                size="lg" 
                className="brutalist-button bg-accent text-accent-foreground text-lg px-8 py-4"
                data-testid="hero-dashboard"
              >
                Go to Dashboard
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}

function FeaturesSection() {
  const features = [
    {
      icon: <Shield className="h-8 w-8" />,
      title: "Blockchain Security",
      description: "All transactions are secured by blockchain technology, ensuring transparency and immutability of your investments."
    },
    {
      icon: <Globe className="h-8 w-8" />,
      title: "Global Access",
      description: "Connect with innovators and investors worldwide. No geographical boundaries, just pure innovation."
    },
    {
      icon: <Zap className="h-8 w-8" />,
      title: "Real-time Updates",
      description: "Get instant notifications about your investments, project updates, and funding milestones."
    }
  ];

  return (
    <section id="features" className="py-20 px-4 bg-gray-50">
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-black mb-4">
            <span className="gradient-text">Platform Features</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Built for the future of decentralized crowdfunding
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="brutalist-card bg-white">
              <CardContent className="p-8 text-center">
                <div className="flex justify-center mb-4 text-purple-600">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-4">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

function ProjectCard({ project, onInvest }: { project: any; onInvest: (projectId: string, amount: string) => void }) {
  const [investmentAmount, setInvestmentAmount] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { user } = useAuth();

  const handleInvest = () => {
    if (investmentAmount && parseFloat(investmentAmount) > 0) {
      onInvest(project.id, investmentAmount);
      setInvestmentAmount("");
      setIsDialogOpen(false);
    }
  };

  const daysLeft = Math.max(0, Math.ceil((new Date(project.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)));

  return (
    <Card className="brutalist-card bg-white h-full">
      <CardHeader>
        <div className="flex justify-between items-start mb-2">
          <Badge variant="outline" className="mb-2">
            {project.category}
          </Badge>
          <Badge variant={daysLeft > 7 ? "default" : "destructive"}>
            {daysLeft} days left
          </Badge>
        </div>
        <CardTitle className="text-xl font-bold mb-2">{project.title}</CardTitle>
        <CardDescription className="text-gray-600">
          {project.description}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Progress</span>
            <span>{project.progress}%</span>
          </div>
          <Progress value={project.progress} className="h-2" />
          <div className="flex justify-between text-sm text-gray-600">
            <span>${project.currentAmount} raised</span>
            <span>of ${project.goalAmount}</span>
          </div>
        </div>
        
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            <span>{project.backers || 0} backers</span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            <span>{daysLeft} days</span>
          </div>
        </div>

        <div className="text-sm text-gray-600">
          by <span className="font-semibold">{project.creator?.username}</span>
        </div>

        <div className="flex gap-2 pt-4">
          <Link href={`/project/${project.id}`} className="flex-1">
            <Button variant="outline" className="w-full border-2 border-black" data-testid={`view-project-${project.id}`}>
              View Details
            </Button>
          </Link>
          
          {user && user.role === "investor" && (
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="brutalist-button bg-primary text-primary-foreground" data-testid={`invest-project-${project.id}`}>
                  <Wallet className="h-4 w-4 mr-2" />
                  Invest
                </Button>
              </DialogTrigger>
              <DialogContent className="border-4 border-black">
                <DialogHeader>
                  <DialogTitle>Invest in {project.title}</DialogTitle>
                  <DialogDescription>
                    Enter the amount you want to invest in this project.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="amount">Investment Amount ($)</Label>
                    <Input
                      id="amount"
                      type="number"
                      placeholder="100"
                      value={investmentAmount}
                      onChange={(e) => setInvestmentAmount(e.target.value)}
                      className="border-2 border-black"
                      data-testid={`input-invest-amount-${project.id}`}
                    />
                  </div>
                  <div className="text-sm text-gray-600">
                    Your available balance: ${user?.balance || "0"}
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="border-2 border-black">
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleInvest}
                    disabled={!investmentAmount || parseFloat(investmentAmount) <= 0 || parseFloat(investmentAmount) > parseFloat(user?.balance || "0")}
                    className="brutalist-button bg-primary text-primary-foreground"
                    data-testid={`button-confirm-invest-${project.id}`}
                  >
                    Invest ${investmentAmount}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function ProjectsSection() {
  const { data: projects, isLoading } = useProjects();
  const investMutation = useInvestInProject();
  const { toast } = useToast();

  const handleInvest = (projectId: string, amount: string) => {
    investMutation.mutate({ projectId, amount }, {
      onSuccess: () => {
        toast({
          title: "Investment Initiated",
          description: "Your investment is being processed on the blockchain.",
        });
      },
      onError: (error: any) => {
        toast({
          title: "Investment Failed",
          description: error.message || "Failed to process investment",
          variant: "destructive",
        });
      },
    });
  };

  if (isLoading) {
    return (
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <div className="text-lg">Loading projects...</div>
        </div>
      </section>
    );
  }

  const featuredProjects = projects?.slice(0, 6) || [];

  return (
    <section id="projects" className="py-20 px-4">
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-black mb-4">
            <span className="gradient-text">Featured Projects</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Discover innovative projects that are changing the world
          </p>
        </div>

        {featuredProjects.length === 0 ? (
          <div className="text-center py-12">
            <Target className="h-16 w-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-xl font-semibold mb-2">No Projects Yet</h3>
            <p className="text-gray-600 mb-6">
              Be the first to create a project on CrowdChain!
            </p>
            <Link href="/signup">
              <Button className="brutalist-button bg-accent text-accent-foreground">
                Get Started
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredProjects.map((project) => (
              <ProjectCard 
                key={project.id} 
                project={project} 
                onInvest={handleInvest}
              />
            ))}
          </div>
        )}

        {featuredProjects.length > 0 && (
          <div className="text-center mt-12">
            <Link href="/projects">
              <Button size="lg" variant="outline" className="brutalist-button border-3 border-black">
                View All Projects
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}

function StatsSection() {
  const { data: projects } = useProjects();
  
  const stats = {
    totalProjects: projects?.length || 0,
    totalRaised: projects?.reduce((sum, p) => sum + parseFloat(p.currentAmount || "0"), 0) || 0,
    successfulProjects: projects?.filter(p => parseFloat(p.currentAmount || "0") >= parseFloat(p.goalAmount)).length || 0,
  };

  return (
    <section className="py-20 px-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white">
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-black mb-4">
            Platform Impact
          </h2>
          <p className="text-xl opacity-90 max-w-2xl mx-auto">
            Real numbers from our blockchain-powered ecosystem
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="text-4xl md:text-6xl font-black mb-2">
              {stats.totalProjects}
            </div>
            <div className="text-xl opacity-90">Active Projects</div>
          </div>
          <div className="text-center">
            <div className="text-4xl md:text-6xl font-black mb-2">
              ${stats.totalRaised.toFixed(0)}
            </div>
            <div className="text-xl opacity-90">Total Raised</div>
          </div>
          <div className="text-center">
            <div className="text-4xl md:text-6xl font-black mb-2">
              {stats.successfulProjects}
            </div>
            <div className="text-xl opacity-90">Funded Projects</div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen">
      <Navigation />
      <HeroSection />
      <ProjectsSection />
      <StatsSection />
      <FeaturesSection />
      <Footer />
    </div>
  );
}