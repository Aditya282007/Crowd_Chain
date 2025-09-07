import { useState } from "react";
import { Eye, EyeOff, LogIn, ArrowRight, Crown } from "lucide-react";
import { Link } from "wouter";
import { useLogin } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const loginMutation = useLogin();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    loginMutation.mutate({
      email: formData.email,
      password: formData.password,
    }, {
      onError: (error: any) => {
        toast({
          title: "Login Failed",
          description: error.message || "Invalid email or password",
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
              <span className="gradient-text" data-testid="logo-login">CrowdChain</span>
            </div>
          </Link>
          <h2 className="mt-6 text-3xl font-black text-foreground" data-testid="text-login-title">
            Welcome Back
          </h2>
          <p className="mt-2 text-sm text-muted-foreground" data-testid="text-login-subtitle">
            Sign in to your decentralized wallet
          </p>
        </div>

        <div className="brutalist-card bg-card p-8 rounded-2xl">
          <form className="space-y-6" onSubmit={handleSubmit} data-testid="form-login">
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
                placeholder="Enter your email"
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
                  placeholder="Enter your password"
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

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="rememberMe"
                  name="rememberMe"
                  type="checkbox"
                  checked={formData.rememberMe}
                  onChange={handleInputChange}
                  className="h-4 w-4 border-3 border-black rounded focus:ring-2 focus:ring-primary text-primary"
                  data-testid="checkbox-remember-me"
                />
                <label htmlFor="rememberMe" className="ml-2 block text-sm text-foreground">
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <span className="font-semibold text-primary hover:text-accent transition-colors cursor-pointer" data-testid="link-forgot-password">
                  Forgot password?
                </span>
              </div>
            </div>

            <button
              type="submit"
              disabled={loginMutation.isPending}
              className="w-full brutalist-button bg-primary text-primary-foreground px-6 py-4 rounded-xl text-lg font-bold hover:bg-accent hover:text-accent-foreground transition-colors flex items-center justify-center disabled:opacity-50"
              data-testid="button-login"
            >
              <LogIn className="mr-2" size={20} />
              {loginMutation.isPending ? "Signing In..." : "Sign In"}
              <ArrowRight className="ml-2" size={20} />
            </button>
          </form>

          <div className="mt-6 space-y-4">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t-2 border-black"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-3 bg-card text-muted-foreground font-bold">OR</span>
              </div>
            </div>

            <a
              href="/api/auth/google"
              className="w-full brutalist-button bg-white text-black border-2 border-black px-6 py-4 rounded-xl text-lg font-bold hover:bg-gray-50 transition-colors flex items-center justify-center"
              data-testid="button-google-login"
            >
              <svg className="mr-3" width="20" height="20" viewBox="0 0 24 24">
                <path fill="#4285f4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34a853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#fbbc05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#ea4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </a>
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Don't have an account?{" "}
              <Link href="/signup" className="font-semibold text-primary hover:text-accent transition-colors" data-testid="link-signup">
                Sign up
              </Link>
            </p>
          </div>
        </div>

        <div className="text-center">
          <div className="brutalist-card bg-primary/10 p-4 rounded-xl">
            <p className="text-sm text-muted-foreground" data-testid="text-login-security">
              🛡️ Secure blockchain authentication with multi-factor protection
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}