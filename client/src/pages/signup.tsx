import { useState } from "react";
import { Eye, EyeOff, Wallet, ArrowRight, User, Briefcase } from "lucide-react";
import { Link } from "wouter";
import { useSignup } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

export default function SignUp() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const signupMutation = useSignup();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "investor",
    acceptTerms: false
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type, checked } = e.target as HTMLInputElement;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }

    if (!formData.acceptTerms) {
      toast({
        title: "Error",
        description: "Please accept the terms and conditions",
        variant: "destructive",
      });
      return;
    }

    signupMutation.mutate({
      username: formData.email.split('@')[0], // Use email prefix as username
      email: formData.email,
      password: formData.password,
      role: formData.role,
      firstName: formData.firstName,
      lastName: formData.lastName,
    }, {
      onError: (error: any) => {
        toast({
          title: "Signup Failed",
          description: error.message || "Failed to create account",
          variant: "destructive",
        });
      },
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full space-y-8 animate-slide-up">
        <div className="text-center">
          <Link href="/">
            <div className="text-3xl font-black tracking-tight">
              <span className="gradient-text" data-testid="logo-signup">CrowdChain</span>
            </div>
          </Link>
          <h2 className="mt-6 text-3xl font-black text-foreground" data-testid="text-signup-title">
            Join the Revolution
          </h2>
          <p className="mt-2 text-sm text-muted-foreground" data-testid="text-signup-subtitle">
            Start your decentralized crowdfunding journey today
          </p>
        </div>

        <div className="brutalist-card bg-card p-8 rounded-2xl">
          <form className="space-y-6" onSubmit={handleSubmit} data-testid="form-signup">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-bold text-foreground mb-2">
                  First Name
                </label>
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  required
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-3 border-black rounded-lg bg-background text-foreground placeholder-muted-foreground focus:ring-2 focus:ring-primary focus:border-primary transition-all brutalist-button"
                  placeholder="John"
                  data-testid="input-first-name"
                />
              </div>
              <div>
                <label htmlFor="lastName" className="block text-sm font-bold text-foreground mb-2">
                  Last Name
                </label>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  required
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-3 border-black rounded-lg bg-background text-foreground placeholder-muted-foreground focus:ring-2 focus:ring-primary focus:border-primary transition-all brutalist-button"
                  placeholder="Doe"
                  data-testid="input-last-name"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-bold text-foreground mb-2">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border-3 border-black rounded-lg bg-background text-foreground placeholder-muted-foreground focus:ring-2 focus:ring-primary focus:border-primary transition-all brutalist-button"
                placeholder="john.doe@example.com"
                data-testid="input-email"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-bold text-foreground mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 pr-12 border-3 border-black rounded-lg bg-background text-foreground placeholder-muted-foreground focus:ring-2 focus:ring-primary focus:border-primary transition-all brutalist-button"
                  placeholder="Create a strong password"
                  data-testid="input-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground"
                  data-testid="button-toggle-password"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-bold text-foreground mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 pr-12 border-3 border-black rounded-lg bg-background text-foreground placeholder-muted-foreground focus:ring-2 focus:ring-primary focus:border-primary transition-all brutalist-button"
                  placeholder="Confirm your password"
                  data-testid="input-confirm-password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground"
                  data-testid="button-toggle-confirm-password"
                >
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="role" className="block text-sm font-bold text-foreground mb-2">
                Account Type
              </label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border-3 border-black rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-primary transition-all brutalist-button"
                data-testid="select-role"
              >
                <option value="investor">
                  💼 Investor - Discover and fund innovative projects
                </option>
                <option value="creator">
                  🚀 Creator - Launch your crowdfunding campaigns
                </option>
              </select>
              <p className="mt-2 text-xs text-muted-foreground">
                {formData.role === "investor" 
                  ? "As an investor, you can browse projects, make investments, and track your portfolio." 
                  : "As a creator, you can submit projects for admin approval and raise funding from investors."
                }
              </p>
            </div>

            <div className="flex items-center">
              <input
                id="acceptTerms"
                name="acceptTerms"
                type="checkbox"
                required
                checked={formData.acceptTerms}
                onChange={handleInputChange}
                className="h-4 w-4 border-3 border-black rounded focus:ring-2 focus:ring-primary text-primary"
                data-testid="checkbox-accept-terms"
              />
              <label htmlFor="acceptTerms" className="ml-3 block text-sm text-foreground">
                I accept the{" "}
                <span className="font-semibold text-primary hover:text-accent transition-colors cursor-pointer" data-testid="link-terms">
                  Terms of Service
                </span>{" "}
                and{" "}
                <span className="font-semibold text-primary hover:text-accent transition-colors cursor-pointer" data-testid="link-privacy">
                  Privacy Policy
                </span>
              </label>
            </div>

            <button
              type="submit"
              disabled={signupMutation.isPending}
              className="w-full brutalist-button bg-primary text-primary-foreground px-6 py-4 rounded-xl text-lg font-bold hover:bg-accent hover:text-accent-foreground transition-colors flex items-center justify-center disabled:opacity-50"
              data-testid="button-signup"
            >
              <Wallet className="mr-2" size={20} />
              {signupMutation.isPending ? "Creating Account..." : "Create Account"}
              <ArrowRight className="ml-2" size={20} />
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link href="/login" className="font-semibold text-primary hover:text-accent transition-colors" data-testid="link-login">
                Sign in
              </Link>
            </p>
          </div>
        </div>

        <div className="text-center">
          <div className="brutalist-card bg-secondary/10 p-4 rounded-xl">
            <p className="text-sm text-muted-foreground" data-testid="text-signup-security">
              🔒 Your data is secured with blockchain technology and encrypted end-to-end
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}