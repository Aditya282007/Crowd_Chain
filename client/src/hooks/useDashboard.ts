import { useQuery } from "@tanstack/react-query";

export interface DashboardData {
  user: {
    id: string;
    username: string;
    email: string;
    role: string;
    firstName: string | null;
    lastName: string | null;
    isApproved: boolean;
    walletAddress: string | null;
    balance: string;
    lavaCoins: number;
  };
  transactions: Array<{
    id: string;
    amount: string;
    type: string;
    status: string;
    projectId: string;
    transactionHash: string;
    createdAt: string;
  }>;
  projects: Array<{
    id: string;
    title: string;
    description: string;
    goalAmount: string;
    currentAmount: string;
    isApproved: boolean;
    isActive: boolean;
    createdAt: string;
  }>;
  stats: {
    totalInvested: string;
    activeInvestments: number;
    portfolioValue: string;
  };
}

export function useDashboard() {
  return useQuery<DashboardData>({
    queryKey: ["/api/user/dashboard"],
  });
}