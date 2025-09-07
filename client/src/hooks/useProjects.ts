import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export interface Project {
  id: string;
  title: string;
  description: string;
  fullDescription: string | null;
  category: string;
  goalAmount: string;
  currentAmount: string;
  endDate: string;
  imageUrl: string | null;
  isApproved: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  creatorId: string;
  creator?: {
    username: string;
    firstName: string | null;
    lastName: string | null;
  };
  progress?: number;
  backers?: number;
  daysLeft?: number;
}

export interface CreateProjectData {
  title: string;
  description: string;
  fullDescription?: string;
  category: string;
  goalAmount: string;
  endDate: string;
  imageUrl?: string;
}

export function useProjects() {
  return useQuery<Project[]>({
    queryKey: ["/api/projects"],
  });
}

export function useProject(id: string) {
  return useQuery<Project>({
    queryKey: ["/api/projects", id],
    enabled: !!id,
  });
}

export function useCreateProject() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (projectData: CreateProjectData) => {
      const response = await apiRequest("POST", "/api/projects", projectData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      toast({
        title: "Project Created",
        description: "Your project has been submitted for admin approval.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create project",
        variant: "destructive",
      });
    },
  });
}

export function useInvestInProject() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ projectId, amount }: { projectId: string; amount: string }) => {
      const response = await apiRequest("POST", `/api/projects/${projectId}/invest`, { amount });
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user/dashboard"] });
      
      // Show investment receipt with detailed information
      toast({
        title: "🎉 Investment Successful!",
        description: `💰 Amount: $${data.transaction.amount} | 🔗 Hash: ${data.transaction.transactionHash} | 📦 Block: #${data.transaction.blockNumber} | ⛽ Gas: ${data.transaction.gasUsed} gas | 🕒 ${new Date(data.transaction.createdAt).toLocaleString()}`,
        duration: 8000, // Show for 8 seconds so user can read the receipt
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
}