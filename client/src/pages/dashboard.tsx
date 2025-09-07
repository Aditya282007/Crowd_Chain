import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useDashboard } from "@/hooks/useDashboard";
import { useCreateProject, useProjects, useInvestInProject } from "@/hooks/useProjects";
import { useCreateCreatorRequest } from "@/hooks/useCreatorRequests";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  Wallet, 
  TrendingUp, 
  Plus, 
  Eye, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  FileText,
  DollarSign,
  Users,
  Target,
  Crown
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link } from "wouter";

// Project creation form schema
const projectSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title too long"),
  description: z.string().min(1, "Description is required").max(200, "Description too long"),
  fullDescription: z.string().optional(),
  category: z.string().min(1, "Category is required"),
  goalAmount: z.string().min(1, "Goal amount is required"),
  endDate: z.string().min(1, "End date is required"),
  imageUrl: z.string().optional(),
});

type ProjectFormData = z.infer<typeof projectSchema>;

// Creator request form schema
const creatorRequestSchema = z.object({
  businessName: z.string().optional(),
  businessDescription: z.string().optional(),
  website: z.string().optional(),
  experience: z.string().optional(),
});

type CreatorRequestFormData = z.infer<typeof creatorRequestSchema>;

function InvestorDashboard({ dashboardData }: { dashboardData: any }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  // Fetch available projects for investment
  const { data: projects, isLoading: projectsLoading } = useProjects();
  const investMutation = useInvestInProject();

  // Connect wallet mutation
  const connectWalletMutation = useMutation({
    mutationFn: async (walletType: string) => {
      const response = await apiRequest("POST", "/api/wallet/connect", { walletType });
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/user/dashboard"] });
      toast({
        title: "Wallet Connected",
        description: `Connected ${data.walletType} wallet: ${data.address}`,
      });
    },
  });

  // Handle investment
  const handleInvest = (projectId: string, amount: string) => {
    investMutation.mutate({ projectId, amount }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["/api/user/dashboard"] });
        queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
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

  const stats = dashboardData?.stats || { totalInvested: "0", activeInvestments: 0, portfolioValue: "0" };
  const transactions = dashboardData?.transactions || [];

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Portfolio Value</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.portfolioValue}</div>
            <p className="text-xs text-muted-foreground">+15% from investments</p>
          </CardContent>
        </Card>

        <Card className="border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Invested</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalInvested}</div>
            <p className="text-xs text-muted-foreground">Across {stats.activeInvestments} projects</p>
          </CardContent>
        </Card>

        <Card className="border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Balance</CardTitle>
            <Wallet className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${user?.balance || "0"}</div>
            <p className="text-xs text-muted-foreground">Available to invest</p>
          </CardContent>
        </Card>

        <Card className="border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lava Coins</CardTitle>
            <Target className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{user?.lavaCoins || 0}</div>
            <p className="text-xs text-muted-foreground">Reward points</p>
          </CardContent>
        </Card>
      </div>

      {/* Wallet Connection */}
      <Card className="border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Wallet Management
          </CardTitle>
          <CardDescription>
            Connect your wallet to manage investments and view blockchain transactions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 border-2 border-gray-200 rounded-lg">
            <div>
              <div className="font-semibold">
                {user?.walletAddress ? "Wallet Connected" : "No Wallet Connected"}
              </div>
              {user?.walletAddress && (
                <div className="text-sm text-gray-600 font-mono">
                  {user.walletAddress}
                </div>
              )}
            </div>
            {!user?.walletAddress && (
              <div className="flex gap-2">
                <Button
                  onClick={() => connectWalletMutation.mutate("MetaMask")}
                  disabled={connectWalletMutation.isPending}
                  className="border-2 border-black"
                  data-testid="button-connect-metamask"
                >
                  Connect MetaMask
                </Button>
                <Button
                  onClick={() => connectWalletMutation.mutate("WalletConnect")}
                  disabled={connectWalletMutation.isPending}
                  variant="outline"
                  className="border-2 border-black"
                  data-testid="button-connect-walletconnect"
                >
                  WalletConnect
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Recent Transactions */}
      <Card className="border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
          <CardDescription>Your latest investment activity</CardDescription>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No transactions yet. Start investing in projects!
            </div>
          ) : (
            <div className="space-y-3">
              {transactions.slice(0, 5).map((transaction: any) => (
                <div key={transaction.id} className="flex justify-between items-center p-4 border-2 border-gray-200 rounded-lg">
                  <div>
                    <div className="font-semibold">${transaction.amount}</div>
                    <div className="text-sm text-gray-600">
                      {new Date(transaction.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant={transaction.status === "completed" ? "default" : "secondary"}
                      data-testid={`badge-transaction-${transaction.id}`}
                    >
                      {transaction.status}
                    </Badge>
                    <div className="text-sm text-gray-600 font-mono">
                      {transaction.transactionHash.substring(0, 10)}...
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Available Projects */}
      <Card className="border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Available Projects
          </CardTitle>
          <CardDescription>
            Discover and invest in innovative projects
          </CardDescription>
        </CardHeader>
        <CardContent>
          {projectsLoading ? (
            <div className="text-center py-8">
              <div className="text-lg">Loading projects...</div>
            </div>
          ) : !projects || projects.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No projects available for investment at the moment.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project: any) => {
                const daysLeft = Math.max(0, Math.ceil((new Date(project.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)));
                const progress = project.goalAmount ? Math.round((parseFloat(project.currentAmount || "0") / parseFloat(project.goalAmount)) * 100) : 0;
                
                return (
                  <div key={project.id} className="border-2 border-gray-200 rounded-lg p-4 hover:shadow-lg transition-shadow">
                    <div className="space-y-3">
                      <div className="flex justify-between items-start">
                        <Badge variant="outline" className="text-xs">
                          {project.category}
                        </Badge>
                        <Badge variant={daysLeft > 7 ? "default" : "destructive"} className="text-xs">
                          {daysLeft} days left
                        </Badge>
                      </div>
                      
                      <div>
                        <h3 className="font-bold text-lg mb-1 line-clamp-1">{project.title}</h3>
                        <p className="text-sm text-gray-600 line-clamp-2">{project.description}</p>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Progress</span>
                          <span className="font-semibold">{progress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-purple-600 h-2 rounded-full transition-all duration-300" 
                            style={{ width: `${Math.min(progress, 100)}%` }}
                          ></div>
                        </div>
                        <div className="flex justify-between text-sm text-gray-600">
                          <span>${parseFloat(project.currentAmount || "0").toLocaleString()} raised</span>
                          <span>of ${parseFloat(project.goalAmount || "0").toLocaleString()}</span>
                        </div>
                      </div>
                      
                      <div className="text-sm text-gray-600">
                        by <span className="font-semibold">{project.creator?.username || 'Anonymous'}</span>
                      </div>
                      
                      <div className="flex gap-2 pt-2">
                        <Link href={`/project/${project.id}`} className="flex-1">
                          <Button variant="outline" size="sm" className="w-full border-2 border-black" data-testid={`view-project-${project.id}`}>
                            <Eye className="h-4 w-4 mr-1" />
                            View Details
                          </Button>
                        </Link>
                        <Button 
                          size="sm" 
                          className="bg-purple-600 hover:bg-purple-700 text-white"
                          onClick={() => {
                            const amount = prompt("Enter investment amount ($):");
                            if (amount && parseFloat(amount) > 0) {
                              handleInvest(project.id, amount);
                            }
                          }}
                          data-testid={`invest-project-${project.id}`}
                        >
                          <Wallet className="h-4 w-4 mr-1" />
                          Invest
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function CreatorDashboard({ dashboardData }: { dashboardData: any }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const createProjectMutation = useCreateProject();
  const createCreatorRequestMutation = useCreateCreatorRequest();
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [showCreatorRequestForm, setShowCreatorRequestForm] = useState(false);

  const projects = dashboardData?.projects || [];

  const projectForm = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      title: "",
      description: "",
      fullDescription: "",
      category: "",
      goalAmount: "",
      endDate: "",
      imageUrl: "",
    },
  });

  const creatorRequestForm = useForm<CreatorRequestFormData>({
    resolver: zodResolver(creatorRequestSchema),
    defaultValues: {
      businessName: "",
      businessDescription: "",
      website: "",
      experience: "",
    },
  });

  const onSubmitProject = (data: ProjectFormData) => {
    // Convert data types for backend compatibility
    const formattedData = {
      ...data,
      goalAmount: data.goalAmount, // Keep as string - server handles validation
      endDate: new Date(`${data.endDate}T23:59:59.999Z`).toISOString(), // Convert to ISO timestamp
    };
    
    console.log("Frontend sending project data:", formattedData);
    
    createProjectMutation.mutate(formattedData, {
      onSuccess: () => {
        setShowProjectForm(false);
        projectForm.reset();
      },
    });
  };

  const onSubmitCreatorRequest = (data: CreatorRequestFormData) => {
    createCreatorRequestMutation.mutate(data, {
      onSuccess: () => {
        setShowCreatorRequestForm(false);
        creatorRequestForm.reset();
      },
    });
  };

  // Show creator request form if user is not approved as creator
  if (user?.role === "investor" || (user?.role === "creator" && !user?.isApproved)) {
    return (
      <div className="space-y-6">
        <Card className="border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Become a Creator
            </CardTitle>
            <CardDescription>
              {user?.role === "creator" 
                ? "Your creator application is pending approval"
                : "Apply to become a project creator on CrowdChain"
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {user?.role === "creator" ? (
              <div className="text-center py-8">
                <Clock className="h-12 w-12 mx-auto mb-4 text-orange-500" />
                <h3 className="text-lg font-semibold mb-2">Application Under Review</h3>
                <p className="text-gray-600">
                  Your creator application is being reviewed by our admin team. 
                  You'll receive a notification once it's processed.
                </p>
              </div>
            ) : !showCreatorRequestForm ? (
              <div className="text-center py-8">
                <Users className="h-12 w-12 mx-auto mb-4 text-purple-500" />
                <h3 className="text-lg font-semibold mb-2">Ready to Create?</h3>
                <p className="text-gray-600 mb-4">
                  Join our community of innovators and start funding your next big idea.
                </p>
                <Button
                  onClick={() => setShowCreatorRequestForm(true)}
                  className="border-2 border-black"
                  data-testid="button-apply-creator"
                >
                  Apply to Become Creator
                </Button>
              </div>
            ) : (
              <Form {...creatorRequestForm}>
                <form onSubmit={creatorRequestForm.handleSubmit(onSubmitCreatorRequest)} className="space-y-4">
                  <FormField
                    control={creatorRequestForm.control}
                    name="businessName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Business Name (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="Your business or project name" {...field} data-testid="input-business-name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={creatorRequestForm.control}
                    name="businessDescription"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Business Description (Optional)</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Tell us about your business or project focus" {...field} data-testid="textarea-business-description" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={creatorRequestForm.control}
                    name="website"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Website (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="https://your-website.com" {...field} data-testid="input-website" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={creatorRequestForm.control}
                    name="experience"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Experience (Optional)</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Tell us about your relevant experience" {...field} data-testid="textarea-experience" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex gap-2">
                    <Button
                      type="submit"
                      disabled={createCreatorRequestMutation.isPending}
                      className="border-2 border-black"
                      data-testid="button-submit-creator-request"
                    >
                      {createCreatorRequestMutation.isPending ? "Submitting..." : "Submit Application"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowCreatorRequestForm(false)}
                      className="border-2 border-black"
                      data-testid="button-cancel-creator-request"
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </Form>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Creator Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
            <FileText className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{projects.length}</div>
          </CardContent>
        </Card>

        <Card className="border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {projects.filter((p: any) => p.isApproved && p.isActive).length}
            </div>
          </CardContent>
        </Card>

        <Card className="border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Raised</CardTitle>
            <DollarSign className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${projects.reduce((sum: number, p: any) => sum + parseFloat(p.currentAmount || "0"), 0).toFixed(2)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Create Project Button */}
      {!showProjectForm && (
        <Card className="border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <CardContent className="pt-6">
            <div className="text-center">
              <Button
                onClick={() => setShowProjectForm(true)}
                className="border-2 border-black"
                data-testid="button-create-project"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create New Project
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Project Creation Form */}
      {showProjectForm && (
        <Card className="border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <CardHeader>
            <CardTitle>Create New Project</CardTitle>
            <CardDescription>
              Fill out the details for your new crowdfunding project
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...projectForm}>
              <form onSubmit={projectForm.handleSubmit(onSubmitProject)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={projectForm.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Project Title</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter project title" {...field} data-testid="input-project-title" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={projectForm.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-project-category">
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="technology">Technology</SelectItem>
                            <SelectItem value="health">Health & Medical</SelectItem>
                            <SelectItem value="environment">Environment</SelectItem>
                            <SelectItem value="education">Education</SelectItem>
                            <SelectItem value="agriculture">Agriculture</SelectItem>
                            <SelectItem value="energy">Clean Energy</SelectItem>
                            <SelectItem value="finance">Financial Services</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={projectForm.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Short Description</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Brief description of your project" {...field} data-testid="textarea-project-description" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={projectForm.control}
                  name="fullDescription"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Description (Optional)</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Detailed description of your project" {...field} data-testid="textarea-project-full-description" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={projectForm.control}
                    name="goalAmount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Funding Goal ($)</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="50000" {...field} data-testid="input-project-goal" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={projectForm.control}
                    name="endDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Campaign End Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} data-testid="input-project-end-date" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={projectForm.control}
                  name="imageUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Project Image URL (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="https://example.com/image.jpg" {...field} data-testid="input-project-image" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex gap-2">
                  <Button
                    type="submit"
                    disabled={createProjectMutation.isPending}
                    className="border-2 border-black"
                    data-testid="button-submit-project"
                  >
                    {createProjectMutation.isPending ? "Creating..." : "Create Project"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowProjectForm(false)}
                    className="border-2 border-black"
                    data-testid="button-cancel-project"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}

      {/* My Projects */}
      <Card className="border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        <CardHeader>
          <CardTitle>My Projects</CardTitle>
          <CardDescription>Manage and track your created projects</CardDescription>
        </CardHeader>
        <CardContent>
          {projects.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No projects created yet. Create your first project to get started!
            </div>
          ) : (
            <div className="space-y-4">
              {projects.map((project: any) => (
                <div key={project.id} className="p-4 border-2 border-gray-200 rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-bold text-lg">{project.title}</h3>
                      <p className="text-gray-600">{project.description}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={project.isApproved ? "default" : "secondary"}>
                        {project.isApproved ? "Approved" : "Pending"}
                      </Badge>
                      {project.isActive && <Badge variant="outline">Active</Badge>}
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-gray-600">
                      Raised: ${project.currentAmount} / ${project.goalAmount}
                    </div>
                    <Link href={`/project/${project.id}`}>
                      <Button variant="outline" size="sm" className="border-2 border-black" data-testid={`button-view-project-${project.id}`}>
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function Dashboard() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { data: dashboardData, isLoading: dashboardLoading } = useDashboard();

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Please Log In</h1>
          <p className="text-gray-600">You need to be logged in to access the dashboard.</p>
        </div>
      </div>
    );
  }

  if (isLoading || dashboardLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg font-bold">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen p-6"
      style={{
        backgroundImage: `
          linear-gradient(to right, rgba(139, 92, 246, 0.03) 1px, transparent 1px),
          linear-gradient(to bottom, rgba(139, 92, 246, 0.03) 1px, transparent 1px)
        `,
        backgroundSize: "40px 40px",
      }}
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-black bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
            Welcome back, {user?.firstName || user?.username}!
          </h1>
          <p className="text-gray-600">
            {user?.role === "admin" 
              ? "Manage the platform and oversee all activities"
              : user?.role === "creator" 
                ? "Create and manage your crowdfunding projects"
                : "Discover and invest in innovative projects"
            }
          </p>
        </div>

        {/* Role-based dashboard content */}
        {user?.role === "admin" ? (
          <div className="text-center py-8">
            <h2 className="text-2xl font-bold mb-4">Admin Dashboard</h2>
            <p className="text-gray-600 mb-4">
              Access the full admin panel to manage users and creator requests.
            </p>
            <Link href="/admin">
              <Button className="border-2 border-black" data-testid="button-go-to-admin">
                <Crown className="h-4 w-4 mr-2" />
                Go to Admin Panel
              </Button>
            </Link>
          </div>
        ) : user?.role === "creator" || user?.role === "investor" ? (
          <Tabs defaultValue={user?.role === "creator" ? "creator" : "investor"} className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 border-4 border-black">
              <TabsTrigger value="investor" data-testid="tab-investor">Investor</TabsTrigger>
              <TabsTrigger value="creator" data-testid="tab-creator">Creator</TabsTrigger>
            </TabsList>

            <TabsContent value="investor">
              <InvestorDashboard dashboardData={dashboardData} />
            </TabsContent>

            <TabsContent value="creator">
              <CreatorDashboard dashboardData={dashboardData} />
            </TabsContent>
          </Tabs>
        ) : (
          <div className="text-center py-8">
            <h2 className="text-2xl font-bold mb-4">Unknown Role</h2>
            <p className="text-gray-600">Please contact support for assistance.</p>
          </div>
        )}
      </div>
    </div>
  );
}