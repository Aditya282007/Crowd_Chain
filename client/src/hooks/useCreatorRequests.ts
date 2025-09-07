import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export interface CreateCreatorRequestData {
  businessName?: string;
  businessDescription?: string;
  website?: string;
  experience?: string;
}

export function useCreateCreatorRequest() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (requestData: CreateCreatorRequestData) => {
      const response = await apiRequest("POST", "/api/creator-requests", requestData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      toast({
        title: "Creator Request Submitted",
        description: "Your application has been submitted for admin review.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to submit creator request",
        variant: "destructive",
      });
    },
  });
}