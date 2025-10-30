import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { adminLogin } from "@/lib/api";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Eye, EyeOff, Lock, Mail, Shield } from "lucide-react";
import Starfield from "@/components/Starfield";
// Use public asset path directly

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        title: "Missing Information",
        description: "Please enter both email and password",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      
      const response = await adminLogin(email, password);
      console.log('Login response:', response);
      
      if (response.success) {
        // Update the auth context with the new user data
        console.log('Updating auth context with:', response.token, response.admin);
        login(response.token, response.admin);
        
        toast({
          title: "Login Successful",
          description: `Welcome back, ${response.admin.name}!`,
        });
        
        // Navigate to dashboard
        console.log('Navigating to dashboard...');
        // Small delay to ensure state updates
        setTimeout(() => {
          navigate('/dashboard');
        }, 100);
      } else {
        toast({
          title: "Login Failed",
          description: response.message || "Invalid credentials",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error('Login error:', error);
      toast({
        title: "Login Failed",
        description: error.message || "Please check your credentials and try again",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen cosmic-bg flex items-center justify-center p-4 relative overflow-hidden">
      <Starfield />
      
      {/* Cosmic overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-purple-900/20 to-cyan-900/20 pointer-events-none" />
      
      <div className="w-full max-w-md relative z-10">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 glass rounded-full mb-6 glow-green relative">
            <img src={"/memelogo.png"} alt="MemeChain" className="w-14 h-14 rounded-full" />
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary/20 to-cyan-400/20 animate-pulse" />
          </div>
          <h1 className="text-5xl font-bold text-white mb-3 bg-gradient-to-r from-white via-primary to-cyan-400 bg-clip-text text-transparent">
            MemeChain Admin
          </h1>
          <p className="text-muted-foreground text-lg">Secure access to presale management</p>
        </div>

        {/* Login Card */}
        <Card className="cosmic-card p-1">
          <div className="glass rounded-xl p-6">
            <CardHeader className="space-y-2 text-center">
              <CardTitle className="text-3xl font-bold text-white">Sign In</CardTitle>
              <CardDescription className="text-muted-foreground">
                Enter your admin credentials to continue
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <form onSubmit={handleLogin} className="space-y-6">
                <div className="space-y-3">
                  <Label htmlFor="email" className="text-white font-medium">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-5 w-5 text-primary" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="admin@memechain.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="cosmic-input pl-12 h-12 text-white"
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-3">
                  <Label htmlFor="password" className="text-white font-medium">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-5 w-5 text-primary" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="cosmic-input pl-12 pr-12 h-12 text-white"
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent text-primary hover:text-primary/80"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </Button>
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="cosmic-button w-full h-12 text-lg font-semibold rounded-xl" 
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Signing In...
                    </div>
                  ) : (
                    "Sign In"
                  )}
                </Button>
              </form>

              {/* Default Credentials Info */}
              <div className="mt-6 p-4 glass rounded-lg border border-primary/20">
                <h3 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
                  <Shield className="h-4 w-4 text-primary" />
                  Default Credentials:
                </h3>
                <div className="text-xs text-muted-foreground space-y-1">
                  <p><strong>Email:</strong> admin@memechain.com</p>
                  <p><strong>Password:</strong> Admin@123456</p>
                </div>
              </div>
            </CardContent>
          </div>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-muted-foreground">
          <p className="font-medium">MemeChain ICO Admin Dashboard</p>
          <p className="mt-1">Powered by blockchain technology</p>
        </div>
      </div>
    </div>
  );
}
