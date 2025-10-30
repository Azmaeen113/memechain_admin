import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { getTokenomics, updateTokenomics } from '@/lib/api';
import { Coins, Save, ArrowLeft, DollarSign, BarChart3 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import Starfield from '@/components/Starfield';

interface Tokenomics {
  id?: number;
  total_supply: number;
  presale_stage1_price: number;
  presale_stage2_price: number;
  presale_stage3_price: number;
  presale_stage4_price: number;
  presale_stage5_price: number;
  public_sale_price: number;
  distribution?: {
    team: number;
    presale: number;
    liquidity: number;
    marketing: number;
    reserve: number;
    community: number;
  };
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export default function TokenomicsManagement() {
  const { token, user, isAuthenticated, refreshToken } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [tokenomics, setTokenomics] = useState<Tokenomics | null>(null);
  
  const [formData, setFormData] = useState({
    total_supply: 1000000000,
    presale_stage1_price: 0.001,
    presale_stage2_price: 0.002,
    presale_stage3_price: 0.003,
    presale_stage4_price: 0.004,
    presale_stage5_price: 0.005,
    public_sale_price: 0.01,
    is_active: true
  });

  useEffect(() => {
    console.log('TokenomicsManagement: Token changed:', token ? `${token.substring(0, 20)}...` : 'null');
    console.log('TokenomicsManagement: User:', user);
    console.log('TokenomicsManagement: IsAuthenticated:', isAuthenticated);
    
    if (token) {
      loadTokenomics();
    }
  }, [token]);

  const loadTokenomics = async () => {
    try {
      if (!token) {
        throw new Error('No authentication token found');
      }
      console.log('Loading tokenomics with token:', token);
      
      try {
        const response = await getTokenomics(token);
        setTokenomics(response);
        setFormData({
          total_supply: response.total_supply || 1000000000,
          presale_stage1_price: response.presale_stage1_price || 0.001,
          presale_stage2_price: response.presale_stage2_price || 0.002,
          presale_stage3_price: response.presale_stage3_price || 0.003,
          presale_stage4_price: response.presale_stage4_price || 0.004,
          presale_stage5_price: response.presale_stage5_price || 0.005,
          public_sale_price: response.public_sale_price || 0.01,
          is_active: response.is_active || true
        });
      } catch (error: any) {
        // Check if it's a 401 error (unauthorized)
        if (error.message && error.message.includes('401')) {
          console.log('401 error detected during tokenomics load, attempting token refresh...');
          const refreshSuccess = await refreshToken();
          
          if (refreshSuccess) {
            console.log('Token refreshed, retrying tokenomics load...');
            // Get the new token from localStorage after refresh
            const newToken = localStorage.getItem('adminToken');
            if (newToken) {
              const response = await getTokenomics(newToken);
              setTokenomics(response);
              setFormData({
                total_supply: response.total_supply || 1000000000,
                presale_stage1_price: response.presale_stage1_price || 0.001,
                presale_stage2_price: response.presale_stage2_price || 0.002,
                presale_stage3_price: response.presale_stage3_price || 0.003,
                presale_stage4_price: response.presale_stage4_price || 0.004,
                presale_stage5_price: response.presale_stage5_price || 0.005,
                public_sale_price: response.public_sale_price || 0.01,
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
      console.error('Error loading tokenomics:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to load tokenomics",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      // Validate required fields
      if (!formData.total_supply || formData.total_supply <= 0) {
        throw new Error('Total supply must be greater than 0');
      }
      
      console.log('=== SAVE TOKENOMICS DEBUG INFO ===');
      console.log('Token:', token ? `${token.substring(0, 20)}...` : 'null');
      console.log('Form data:', formData);
      console.log('About to call updateTokenomics...');
      
      try {
        await updateTokenomics(token, formData);
        
        toast({
          title: "Success",
          description: "Tokenomics updated successfully!",
        });
        
        // Reload tokenomics
        await loadTokenomics();
      } catch (error: any) {
        // Check if it's a 401 error (unauthorized)
        if (error.message && error.message.includes('401')) {
          console.log('401 error detected, attempting token refresh...');
          const refreshSuccess = await refreshToken();
          
          if (refreshSuccess) {
            console.log('Token refreshed, retrying tokenomics save...');
            // Get the new token from localStorage after refresh
            const newToken = localStorage.getItem('adminToken');
            if (newToken) {
              await updateTokenomics(newToken, formData);
              
              toast({
                title: "Success",
                description: "Tokenomics updated successfully!",
              });
              
              // Reload tokenomics
              await loadTokenomics();
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
      console.error('Error updating tokenomics:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update tokenomics",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  // Calculate token distribution based on total supply
  const calculateDistribution = (totalSupply: number) => {
    return {
      team: Math.floor(totalSupply * 0.15),           // 15%
      presale: Math.floor(totalSupply * 0.30),        // 30%
      liquidity: Math.floor(totalSupply * 0.20),      // 20%
      marketing: Math.floor(totalSupply * 0.10),      // 10%
      reserve: Math.floor(totalSupply * 0.15),        // 15%
      community: Math.floor(totalSupply * 0.10)       // 10%
    };
  };

  const distribution = calculateDistribution(formData.total_supply);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-background/50 relative overflow-hidden">
        <Starfield />
        <div className="relative z-10 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-white text-lg">Loading tokenomics...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-background/50 relative overflow-hidden">
      <Starfield />
      
      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => navigate('/dashboard')}
              className="text-white hover:bg-primary/10 p-2"
            >
              <ArrowLeft className="w-6 h-6" />
            </Button>
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">Tokenomics Management</h1>
              <p className="text-muted-foreground text-lg">
                Manage token supply, pricing, and distribution
              </p>
            </div>
          </div>
        </div>

        {/* Current Tokenomics Card */}
        {tokenomics && (
          <Card className="cosmic-card mb-8">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-3">
                <BarChart3 className="w-6 h-6 text-primary" />
                Current Tokenomics
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Current tokenomics settings displayed on the frontend
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-white font-medium">Total Supply</Label>
                  <p className="text-primary font-bold text-2xl">{tokenomics.total_supply.toLocaleString()}</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-white font-medium">Public Sale Price</Label>
                  <p className="text-primary font-bold text-2xl">${tokenomics.public_sale_price}</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <Label className="text-white font-medium">Presale Pricing</Label>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <div className="text-center p-3 bg-card/50 rounded-lg">
                    <p className="text-muted-foreground text-sm">Stage 1</p>
                    <p className="text-primary font-bold">${tokenomics.presale_stage1_price}</p>
                  </div>
                  <div className="text-center p-3 bg-card/50 rounded-lg">
                    <p className="text-muted-foreground text-sm">Stage 2</p>
                    <p className="text-primary font-bold">${tokenomics.presale_stage2_price}</p>
                  </div>
                  <div className="text-center p-3 bg-card/50 rounded-lg">
                    <p className="text-muted-foreground text-sm">Stage 3</p>
                    <p className="text-primary font-bold">${tokenomics.presale_stage3_price}</p>
                  </div>
                  <div className="text-center p-3 bg-card/50 rounded-lg">
                    <p className="text-muted-foreground text-sm">Stage 4</p>
                    <p className="text-primary font-bold">${tokenomics.presale_stage4_price}</p>
                  </div>
                  <div className="text-center p-3 bg-card/50 rounded-lg">
                    <p className="text-muted-foreground text-sm">Stage 5</p>
                    <p className="text-primary font-bold">${tokenomics.presale_stage5_price}</p>
                  </div>
                </div>
              </div>

              {tokenomics.distribution && (
                <div className="space-y-4">
                  <Label className="text-white font-medium">Token Distribution</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <p className="text-muted-foreground text-sm">Team (15%)</p>
                      <p className="text-primary font-bold">{tokenomics.distribution.team.toLocaleString()}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-muted-foreground text-sm">Presale (30%)</p>
                      <p className="text-primary font-bold">{tokenomics.distribution.presale.toLocaleString()}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-muted-foreground text-sm">Liquidity (20%)</p>
                      <p className="text-primary font-bold">{tokenomics.distribution.liquidity.toLocaleString()}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-muted-foreground text-sm">Marketing (10%)</p>
                      <p className="text-primary font-bold">{tokenomics.distribution.marketing.toLocaleString()}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-muted-foreground text-sm">Reserve (15%)</p>
                      <p className="text-primary font-bold">{tokenomics.distribution.reserve.toLocaleString()}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-muted-foreground text-sm">Community (10%)</p>
                      <p className="text-primary font-bold">{tokenomics.distribution.community.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label className="text-white font-medium">Status</Label>
                <p className={`font-semibold ${tokenomics.is_active ? 'text-primary' : 'text-orange-400'}`}>
                  {tokenomics.is_active ? 'Active' : 'Inactive'}
                </p>
              </div>
              
              <div className="space-y-2">
                <Label className="text-white font-medium">Last Updated</Label>
                <p className="text-muted-foreground text-sm">{new Date(tokenomics.updated_at || '').toLocaleString()}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Update Tokenomics Form */}
        <Card className="cosmic-card">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-3">
              <Coins className="w-6 h-6 text-primary" />
              Update Tokenomics
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Update token supply, pricing, and distribution settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Total Supply */}
            <div className="space-y-3">
              <Label htmlFor="total_supply" className="text-white font-medium">Total Supply</Label>
              <Input
                id="total_supply"
                type="number"
                value={formData.total_supply}
                onChange={(e) => setFormData({ ...formData, total_supply: parseInt(e.target.value) || 0 })}
                className="cosmic-input h-12"
                placeholder="1000000000"
              />
              <p className="text-muted-foreground text-sm">
                Total number of tokens to be created. Distribution percentages will be calculated automatically.
              </p>
            </div>

            {/* Presale Pricing */}
            <div className="space-y-4">
              <Label className="text-white font-medium">Presale Pricing (ETH)</Label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-3">
                  <Label htmlFor="stage1" className="text-white font-medium">Stage 1 Price</Label>
                  <Input
                    id="stage1"
                    type="number"
                    step="0.001"
                    value={formData.presale_stage1_price}
                    onChange={(e) => setFormData({ ...formData, presale_stage1_price: parseFloat(e.target.value) || 0 })}
                    className="cosmic-input h-12"
                    placeholder="0.001"
                  />
                </div>
                
                <div className="space-y-3">
                  <Label htmlFor="stage2" className="text-white font-medium">Stage 2 Price</Label>
                  <Input
                    id="stage2"
                    type="number"
                    step="0.001"
                    value={formData.presale_stage2_price}
                    onChange={(e) => setFormData({ ...formData, presale_stage2_price: parseFloat(e.target.value) || 0 })}
                    className="cosmic-input h-12"
                    placeholder="0.002"
                  />
                </div>
                
                <div className="space-y-3">
                  <Label htmlFor="stage3" className="text-white font-medium">Stage 3 Price</Label>
                  <Input
                    id="stage3"
                    type="number"
                    step="0.001"
                    value={formData.presale_stage3_price}
                    onChange={(e) => setFormData({ ...formData, presale_stage3_price: parseFloat(e.target.value) || 0 })}
                    className="cosmic-input h-12"
                    placeholder="0.003"
                  />
                </div>
                
                <div className="space-y-3">
                  <Label htmlFor="stage4" className="text-white font-medium">Stage 4 Price</Label>
                  <Input
                    id="stage4"
                    type="number"
                    step="0.001"
                    value={formData.presale_stage4_price}
                    onChange={(e) => setFormData({ ...formData, presale_stage4_price: parseFloat(e.target.value) || 0 })}
                    className="cosmic-input h-12"
                    placeholder="0.004"
                  />
                </div>
                
                <div className="space-y-3">
                  <Label htmlFor="stage5" className="text-white font-medium">Stage 5 Price</Label>
                  <Input
                    id="stage5"
                    type="number"
                    step="0.001"
                    value={formData.presale_stage5_price}
                    onChange={(e) => setFormData({ ...formData, presale_stage5_price: parseFloat(e.target.value) || 0 })}
                    className="cosmic-input h-12"
                    placeholder="0.005"
                  />
                </div>
                
                <div className="space-y-3">
                  <Label htmlFor="public_price" className="text-white font-medium">Public Sale Price</Label>
                  <Input
                    id="public_price"
                    type="number"
                    step="0.001"
                    value={formData.public_sale_price}
                    onChange={(e) => setFormData({ ...formData, public_sale_price: parseFloat(e.target.value) || 0 })}
                    className="cosmic-input h-12"
                    placeholder="0.01"
                  />
                </div>
              </div>
            </div>

            {/* Token Distribution Preview */}
            <div className="space-y-4">
              <Label className="text-white font-medium">Token Distribution Preview</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-4 bg-card/30 rounded-lg">
                <div className="space-y-1">
                  <p className="text-muted-foreground text-sm">Team (15%)</p>
                  <p className="text-primary font-bold">{distribution.team.toLocaleString()}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-muted-foreground text-sm">Presale (30%)</p>
                  <p className="text-primary font-bold">{distribution.presale.toLocaleString()}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-muted-foreground text-sm">Liquidity (20%)</p>
                  <p className="text-primary font-bold">{distribution.liquidity.toLocaleString()}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-muted-foreground text-sm">Marketing (10%)</p>
                  <p className="text-primary font-bold">{distribution.marketing.toLocaleString()}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-muted-foreground text-sm">Reserve (15%)</p>
                  <p className="text-primary font-bold">{distribution.reserve.toLocaleString()}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-muted-foreground text-sm">Community (10%)</p>
                  <p className="text-primary font-bold">{distribution.community.toLocaleString()}</p>
                </div>
              </div>
            </div>

            {/* Active Toggle */}
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="is_active"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                className="w-4 h-4 text-primary bg-card border-border rounded focus:ring-primary focus:ring-2"
              />
              <Label htmlFor="is_active" className="text-white font-medium">
                Activate tokenomics
              </Label>
            </div>

            {/* Save Button */}
            <div className="flex gap-4 pt-4">
              <Button
                onClick={handleSave}
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
                    Save Tokenomics
                  </>
                )}
              </Button>
              
              <Button
                onClick={loadTokenomics}
                variant="outline"
                className="border-primary/30 text-white hover:bg-primary/10 hover:border-primary/50 smooth-transition h-12"
              >
                <DollarSign className="w-5 h-5 mr-2" />
                Refresh
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


