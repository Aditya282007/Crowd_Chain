import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useLocation } from "wouter";
import { useEffect, useState } from "react";
import { Users, UserCheck, FileText, Clock, CheckCircle, XCircle, AlertTriangle } from "lucide-react";

interface CreatorRequest {
  id: string;
  businessName: string | null;
  businessDescription: string | null;
  website: string | null;
  experience: string | null;
  status: string;
  createdAt: string;
  user: {
    id: string;
    username: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
  };
}

interface UserData {
  investors: Array<{
    id: string;
    username: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
    balance: string;
    lavaCoins: number;
    isApproved: boolean;
    isBanned: boolean;
    createdAt: string;
  }>;
  creators: Array<{
    id: string;
    username: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
    balance: string;
    lavaCoins: number;
    isApproved: boolean;
    isBanned: boolean;
    createdAt: string;
  }>;
}

interface PendingProject {
  id: string;
  title: string;
  description: string;
  fullDescription: string | null;
  category: string;
  goalAmount: string;
  currentAmount: string;
  imageUrl: string | null;
  endDate: string;
  createdAt: string;
  creator: {
    username: string;
    firstName: string | null;
    lastName: string | null;
  };
}

function AdminDashboard() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedRequest, setSelectedRequest] = useState<string | null>(null);
  const [adminNote, setAdminNote] = useState("");

  // Redirect if not admin
  useEffect(() => {
    if (user && user.role !== "admin") {
      setLocation("/dashboard");
    }
  }, [user, setLocation]);

  // Fetch creator requests
  const { data: creatorRequests, isLoading: requestsLoading } = useQuery<CreatorRequest[]>({
    queryKey: ["/api/admin/creator-requests"],
  });

  // Fetch users
  const { data: userData, isLoading: usersLoading } = useQuery<UserData>({
    queryKey: ["/api/admin/users"],
  });

  // Fetch pending projects
  const { data: pendingProjects, isLoading: projectsLoading } = useQuery<PendingProject[]>({
    queryKey: ["/api/admin/projects"],
  });

  // Approve creator request mutation
  const approveRequestMutation = useMutation({
    mutationFn: async ({ id, note }: { id: string; note: string }) => {
      await apiRequest("POST", `/api/admin/creator-requests/${id}/approve`, { adminNote: note });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/creator-requests"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({
        title: "Request Approved",
        description: "Creator request has been approved successfully.",
      });
      setSelectedRequest(null);
      setAdminNote("");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to approve creator request.",
        variant: "destructive",
      });
    },
  });

  // Reject creator request mutation
  const rejectRequestMutation = useMutation({
    mutationFn: async ({ id, note }: { id: string; note: string }) => {
      await apiRequest("POST", `/api/admin/creator-requests/${id}/reject`, { adminNote: note });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/creator-requests"] });
      toast({
        title: "Request Rejected",
        description: "Creator request has been rejected.",
      });
      setSelectedRequest(null);
      setAdminNote("");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to reject creator request.",
        variant: "destructive",
      });
    },
  });

  // Ban user mutation
  const banUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      await apiRequest("POST", `/api/admin/users/${userId}/ban`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({
        title: "User Banned",
        description: "User has been banned successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to ban user.",
        variant: "destructive",
      });
    },
  });

  // Approve project mutation
  const approveProjectMutation = useMutation({
    mutationFn: async ({ id, note }: { id: string; note: string }) => {
      await apiRequest("POST", `/api/admin/projects/${id}/approve`, { adminNote: note });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/projects"] });
      toast({
        title: "Project Approved",
        description: "Project has been approved successfully.",
      });
      setSelectedRequest(null);
      setAdminNote("");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to approve project.",
        variant: "destructive",
      });
    },
  });

  // Reject project mutation
  const rejectProjectMutation = useMutation({
    mutationFn: async ({ id, note }: { id: string; note: string }) => {
      await apiRequest("POST", `/api/admin/projects/${id}/reject`, { adminNote: note });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/projects"] });
      toast({
        title: "Project Rejected",
        description: "Project has been rejected.",
      });
      setSelectedRequest(null);
      setAdminNote("");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to reject project.",
        variant: "destructive",
      });
    },
  });

  if (user?.role !== "admin") {
    return null;
  }

  const handleApprove = (requestId: string) => {
    approveRequestMutation.mutate({ id: requestId, note: adminNote });
  };

  const handleReject = (requestId: string) => {
    rejectRequestMutation.mutate({ id: requestId, note: adminNote });
  };

  const handleApproveProject = (projectId: string) => {
    approveProjectMutation.mutate({ id: projectId, note: adminNote });
  };

  const handleRejectProject = (projectId: string) => {
    rejectProjectMutation.mutate({ id: projectId, note: adminNote });
  };

  const stats = {
    totalUsers: (userData?.investors.length || 0) + (userData?.creators.length || 0),
    pendingRequests: creatorRequests?.length || 0,
    pendingProjects: pendingProjects?.length || 0,
    activeCreators: userData?.creators.filter(c => c.isApproved).length || 0,
    bannedUsers: userData ? userData.investors.filter(u => u.isBanned).length + userData.creators.filter(u => u.isBanned).length : 0,
  };

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
            Admin Dashboard
          </h1>
          <p className="text-gray-600">Manage users, creator requests, and platform oversight</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <Card className="border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
            </CardContent>
          </Card>

          <Card className="border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
              <Clock className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pendingRequests}</div>
            </CardContent>
          </Card>

          <Card className="border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Projects</CardTitle>
              <FileText className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pendingProjects}</div>
            </CardContent>
          </Card>

          <Card className="border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Creators</CardTitle>
              <UserCheck className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeCreators}</div>
            </CardContent>
          </Card>

          <Card className="border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Banned Users</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.bannedUsers}</div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="requests" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 border-4 border-black">
            <TabsTrigger value="requests" data-testid="tab-requests">Creator Requests</TabsTrigger>
            <TabsTrigger value="projects" data-testid="tab-projects">Project Approval</TabsTrigger>
            <TabsTrigger value="users" data-testid="tab-users">User Management</TabsTrigger>
          </TabsList>

          {/* Creator Requests Tab */}
          <TabsContent value="requests">
            <Card className="border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Creator Requests
                </CardTitle>
                <CardDescription>
                  Review and approve applications to become creators
                </CardDescription>
              </CardHeader>
              <CardContent>
                {requestsLoading ? (
                  <div className="text-center py-8">Loading requests...</div>
                ) : !creatorRequests?.length ? (
                  <div className="text-center py-8 text-gray-500">
                    No pending creator requests
                  </div>
                ) : (
                  <div className="space-y-4">
                    {creatorRequests.map((request) => (
                      <Card key={request.id} className="border-2 border-gray-300">
                        <CardContent className="p-6">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h3 className="font-bold text-lg">
                                {request.user.firstName} {request.user.lastName} ({request.user.username})
                              </h3>
                              <p className="text-gray-600">{request.user.email}</p>
                              <Badge variant="secondary" className="mt-1">
                                {request.status}
                              </Badge>
                            </div>
                            <div className="text-sm text-gray-500">
                              {new Date(request.createdAt).toLocaleDateString()}
                            </div>
                          </div>

                          <div className="space-y-3 mb-4">
                            {request.businessName && (
                              <div>
                                <strong>Business Name:</strong> {request.businessName}
                              </div>
                            )}
                            {request.businessDescription && (
                              <div>
                                <strong>Description:</strong> {request.businessDescription}
                              </div>
                            )}
                            {request.website && (
                              <div>
                                <strong>Website:</strong> 
                                <a href={request.website} target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:underline ml-1">
                                  {request.website}
                                </a>
                              </div>
                            )}
                            {request.experience && (
                              <div>
                                <strong>Experience:</strong> {request.experience}
                              </div>
                            )}
                          </div>

                          {selectedRequest === request.id ? (
                            <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
                              <Textarea
                                placeholder="Add admin note (optional)"
                                value={adminNote}
                                onChange={(e) => setAdminNote(e.target.value)}
                                data-testid={`textarea-admin-note-${request.id}`}
                              />
                              <div className="flex gap-2">
                                <Button
                                  onClick={() => handleApprove(request.id)}
                                  disabled={approveRequestMutation.isPending}
                                  className="bg-green-600 hover:bg-green-700 border-2 border-black"
                                  data-testid={`button-approve-${request.id}`}
                                >
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                  {approveRequestMutation.isPending ? "Approving..." : "Approve"}
                                </Button>
                                <Button
                                  onClick={() => handleReject(request.id)}
                                  disabled={rejectRequestMutation.isPending}
                                  variant="destructive"
                                  className="border-2 border-black"
                                  data-testid={`button-reject-${request.id}`}
                                >
                                  <XCircle className="h-4 w-4 mr-2" />
                                  {rejectRequestMutation.isPending ? "Rejecting..." : "Reject"}
                                </Button>
                                <Button
                                  onClick={() => {
                                    setSelectedRequest(null);
                                    setAdminNote("");
                                  }}
                                  variant="outline"
                                  className="border-2 border-black"
                                  data-testid={`button-cancel-${request.id}`}
                                >
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <Button
                              onClick={() => setSelectedRequest(request.id)}
                              className="border-2 border-black"
                              data-testid={`button-review-${request.id}`}
                            >
                              Review Request
                            </Button>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Project Approval Tab */}
          <TabsContent value="projects">
            <Card className="border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Project Approval
                </CardTitle>
                <CardDescription>
                  Review and approve projects submitted by creators
                </CardDescription>
              </CardHeader>
              <CardContent>
                {projectsLoading ? (
                  <div className="text-center py-8">Loading projects...</div>
                ) : !pendingProjects?.length ? (
                  <div className="text-center py-8 text-gray-500">
                    No pending projects for approval
                  </div>
                ) : (
                  <div className="space-y-4">
                    {pendingProjects.map((project) => (
                      <Card key={project.id} className="border-2 border-gray-300">
                        <CardContent className="p-6">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h3 className="font-bold text-xl mb-2">{project.title}</h3>
                              <p className="text-gray-600 mb-2">{project.description}</p>
                              <div className="flex flex-wrap gap-2 mb-2">
                                <Badge variant="outline">{project.category}</Badge>
                                <Badge variant="secondary">Goal: ${project.goalAmount}</Badge>
                              </div>
                              <p className="text-sm text-gray-500">
                                Creator: {project.creator.firstName} {project.creator.lastName} ({project.creator.username})
                              </p>
                              <p className="text-sm text-gray-500">
                                End Date: {new Date(project.endDate).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="text-sm text-gray-500">
                              {new Date(project.createdAt).toLocaleDateString()}
                            </div>
                          </div>

                          {project.fullDescription && (
                            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                              <strong>Full Description:</strong>
                              <p className="mt-1 text-sm">{project.fullDescription}</p>
                            </div>
                          )}

                          {project.imageUrl && (
                            <div className="mb-4">
                              <img 
                                src={project.imageUrl} 
                                alt={project.title}
                                className="w-full max-w-md h-48 object-cover rounded-lg border-2 border-gray-200"
                              />
                            </div>
                          )}

                          {selectedRequest === project.id ? (
                            <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
                              <Textarea
                                placeholder="Add admin note (optional)"
                                value={adminNote}
                                onChange={(e) => setAdminNote(e.target.value)}
                                data-testid={`textarea-project-note-${project.id}`}
                              />
                              <div className="flex gap-2">
                                <Button
                                  onClick={() => handleApproveProject(project.id)}
                                  disabled={approveProjectMutation.isPending}
                                  className="bg-green-600 hover:bg-green-700 border-2 border-black"
                                  data-testid={`button-approve-project-${project.id}`}
                                >
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                  {approveProjectMutation.isPending ? "Approving..." : "Approve Project"}
                                </Button>
                                <Button
                                  onClick={() => handleRejectProject(project.id)}
                                  disabled={rejectProjectMutation.isPending}
                                  variant="destructive"
                                  className="border-2 border-black"
                                  data-testid={`button-reject-project-${project.id}`}
                                >
                                  <XCircle className="h-4 w-4 mr-2" />
                                  {rejectProjectMutation.isPending ? "Rejecting..." : "Reject Project"}
                                </Button>
                                <Button
                                  onClick={() => {
                                    setSelectedRequest(null);
                                    setAdminNote("");
                                  }}
                                  variant="outline"
                                  className="border-2 border-black"
                                  data-testid={`button-cancel-project-${project.id}`}
                                >
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <Button
                              onClick={() => setSelectedRequest(project.id)}
                              className="border-2 border-black"
                              data-testid={`button-review-project-${project.id}`}
                            >
                              Review Project
                            </Button>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* User Management Tab */}
          <TabsContent value="users">
            <div className="space-y-6">
              {/* Investors */}
              <Card className="border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                <CardHeader>
                  <CardTitle>Investors ({userData?.investors.length || 0})</CardTitle>
                </CardHeader>
                <CardContent>
                  {usersLoading ? (
                    <div className="text-center py-4">Loading users...</div>
                  ) : !userData?.investors.length ? (
                    <div className="text-center py-4 text-gray-500">No investors found</div>
                  ) : (
                    <div className="space-y-3">
                      {userData.investors.map((investor) => (
                        <div key={investor.id} className="flex justify-between items-center p-4 border-2 border-gray-200 rounded-lg">
                          <div>
                            <div className="font-semibold">
                              {investor.firstName} {investor.lastName} ({investor.username})
                            </div>
                            <div className="text-sm text-gray-600">{investor.email}</div>
                            <div className="text-sm">
                              Balance: ${investor.balance} | Lava Coins: {investor.lavaCoins}
                            </div>
                            <div className="flex gap-2 mt-1">
                              <Badge variant={investor.isApproved ? "default" : "secondary"}>
                                {investor.isApproved ? "Approved" : "Pending"}
                              </Badge>
                              {investor.isBanned && <Badge variant="destructive">Banned</Badge>}
                            </div>
                          </div>
                          {!investor.isBanned && (
                            <Button
                              onClick={() => banUserMutation.mutate(investor.id)}
                              disabled={banUserMutation.isPending}
                              variant="destructive"
                              size="sm"
                              className="border-2 border-black"
                              data-testid={`button-ban-investor-${investor.id}`}
                            >
                              Ban User
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Creators */}
              <Card className="border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                <CardHeader>
                  <CardTitle>Creators ({userData?.creators.length || 0})</CardTitle>
                </CardHeader>
                <CardContent>
                  {usersLoading ? (
                    <div className="text-center py-4">Loading creators...</div>
                  ) : !userData?.creators.length ? (
                    <div className="text-center py-4 text-gray-500">No creators found</div>
                  ) : (
                    <div className="space-y-3">
                      {userData.creators.map((creator) => (
                        <div key={creator.id} className="flex justify-between items-center p-4 border-2 border-gray-200 rounded-lg">
                          <div>
                            <div className="font-semibold">
                              {creator.firstName} {creator.lastName} ({creator.username})
                            </div>
                            <div className="text-sm text-gray-600">{creator.email}</div>
                            <div className="text-sm">
                              Balance: ${creator.balance} | Lava Coins: {creator.lavaCoins}
                            </div>
                            <div className="flex gap-2 mt-1">
                              <Badge variant={creator.isApproved ? "default" : "secondary"}>
                                {creator.isApproved ? "Approved" : "Pending"}
                              </Badge>
                              {creator.isBanned && <Badge variant="destructive">Banned</Badge>}
                            </div>
                          </div>
                          {!creator.isBanned && (
                            <Button
                              onClick={() => banUserMutation.mutate(creator.id)}
                              disabled={banUserMutation.isPending}
                              variant="destructive"
                              size="sm"
                              className="border-2 border-black"
                              data-testid={`button-ban-creator-${creator.id}`}
                            >
                              Ban User
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default AdminDashboard;