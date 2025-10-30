// Admin Dashboard API Service - Updated to use Backend API
// Replace Supabase calls with backend API calls

const API_BASE_URL = 'http://localhost:5000/api/v1';

// Helper function for API calls
const apiCall = async (endpoint: string, options: RequestInit = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const defaultOptions: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  // Merge headers properly
  const mergedOptions: RequestInit = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers,
    },
  };

  console.log('API Call:', url, mergedOptions);

  const response = await fetch(url, mergedOptions);
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error('API Error:', response.status, response.statusText, errorText);
    throw new Error(`API Error: ${response.status} ${response.statusText}`);
  }
  
  return response.json();
};

// Admin Authentication
export const adminLogin = async (email: string, password: string) => {
  return apiCall('/admin/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
};

export const createAdmin = async (token: string, adminData: {
  name: string;
  email: string;
  password: string;
  role?: string;
  permissions?: string[];
}) => {
  return apiCall('/admin/create', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(adminData),
  });
};

export const getAllAdmins = async (token: string) => {
  return apiCall('/admin/all', {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
};

// Dashboard Statistics
export const getDashboardStats = async (token: string) => {
  return apiCall('/admin/dashboard/stats', {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
};

export const getAnalytics = async (token: string, startDate?: string, endDate?: string) => {
  const params = new URLSearchParams();
  if (startDate) params.append('startDate', startDate);
  if (endDate) params.append('endDate', endDate);
  
  return apiCall(`/admin/analytics/overview?${params.toString()}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
};

// Presale Management
export const getPresaleStatus = async () => {
  return apiCall('/presale/status');
};

export const updatePresaleStage = async (token: string, stage: number) => {
  return apiCall('/admin/presale/update-stage', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ stage }),
  });
};

export const updatePresalePrice = async (token: string, stage: number, price: number) => {
  return apiCall('/admin/presale/update-price', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ stage, price }),
  });
};

export const updatePresaleSettings = async (token: string, settings: {
  minPurchase?: number;
  maxPurchase?: number;
  hardCap?: number;
  startDate?: string;
  endDate?: string;
}) => {
  return apiCall('/admin/presale/update-settings', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(settings),
  });
};

export const togglePresaleStatus = async (token: string, isActive: boolean) => {
  return apiCall('/admin/presale/toggle-status', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ isActive }),
  });
};

// Participant Management
export const getParticipants = async (token: string, page = 1, limit = 50) => {
  return apiCall(`/admin/participants?page=${page}&limit=${limit}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
};

export const getParticipantDetails = async (token: string, walletAddress: string) => {
  return apiCall(`/admin/participants/${walletAddress}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
};

export const searchParticipants = async (token: string, query: string) => {
  return apiCall(`/admin/participants/search?q=${encodeURIComponent(query)}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
};

// Transaction Management
export const getTransactions = async (token: string, page = 1, limit = 50) => {
  return apiCall(`/admin/transactions?page=${page}&limit=${limit}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
};

// Simple transaction log (walletid, chain, amount, created_at)
export const getTxLog = async (token: string, page = 1, limit = 50) => {
  return apiCall(`/admin/transaction?page=${page}&limit=${limit}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
};

export const getTransactionDetails = async (token: string, txHash: string) => {
  return apiCall(`/admin/transactions/${txHash}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
};

export const searchTransactions = async (token: string, query: string) => {
  return apiCall(`/admin/transactions/search?q=${encodeURIComponent(query)}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
};

// Newsletter Management
export const getNewsletterSubscribers = async (token: string, page = 1, limit = 50) => {
  return apiCall(`/admin/newsletter/subscribers?page=${page}&limit=${limit}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
};

export const exportNewsletterSubscribers = async (token: string) => {
  return apiCall('/admin/newsletter/export', {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
};

// Countdown Timer Management
export const getCountdownSettings = async (token: string) => {
  return apiCall('/admin/countdown', {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
};

export const updateCountdownSettings = async (token: string, settings: {
  target_date: string;
  title?: string;
  description?: string;
  is_active?: boolean;
}) => {
  console.log('=== API CALL DEBUG ===');
  console.log('Token received:', token ? `${token.substring(0, 20)}...` : 'null');
  console.log('Settings:', settings);
  console.log('Authorization header:', `Bearer ${token}`);
  
  return apiCall('/admin/countdown', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(settings),
  });
};

export const refreshAdminToken = async (email: string, password: string) => {
  return apiCall('/admin/refresh-token', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
};

// Live Stats Management
export const getLiveStats = async (token: string) => {
  return apiCall('/admin/live-stats', {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
};

export const updateLiveStats = async (token: string, stats: {
  participants: number;
  raised_amount: number;
  tokens_allocated: string;
  days_to_launch: number;
  is_active?: boolean;
}) => {
  return apiCall('/admin/live-stats', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(stats),
  });
};

// Tokenomics Management
export const getTokenomics = async (token: string) => {
  return apiCall('/admin/tokenomics', {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
};

export const updateTokenomics = async (token: string, tokenomics: {
  total_supply: number;
  presale_stage1_price: number;
  presale_stage2_price: number;
  presale_stage3_price: number;
  presale_stage4_price: number;
  presale_stage5_price: number;
  public_sale_price: number;
  is_active?: boolean;
}) => {
  return apiCall('/admin/tokenomics', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(tokenomics),
  });
};

// Export default for backward compatibility
export default {
  adminLogin,
  createAdmin,
  getAllAdmins,
  getDashboardStats,
  getAnalytics,
  getPresaleStatus,
  updatePresaleStage,
  updatePresalePrice,
  updatePresaleSettings,
  togglePresaleStatus,
  getParticipants,
  getParticipantDetails,
  searchParticipants,
  getTransactions,
  getTransactionDetails,
  searchTransactions,
  getNewsletterSubscribers,
  exportNewsletterSubscribers,
  getCountdownSettings,
  updateCountdownSettings,
};
