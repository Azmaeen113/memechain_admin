import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { getDashboardStats } from '@/lib/api';
import { Users, DollarSign, TrendingUp, Activity, LogOut, Settings, BarChart3, Zap, Coins } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import Starfield from '@/components/Starfield';
// Use public asset path directly

export default function Dashboard() {
  const { user, logout, token } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalUsers: 0,
    paidUsers: 0,
    unpaidUsers: 0,
    presaleInfo: {}
  });
  const [, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        if (token) {
          console.log('Fetching stats with token:', token);
          const response = await getDashboardStats(token);
          setStats(response);
        }
      } catch (error) {
        console.error('Error fetching stats:', error);
        toast({
          title: "Error",
          description: "Failed to fetch dashboard statistics",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchStats();
    }
  }, [token, toast]);

  const handleLogout = () => {
    logout();
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out",
    });
    navigate('/login');
  };

  const statCards = [
    {
      title: "Total Users",
      value: stats.totalUsers,
      icon: Users,
      description: "Registered participants",
      color: "text-primary",
      bgColor: "bg-primary/10"
    },
    {
      title: "Paid Users",
      value: stats.paidUsers,
      icon: DollarSign,
      description: "Users who have paid",
      color: "text-cyan-400",
      bgColor: "bg-cyan-400/10"
    },
    {
      title: "Unpaid Users",
      value: stats.unpaidUsers,
      icon: Activity,
      description: "Users pending payment",
      color: "text-orange-400",
      bgColor: "bg-orange-400/10"
    },
    {
      title: "Success Rate",
      value: stats.totalUsers > 0 ? `${Math.round((stats.paidUsers / stats.totalUsers) * 100)}%` : "0%",
      icon: TrendingUp,
      description: "Payment completion rate",
      color: "text-purple-400",
      bgColor: "bg-purple-400/10"
    }
  ];

  return (
    <div className="min-h-screen cosmic-bg relative overflow-hidden">
      <Starfield />
      
      {/* Cosmic overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/10 via-purple-900/10 to-cyan-900/10 pointer-events-none" />
      
      {/* Header */}
      <header className="relative z-10 glass border-b border-primary/20 shadow-lg">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <img src={"/memelogo.png"} alt="MemeChain" className="w-12 h-12 rounded-full glow-green" />
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary/20 to-cyan-400/20 animate-pulse" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-white via-primary to-cyan-400 bg-clip-text text-transparent">
                  MemeChain Admin
                </h1>
                <p className="text-muted-foreground">Presale Management Dashboard</p>
              </div>
            </div>
            
            <div className="flex items-center gap-6">
              <div className="text-right">
                <p className="text-white font-semibold text-lg">{user?.name}</p>
                <p className="text-primary text-sm font-medium">{user?.role}</p>
              </div>
              <Button
                onClick={handleLogout}
                variant="ghost"
                className="text-white hover:bg-primary/10 hover:text-primary border border-primary/20 hover:border-primary/40 smooth-transition"
              >
                <LogOut className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8 relative z-10">
        {/* Welcome Section */}
        <div className="mb-10">
          <h2 className="text-4xl font-bold text-white mb-3 flex items-center gap-3">
            Welcome back, {user?.name}! 
            <Zap className="w-8 h-8 text-primary animate-pulse" />
          </h2>
          <p className="text-muted-foreground text-xl">
            Here's what's happening with your presale today.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
          {statCards.map((stat, index) => (
            <Card key={index} className="cosmic-card group">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-medium text-white">
                  {stat.title}
                </CardTitle>
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
                <p className="text-sm text-muted-foreground">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Action Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Quick Actions */}
          <Card className="cosmic-card">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-3 text-xl">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Settings className="w-6 h-6 text-primary" />
                </div>
                Quick Actions
              </CardTitle>
              <CardDescription className="text-muted-foreground text-lg">
                Manage your presale settings and participants
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                className="cosmic-button w-full h-12 text-lg font-semibold"
                onClick={() => navigate('/presale-management')}
              >
                <Zap className="w-5 h-5 mr-2" />
                Manage Presale
              </Button>
              <Button 
                variant="outline" 
                className="w-full h-12 border border-primary/30 text-white hover:bg-primary/10 hover:border-primary/50 smooth-transition"
                onClick={() => navigate('/tokenomics')}
              >
                <Coins className="w-5 h-5 mr-2" />
                Tokenomics
              </Button>
              <Button 
                variant="outline" 
                className="w-full h-12 border border-primary/30 text-white hover:bg-primary/10 hover:border-primary/50 smooth-transition"
                onClick={() => navigate('/users')}
              >
                <Users className="w-5 h-5 mr-2" />
                View Participants
              </Button>
              <Button 
                variant="outline" 
                className="w-full h-12 border border-primary/30 text-white hover:bg-primary/10 hover:border-primary/50 smooth-transition"
                onClick={() => navigate('/transactions')}
              >
                <BarChart3 className="w-5 h-5 mr-2" />
                Transaction History
              </Button>
            </CardContent>
          </Card>

          {/* Analytics */}
          <Card className="cosmic-card">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-3 text-xl">
                <div className="p-2 rounded-lg bg-cyan-400/10">
                  <BarChart3 className="w-6 h-6 text-cyan-400" />
                </div>
                Analytics Overview
              </CardTitle>
              <CardDescription className="text-muted-foreground text-lg">
                Key metrics and performance indicators
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex justify-between items-center p-3 glass rounded-lg border border-primary/20">
                <span className="text-white font-medium">Payment Rate</span>
                <span className="text-primary font-bold text-lg">
                  {stats.totalUsers > 0 ? `${Math.round((stats.paidUsers / stats.totalUsers) * 100)}%` : "0%"}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 glass rounded-lg border border-primary/20">
                <span className="text-white font-medium">Total Participants</span>
                <span className="text-white font-bold text-lg">{stats.totalUsers}</span>
              </div>
              <div className="flex justify-between items-center p-3 glass rounded-lg border border-primary/20">
                <span className="text-white font-medium">Completed Payments</span>
                <span className="text-cyan-400 font-bold text-lg">{stats.paidUsers}</span>
              </div>
              <div className="flex justify-between items-center p-3 glass rounded-lg border border-primary/20">
                <span className="text-white font-medium">Pending Payments</span>
                <span className="text-orange-400 font-bold text-lg">{stats.unpaidUsers}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card className="mt-10 cosmic-card">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-3 text-xl">
              <div className="p-2 rounded-lg bg-purple-400/10">
                <Activity className="w-6 h-6 text-purple-400" />
              </div>
              Recent Activity
            </CardTitle>
            <CardDescription className="text-muted-foreground text-lg">
              Latest updates and notifications
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 glass rounded-lg border-l-4 border-primary smooth-transition hover:border-primary/60">
                <div className="w-3 h-3 bg-primary rounded-full animate-pulse"></div>
                <div>
                  <p className="text-white font-medium">System Status</p>
                  <p className="text-muted-foreground text-sm">All systems operational</p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 glass rounded-lg border-l-4 border-cyan-400 smooth-transition hover:border-cyan-400/60">
                <div className="w-3 h-3 bg-cyan-400 rounded-full animate-pulse"></div>
                <div>
                  <p className="text-white font-medium">New Registration</p>
                  <p className="text-muted-foreground text-sm">User registered successfully</p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 glass rounded-lg border-l-4 border-purple-400 smooth-transition hover:border-purple-400/60">
                <div className="w-3 h-3 bg-purple-400 rounded-full animate-pulse"></div>
                <div>
                  <p className="text-white font-medium">Payment Processed</p>
                  <p className="text-muted-foreground text-sm">New payment received</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
