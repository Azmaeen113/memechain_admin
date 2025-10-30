import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { getCountdownSettings, updateCountdownSettings, getLiveStats, updateLiveStats } from '@/lib/api';
import { useToast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, Save, Calendar, Zap, Target } from 'lucide-react';
import Starfield from '@/components/Starfield';

interface CountdownSettings {
  id: number;
  target_date: string;
  title: string;
  description: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface LiveStats {
  id?: number;
  participants: number;
  raised_amount: number;
  tokens_allocated: string;
  days_to_launch: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export default function PresaleManagement() {
  const { token, user, isAuthenticated, refreshToken } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<CountdownSettings | null>(null);
  const [liveStats, setLiveStats] = useState<LiveStats | null>(null);
  
  const [formData, setFormData] = useState({
    target_date: '',
    title: '',
    description: '',
    is_active: true
  });

  const [statsFormData, setStatsFormData] = useState({
    participants: 0,
    raised_amount: 0,
    tokens_allocated: '',
    days_to_launch: 0,
    is_active: true
  });

  useEffect(() => {
    console.log('PresaleManagement: Token changed:', token ? `${token.substring(0, 20)}...` : 'null');
    console.log('PresaleManagement: User:', user);
    console.log('PresaleManagement: IsAuthenticated:', isAuthenticated);
    
    if (token) {
      loadCountdownSettings();
      loadLiveStats();
    }
  }, [token]);

  const loadCountdownSettings = async () => {
    try {
      setLoading(true);
      if (!token) {
        throw new Error('No authentication token found');
      }
      console.log('Loading countdown settings with token:', token);
      
      try {
        const response = await getCountdownSettings(token);
        setSettings(response);
        setFormData({
          target_date: response.target_date || '',
          title: response.title || '',
          description: response.description || '',
          is_active: response.is_active || true
        });
      } catch (error: any) {
        // Check if it's a 401 error (unauthorized)
        if (error.message && error.message.includes('401')) {
          console.log('401 error detected during load, attempting token refresh...');
          const refreshSuccess = await refreshToken();
          
          if (refreshSuccess) {
            console.log('Token refreshed, retrying load...');
            // Get the new token from localStorage after refresh
            const newToken = localStorage.getItem('adminToken');
            if (newToken) {
              const response = await getCountdownSettings(newToken);
              setSettings(response);
              setFormData({
                target_date: response.target_date || '',
                title: response.title || '',
                description: response.description || '',
                is_active: response.is_active || true
              });
            } else {
              throw new Error('New token not found after refresh.');
            }
          } else {
            throw new Error('Token refresh failed. Please login again.');
          }
        } else {
          throw error;
        }
      }
    } catch (error) {
      console.error('Error loading countdown settings:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to load countdown settings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadLiveStats = async () => {
    try {
      if (!token) {
        throw new Error('No authentication token found');
      }
      console.log('Loading live stats with token:', token);
      
      try {
        const response = await getLiveStats(token);
        setLiveStats(response);
        setStatsFormData({
          participants: response.participants || 0,
          raised_amount: response.raised_amount || 0,
          tokens_allocated: response.tokens_allocated || '',
          days_to_launch: response.days_to_launch || 0,
          is_active: response.is_active || true
        });
      } catch (error: any) {
        // Check if it's a 401 error (unauthorized)
        if (error.message && error.message.includes('401')) {
          console.log('401 error detected during live stats load, attempting token refresh...');
          const refreshSuccess = await refreshToken();
          
          if (refreshSuccess) {
            console.log('Token refreshed, retrying live stats load...');
            // Get the new token from localStorage after refresh
            const newToken = localStorage.getItem('adminToken');
            if (newToken) {
              const response = await getLiveStats(newToken);
              setLiveStats(response);
              setStatsFormData({
                participants: response.participants || 0,
                raised_amount: response.raised_amount || 0,
                tokens_allocated: response.tokens_allocated || '',
                days_to_launch: response.days_to_launch || 0,
                is_active: response.is_active || true
              });
            } else {
              throw new Error('New token not found after refresh.');
            }
          } else {
            throw new Error('Token refresh failed. Please login again.');
          }
        } else {
          throw error;
        }
      }
    } catch (error) {
      console.error('Error loading live stats:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to load live stats",
        variant: "destructive",
      });
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      // Validate target_date format
      if (!formData.target_date) {
        throw new Error('Target date is required');
      }
      
      // Check if the date format is correct (YYYY-MM-DD HH:MM:SS)
      const dateRegex = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/;
      if (!dateRegex.test(formData.target_date)) {
        console.error('Invalid date format:', formData.target_date);
        throw new Error('Invalid date format. Please select a valid date and time.');
      }
      
      console.log('=== SAVE DEBUG INFO ===');
      console.log('Token:', token ? `${token.substring(0, 20)}...` : 'null');
      console.log('Token length:', token ? token.length : 0);
      console.log('Form data:', formData);
      console.log('Target date value:', formData.target_date);
      console.log('Target date type:', typeof formData.target_date);
      console.log('About to call updateCountdownSettings...');
      
      try {
        await updateCountdownSettings(token, formData);
        
        toast({
          title: "Success",
          description: "Countdown timer settings updated successfully!",
        });
        
        // Reload settings
        await loadCountdownSettings();
      } catch (error: any) {
        // Check if it's a 401 error (unauthorized)
        if (error.message && error.message.includes('401')) {
          console.log('401 error detected, attempting token refresh...');
          const refreshSuccess = await refreshToken();
          
          if (refreshSuccess) {
            console.log('Token refreshed, retrying save...');
            // Get the new token from localStorage after refresh
            const newToken = localStorage.getItem('adminToken');
            if (newToken) {
              await updateCountdownSettings(newToken, formData);
              
              toast({
                title: "Success",
                description: "Countdown timer settings updated successfully!",
              });
              
              // Reload settings
              await loadCountdownSettings();
            } else {
              throw new Error('New token not found after refresh.');
            }
          } else {
            throw new Error('Token refresh failed. Please login again.');
          }
        } else {
          throw error;
        }
      }
    } catch (error) {
      console.error('Error updating countdown settings:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update countdown settings",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSaveStats = async () => {
    try {
      setSaving(true);
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      // Validate required fields
      if (!statsFormData.participants || !statsFormData.raised_amount || !statsFormData.tokens_allocated || !statsFormData.days_to_launch) {
        throw new Error('All fields are required');
      }
      
      console.log('=== SAVE LIVE STATS DEBUG INFO ===');
      console.log('Token:', token ? `${token.substring(0, 20)}...` : 'null');
      console.log('Stats form data:', statsFormData);
      console.log('About to call updateLiveStats...');
      
      try {
        await updateLiveStats(token, statsFormData);
        
        toast({
          title: "Success",
          description: "Live stats updated successfully!",
        });
        
        // Reload stats
        await loadLiveStats();
      } catch (error: any) {
        // Check if it's a 401 error (unauthorized)
        if (error.message && error.message.includes('401')) {
          console.log('401 error detected, attempting token refresh...');
          const refreshSuccess = await refreshToken();
          
          if (refreshSuccess) {
            console.log('Token refreshed, retrying stats save...');
            // Get the new token from localStorage after refresh
            const newToken = localStorage.getItem('adminToken');
            if (newToken) {
              await updateLiveStats(newToken, statsFormData);
              
              toast({
                title: "Success",
                description: "Live stats updated successfully!",
              });
              
              // Reload stats
              await loadLiveStats();
            } else {
              throw new Error('New token not found after refresh.');
            }
          } else {
            throw new Error('Token refresh failed. Please login again.');
          }
        } else {
          throw error;
        }
      }
    } catch (error) {
      console.error('Error updating live stats:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update live stats",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const formatBackendDate = (d: Date) => {
    const yyyy = d.getFullYear();
    const MM = String(d.getMonth() + 1).padStart(2, '0');
    const DD = String(d.getDate()).padStart(2, '0');
    const HH = String(d.getHours()).padStart(2, '0');
    const mm = String(d.getMinutes()).padStart(2, '0');
    const ss = String(d.getSeconds()).padStart(2, '0');
    return `${yyyy}-${MM}-${DD} ${HH}:${mm}:${ss}`;
  };

  // Removed unused formatDateTime and getCurrentDateTime helpers

  if (loading || !token || !isAuthenticated) {
    return (
      <div className="min-h-screen cosmic-bg flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">
            {!token ? 'Authenticating...' : !isAuthenticated ? 'Checking authentication...' : 'Loading countdown settings...'}
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            Token: {token ? 'Present' : 'Missing'} | Authenticated: {isAuthenticated ? 'Yes' : 'No'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen cosmic-bg relative overflow-hidden">
      <Starfield />
      
      {/* Cosmic overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/10 via-purple-900/10 to-cyan-900/10 pointer-events-none" />
      
      <div className="container mx-auto px-6 py-8 relative z-10">
        {/* Header */}
        <div className="mb-8">
          <Button
            onClick={() => navigate('/dashboard')}
            variant="ghost"
            className="text-white hover:bg-primary/10 hover:text-primary mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          
          <h1 className="text-4xl font-bold text-white mb-3 flex items-center gap-3">
            <Target className="w-10 h-10 text-primary" />
            Presale Management
          </h1>
          <p className="text-muted-foreground text-xl">
            Manage countdown timer, live stats, and presale settings
          </p>
        </div>

        {/* Current Settings Card */}
        {settings && (
          <Card className="cosmic-card mb-8">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-3">
                <Clock className="w-6 h-6 text-primary" />
                Current Countdown Settings
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Current timer configuration displayed on the frontend
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-white font-medium">Target Date</Label>
                  <p className="text-primary font-mono text-lg">{settings.target_date}</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-white font-medium">Status</Label>
                  <p className={`font-semibold ${settings.is_active ? 'text-primary' : 'text-orange-400'}`}>
                    {settings.is_active ? 'Active' : 'Inactive'}
                  </p>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-white font-medium">Title</Label>
                <p className="text-white text-lg">{settings.title}</p>
              </div>
              <div className="space-y-2">
                <Label className="text-white font-medium">Description</Label>
                <p className="text-muted-foreground">{settings.description}</p>
              </div>
              <div className="space-y-2">
                <Label className="text-white font-medium">Last Updated</Label>
                <p className="text-muted-foreground text-sm">{new Date(settings.updated_at).toLocaleString()}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Current Live Stats Card */}
        {liveStats && (
          <Card className="cosmic-card mb-8">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-3">
                <Zap className="w-6 h-6 text-primary" />
                Current Live Stats
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Current statistics displayed on the frontend
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="space-y-2">
                  <Label className="text-white font-medium">Participants</Label>
                  <p className="text-primary font-bold text-2xl">{liveStats.participants.toLocaleString()}</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-white font-medium">Raised</Label>
                  <p className="text-primary font-bold text-2xl">${(liveStats.raised_amount / 1000).toFixed(0)}K</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-white font-medium">Tokens Allocated</Label>
                  <p className="text-primary font-bold text-2xl">{liveStats.tokens_allocated}</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-white font-medium">Days to Launch</Label>
                  <p className="text-primary font-bold text-2xl">{liveStats.days_to_launch}</p>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-white font-medium">Status</Label>
                <p className={`font-semibold ${liveStats.is_active ? 'text-primary' : 'text-orange-400'}`}>
                  {liveStats.is_active ? 'Active' : 'Inactive'}
                </p>
              </div>
              <div className="space-y-2">
                <Label className="text-white font-medium">Last Updated</Label>
                <p className="text-muted-foreground text-sm">{new Date(liveStats.updated_at || '').toLocaleString()}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Settings Form */}
        <Card className="cosmic-card">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-3">
              <Calendar className="w-6 h-6 text-cyan-400" />
              Update Countdown Timer
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Set the target date and time for the presale countdown
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label htmlFor="target_date" className="text-white font-medium">
                  Target Date & Time *
                </Label>
                <Input
                  id="target_date"
                  type="datetime-local"
                  value={formData.target_date ? formData.target_date.replace(' ', 'T').slice(0, 16) : ''}
                  onChange={(e) => {
                    // Convert from datetime-local format (YYYY-MM-DDTHH:MM) to backend format (YYYY-MM-DD HH:MM:SS)
                    const dateValue = e.target.value;
                    if (dateValue) {
                      const d = new Date(dateValue);
                      const backendFormat = formatBackendDate(d);
                      setFormData({ ...formData, target_date: backendFormat });
                    } else {
                      setFormData({ ...formData, target_date: '' });
                    }
                  }}
                  className="cosmic-input h-12"
                  placeholder="MM/DD/YYYY HH:MM"
                />
                <p className="text-xs text-muted-foreground">
                  Input shown uses your locale: MM/DD/YYYY HH:MM (AM/PM). Saved format: YYYY-MM-DD HH:MM:SS (local time).
                </p>
                {formData.target_date && (
                  <p className="text-xs text-primary font-mono">
                    Saving as: {formData.target_date}
                  </p>
                )}
              </div>
              
              <div className="space-y-3">
                <Label className="text-white font-medium">Quick Presets</Label>
                <div className="space-y-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="w-full border-primary/30 text-white hover:bg-primary/10"
                    onClick={() => {
                      const now = new Date();
                      const future = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours
                      setFormData({
                        ...formData,
                        target_date: formatBackendDate(future)
                      });
                    }}
                  >
                    +24 Hours
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="w-full border-primary/30 text-white hover:bg-primary/10"
                    onClick={() => {
                      const now = new Date();
                      const future = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days
                      setFormData({
                        ...formData,
                        target_date: formatBackendDate(future)
                      });
                    }}
                  >
                    +7 Days
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="w-full border-primary/30 text-white hover:bg-primary/10"
                    onClick={() => {
                      const now = new Date();
                      const future = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days
                      setFormData({
                        ...formData,
                        target_date: formatBackendDate(future)
                      });
                    }}
                  >
                    +30 Days
                  </Button>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <Label htmlFor="title" className="text-white font-medium">Countdown Title</Label>
              <Input
                id="title"
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="cosmic-input h-12"
                placeholder="Memechain Presale"
              />
            </div>

            <div className="space-y-3">
              <Label htmlFor="description" className="text-white font-medium">Description</Label>
              <Input
                id="description"
                type="text"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="cosmic-input h-12"
                placeholder="Get ready for the biggest meme coin presale!"
              />
            </div>

            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="is_active"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                className="w-4 h-4 text-primary bg-card border-border rounded focus:ring-primary focus:ring-2"
              />
              <Label htmlFor="is_active" className="text-white font-medium">
                Activate countdown timer
              </Label>
            </div>

            <div className="flex gap-4 pt-4">
              <Button
                onClick={handleSave}
                disabled={saving || !formData.target_date}
                className="cosmic-button flex-1 h-12 text-lg font-semibold"
              >
                {saving ? (
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Saving...
                  </div>
                ) : (
                  <>
                    <Save className="w-5 h-5 mr-2" />
                    Save Settings
                  </>
                )}
              </Button>
              
              <Button
                onClick={loadCountdownSettings}
                variant="outline"
                className="border-primary/30 text-white hover:bg-primary/10 hover:border-primary/50 smooth-transition h-12"
              >
                <Zap className="w-5 h-5 mr-2" />
                Refresh
              </Button>
              
              <Button
                onClick={() => {
                  console.log('=== MANUAL DEBUG TEST ===');
                  console.log('Current token:', token ? `${token.substring(0, 20)}...` : 'null');
                  console.log('Current user:', user);
                  console.log('Is authenticated:', isAuthenticated);
                  console.log('Available in localStorage:', localStorage.getItem('adminToken') ? 'Yes' : 'No');
                }}
                variant="outline"
                className="border-orange-400/30 text-orange-400 hover:bg-orange-400/10 hover:border-orange-400/50 smooth-transition h-12"
              >
                Debug Token
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Live Stats Form */}
        <Card className="cosmic-card mt-8">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-3">
              <Zap className="w-6 h-6 text-primary" />
              Update Live Stats
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Update the live statistics displayed on the frontend
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label htmlFor="participants" className="text-white font-medium">Participants</Label>
                <Input
                  id="participants"
                  type="number"
                  value={statsFormData.participants}
                  onChange={(e) => setStatsFormData({ ...statsFormData, participants: parseInt(e.target.value) || 0 })}
                  className="cosmic-input h-12"
                  placeholder="847"
                />
              </div>
              
              <div className="space-y-3">
                <Label htmlFor="raised_amount" className="text-white font-medium">Raised Amount ($)</Label>
                <Input
                  id="raised_amount"
                  type="number"
                  value={statsFormData.raised_amount}
                  onChange={(e) => setStatsFormData({ ...statsFormData, raised_amount: parseFloat(e.target.value) || 0 })}
                  className="cosmic-input h-12"
                  placeholder="125000"
                />
              </div>
              
              <div className="space-y-3">
                <Label htmlFor="tokens_allocated" className="text-white font-medium">Tokens Allocated</Label>
                <Input
                  id="tokens_allocated"
                  type="text"
                  value={statsFormData.tokens_allocated}
                  onChange={(e) => setStatsFormData({ ...statsFormData, tokens_allocated: e.target.value })}
                  className="cosmic-input h-12"
                  placeholder="12.5B"
                />
              </div>
              
              <div className="space-y-3">
                <Label htmlFor="days_to_launch" className="text-white font-medium">Days to Launch</Label>
                <Input
                  id="days_to_launch"
                  type="number"
                  value={statsFormData.days_to_launch}
                  onChange={(e) => setStatsFormData({ ...statsFormData, days_to_launch: parseInt(e.target.value) || 0 })}
                  className="cosmic-input h-12"
                  placeholder="71"
                />
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="stats_is_active"
                checked={statsFormData.is_active}
                onChange={(e) => setStatsFormData({ ...statsFormData, is_active: e.target.checked })}
                className="w-4 h-4 text-primary bg-card border-border rounded focus:ring-primary focus:ring-2"
              />
              <Label htmlFor="stats_is_active" className="text-white font-medium">
                Activate live stats
              </Label>
            </div>

            <div className="flex gap-4 pt-4">
              <Button
                onClick={handleSaveStats}
                disabled={saving}
                className="cosmic-button flex-1 h-12 text-lg font-semibold"
              >
                {saving ? (
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Saving...
                  </div>
                ) : (
                  <>
                    <Save className="w-5 h-5 mr-2" />
                    Save Live Stats
                  </>
                )}
              </Button>
              
              <Button
                onClick={loadLiveStats}
                variant="outline"
                className="border-primary/30 text-white hover:bg-primary/10 hover:border-primary/50 smooth-transition h-12"
              >
                <Zap className="w-5 h-5 mr-2" />
                Refresh
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
