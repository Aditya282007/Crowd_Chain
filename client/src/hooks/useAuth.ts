import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest, setAuthToken, removeAuthToken, getQueryFn } from "@/lib/queryClient";
import { useLocation } from "wouter";

export interface User {
  id: string;
  username: string;
  email: string;
  role: string;
  firstName: string | null;
  lastName: string | null;
  isApproved: boolean;
  walletAddress?: string | null;
  balance?: string;
  lavaCoins?: number;
}

export function useAuth() {
  const { data: user, isLoading, error } = useQuery<User>({
    queryKey: ["/api/auth/me"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchInterval: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    error,
  };
}

export function useLogin() {
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();

  return useMutation({
    mutationFn: async ({ email, password }: { email: string; password: string }) => {
      const response = await apiRequest("POST", "/api/auth/login", { email, password });
      return response.json();
    },
    onSuccess: (data) => {
      setAuthToken(data.token);
      queryClient.setQueryData(["/api/auth/me"], data.user);
      setLocation("/dashboard");
    },
  });
}

export function useSignup() {
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();

  return useMutation({
    mutationFn: async (userData: {
      username: string;
      email: string;
      password: string;
      role: string;
      firstName?: string;
      lastName?: string;
    }) => {
      const response = await apiRequest("POST", "/api/auth/signup", userData);
      return response.json();
    },
    onSuccess: (data) => {
      setAuthToken(data.token);
      queryClient.setQueryData(["/api/auth/me"], data.user);
      setLocation("/dashboard");
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();

  return useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/auth/logout");
    },
    onSuccess: () => {
      removeAuthToken();
      queryClient.setQueryData(["/api/auth/me"], null);
      queryClient.clear();
      setLocation("/");
    },
  });
}