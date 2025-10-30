import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface AdminUser {
  id: string | number;
  name: string;
  email: string;
  role: string;
  permissions: string[];
  isActive: boolean;
}

interface AuthContextType {
  user: AdminUser | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (token: string, user: AdminUser) => void;
  logout: () => void;
  refreshToken: () => Promise<boolean>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for stored authentication on mount
    console.log('AuthContext: Checking for stored authentication...');
    const storedToken = localStorage.getItem('adminToken');
    const storedUser = localStorage.getItem('adminUser');

    console.log('Stored token:', storedToken ? `Found: ${storedToken.substring(0, 20)}...` : 'Not found');
    console.log('Stored user:', storedUser ? 'Found' : 'Not found');

    if (storedToken && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        console.log('Setting stored auth state:', { token: storedToken.substring(0, 20) + '...', user: parsedUser });
        setToken(storedToken);
        setUser(parsedUser);
      } catch (error) {
        console.error('Error parsing stored user data:', error);
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
      }
    }
    
    setIsLoading(false);
    console.log('AuthContext initialization complete');
  }, []);

  const login = (newToken: string, newUser: AdminUser) => {
    console.log('AuthContext login called with:', { token: newToken, user: newUser });
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem('adminToken', newToken);
    localStorage.setItem('adminUser', JSON.stringify(newUser));
    console.log('Auth state updated:', { token: newToken, user: newUser, isAuthenticated: true });
    console.log('Token stored in localStorage:', localStorage.getItem('adminToken'));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
  };

  const refreshToken = async () => {
    console.log('AuthContext: Attempting to refresh token...');
    const storedUser = localStorage.getItem('adminUser');
    if (!storedUser) {
      console.log('AuthContext: No stored user found for token refresh');
      return false;
    }

    try {
      const userData = JSON.parse(storedUser);
      const { refreshAdminToken } = await import('../lib/api');
      
      // For now, we'll use the default admin credentials
      // In a real app, you might store these securely or prompt the user
      const response = await refreshAdminToken('admin@memechain.com', 'Admin@123456');
      
      if (response.success) {
        console.log('AuthContext: Token refreshed successfully');
        setToken(response.token);
        setUser(response.admin);
        localStorage.setItem('adminToken', response.token);
        localStorage.setItem('adminUser', JSON.stringify(response.admin));
        return true;
      }
    } catch (error) {
      console.error('AuthContext: Token refresh failed:', error);
    }
    
    return false;
  };

  const isAuthenticated = !!token && !!user;

  return (
    <AuthContext.Provider value={{
      user,
      token,
      isAuthenticated,
      login,
      logout,
      refreshToken,
      isLoading
    }}>
      {children}
    </AuthContext.Provider>
  );
};
