// API Configuration
const API_BASE_URL = 'https://hieland-roman-nonmonistically.ngrok-free.dev';

// Token management
let authToken: string | null = localStorage.getItem('mototrackr_token');

export const setAuthToken = (token: string | null) => {
  authToken = token;
  if (token) {
    localStorage.setItem('mototrackr_token', token);
  } else {
    localStorage.removeItem('mototrackr_token');
  }
};

export const getAuthToken = () => authToken;

// Headers helper
const getHeaders = (includeAuth = true, isFormData = false) => {
  const headers: Record<string, string> = {
    'ngrok-skip-browser-warning': 'true', // Skip ngrok warning page
  };
  
  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }
  
  if (includeAuth && authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }
  
  return headers;
};

// Generic fetch wrapper with error handling
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {},
  includeAuth = true
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const response = await fetch(url, {
    ...options,
    headers: {
      ...getHeaders(includeAuth, options.body instanceof FormData),
      ...options.headers,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || `API Error: ${response.status}`);
  }

  // Handle empty responses
  const text = await response.text();
  if (!text) return {} as T;
  
  return JSON.parse(text);
}

// ==================== AUTH API ====================

export interface TokenResponse {
  access_token: string;
  token_type: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: 'customer' | 'mechanic' | 'admin';
}

export interface UserCreate {
  name: string;
  email: string;
  role: 'customer' | 'mechanic' | 'admin';
  password: string;
}

export const authAPI = {
  // Login with username/password
  async login(username: string, password: string): Promise<TokenResponse> {
    const formData = new URLSearchParams();
    formData.append('username', username);
    formData.append('password', password);
    formData.append('grant_type', 'password');

    const response = await fetch(`${API_BASE_URL}/api/v1/auth/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'ngrok-skip-browser-warning': 'true',
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.detail || 'Login failed');
    }

    const data = await response.json();
    setAuthToken(data.access_token);
    return data;
  },

  // Logout
  logout() {
    setAuthToken(null);
  },

  // Get current user
  async getCurrentUser(): Promise<User> {
    return apiRequest<User>('/api/v1/auth/users/me');
  },

  // List all users (admin)
  async listUsers(): Promise<User[]> {
    return apiRequest<User[]>('/api/v1/auth/users');
  },

  // Create new user
  async createUser(userData: UserCreate): Promise<User> {
    return apiRequest<User>('/api/v1/auth/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  // Get mechanic dashboard
  async getMechanicDashboard(): Promise<string> {
    return apiRequest<string>('/api/v1/auth/mechanic/dashboard');
  },

  // Get customer dashboard
  async getCustomerDashboard(): Promise<string> {
    return apiRequest<string>('/api/v1/auth/customer/dashboard');
  },
};

// ==================== SPARE PARTS API ====================

export interface SparePart {
  id: number;
  name: string;
  description: string;
  price: number;
  quantity_in_stock: number;
  sku: string;
  category: string;
  minimum_stock_level: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface SparePartCreate {
  name: string;
  description: string;
  price: number;
  quantity_in_stock: number;
  sku: string;
  category: string;
  minimum_stock_level?: number;
  is_active?: boolean;
}

export interface SparePartListResponse {
  items: SparePart[];
  total: number;
  page: number;
  size: number;
  total_pages: number;
}

export interface LowStockAlert {
  spare_part: SparePart;
  current_stock: number;
  minimum_level: number;
  needs_reorder: boolean;
}

export interface SparePartFilters {
  skip?: number;
  limit?: number;
  search?: string;
  category?: string;
  min_price?: number;
  max_price?: number;
  low_stock_only?: boolean;
}

export const sparePartsAPI = {
  // Get all spare parts with filters
  async getAll(filters: SparePartFilters = {}): Promise<SparePartListResponse> {
    const params = new URLSearchParams();
    if (filters.skip !== undefined) params.append('skip', filters.skip.toString());
    if (filters.limit !== undefined) params.append('limit', filters.limit.toString());
    if (filters.search) params.append('search', filters.search);
    if (filters.category) params.append('category', filters.category);
    if (filters.min_price !== undefined) params.append('min_price', filters.min_price.toString());
    if (filters.max_price !== undefined) params.append('max_price', filters.max_price.toString());
    if (filters.low_stock_only) params.append('low_stock_only', 'true');

    const queryString = params.toString();
    return apiRequest<SparePartListResponse>(
      `/api/v1/spare_parts/${queryString ? `?${queryString}` : ''}`
    );
  },

  // Get spare part by ID
  async getById(id: number): Promise<SparePart> {
    return apiRequest<SparePart>(`/api/v1/spare_parts/${id}`);
  },

  // Get spare part by SKU
  async getBySku(sku: string): Promise<SparePart> {
    return apiRequest<SparePart>(`/api/v1/spare_parts/sku/${sku}`);
  },

  // Create spare part (admin)
  async create(data: SparePartCreate): Promise<SparePart> {
    return apiRequest<SparePart>('/api/v1/spare_parts/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Update spare part (admin)
  async update(id: number, data: Partial<SparePartCreate>): Promise<SparePart> {
    return apiRequest<SparePart>(`/api/v1/spare_parts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // Delete spare part (admin)
  async delete(id: number): Promise<string> {
    return apiRequest<string>(`/api/v1/spare_parts/${id}`, {
      method: 'DELETE',
    });
  },

  // Update stock quantity
  async updateStock(id: number, quantityChange: number, reason: string): Promise<SparePart> {
    return apiRequest<SparePart>(`/api/v1/spare_parts/${id}/stock`, {
      method: 'PATCH',
      body: JSON.stringify({ quantity_change: quantityChange, reason }),
    });
  },

  // Get low stock alerts
  async getLowStockAlerts(): Promise<LowStockAlert[]> {
    return apiRequest<LowStockAlert[]>('/api/v1/spare_parts/alerts/low-stock');
  },

  // Get all categories
  async getCategories(): Promise<string[]> {
    return apiRequest<string[]>('/api/v1/spare_parts/categories/all');
  },

  // Quick search
  async quickSearch(query: string, limit = 10): Promise<SparePart[]> {
    return apiRequest<SparePart[]>(
      `/api/v1/spare_parts/search/quick?q=${encodeURIComponent(query)}&limit=${limit}`
    );
  },
};

// ==================== ROLES API ====================

export interface Role {
  id: number;
  name: string;
  description: string;
}

export interface RoleCreate {
  name: string;
  description?: string;
}

export const rolesAPI = {
  // Get all roles (admin)
  async getAll(skip = 0, limit = 100): Promise<Role[]> {
    return apiRequest<Role[]>(`/api/v1/auth/roles?skip=${skip}&limit=${limit}`);
  },

  // Get role by ID (admin)
  async getById(id: number): Promise<Role> {
    return apiRequest<Role>(`/api/v1/auth/roles/${id}`);
  },

  // Create role (admin)
  async create(data: RoleCreate): Promise<Role> {
    return apiRequest<Role>('/api/v1/auth/roles', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Update role (admin)
  async update(id: number, data: RoleCreate): Promise<Role> {
    return apiRequest<Role>(`/api/v1/auth/roles/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // Delete role (admin)
  async delete(id: number): Promise<string> {
    return apiRequest<string>(`/api/v1/auth/roles/${id}`, {
      method: 'DELETE',
    });
  },
};

// Export API base URL for reference
export { API_BASE_URL };

// ==================== JOBS API ====================

export interface JobCreate {
  customer_name: string;
  customer_phone: string;
  customer_email?: string | null;
  vehicle_name: string;
  motorcycle_numberplate: string;
  problem_description: string;
  estimated_cost?: number;
  priority?: number; // 1-4
  create_customer_account?: boolean;
}

export interface JobUpdate {
  status?: string;
  problem_description?: string;
  estimated_cost?: number;
  priority?: number;
}

export interface JobResponse {
  id: number;
  customer_name: string;
  customer_phone: string;
  motorcycle_model: string;
  plate_number: string;
  issue_type: string;
  issue_description: string;
  status: string;
  estimated_cost: number;
  estimated_pickup: string;
  entry_date: string;
  created_at: string;
  updated_at: string;
}

export interface LogEntryCreate {
  message: string;
}

export interface CostItemCreate {
  description: string;
  amount: number;
}

export const jobsAPI = {
  // Get all jobs
  async getAll(skip = 0, limit = 100): Promise<JobResponse[]> {
    return apiRequest<JobResponse[]>(`/api/v1/jobs/?skip=${skip}&limit=${limit}`);
  },

  // Get job by ID
  async getById(id: number): Promise<JobResponse> {
    return apiRequest<JobResponse>(`/api/v1/jobs/${id}`);
  },

  // Get jobs by customer phone
  async getByPhone(phone: string): Promise<JobResponse[]> {
    return apiRequest<JobResponse[]>(`/api/v1/jobs/search/by-phone?phone=${encodeURIComponent(phone)}`);
  },

  // Get job by job number
  async getByNumber(jobNumber: string): Promise<JobResponse> {
    return apiRequest<JobResponse>(`/api/v1/jobs/number/${jobNumber}`);
  },

  // Create new job
  async create(data: JobCreate): Promise<JobResponse> {
    return apiRequest<JobResponse>('/api/v1/jobs/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Update job
  async update(id: number, data: JobUpdate): Promise<JobResponse> {
    return apiRequest<JobResponse>(`/api/v1/jobs/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // Update job status
  async updateStatus(id: number, status: string): Promise<JobResponse> {
    return apiRequest<JobResponse>(`/api/v1/jobs/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },

  // Update job cost
  async updateCost(id: number, amount: number): Promise<JobResponse> {
    return apiRequest<JobResponse>(`/api/v1/jobs/${id}/cost`, {
      method: 'PATCH',
      body: JSON.stringify({ estimated_cost: amount }),
    });
  },

  // Assign mechanic to job
  async assignMechanic(id: number, mechanicId: number): Promise<JobResponse> {
    return apiRequest<JobResponse>(`/api/v1/jobs/${id}/assign`, {
      method: 'PATCH',
      body: JSON.stringify({ mechanic_id: mechanicId }),
    });
  },

  // Get job stats summary
  async getStats(): Promise<any> {
    return apiRequest<any>('/api/v1/jobs/stats/summary');
  },

  // Get current customer's jobs
  async getMyJobs(): Promise<JobResponse[]> {
    return apiRequest<JobResponse[]>('/api/v1/jobs/customer/my-jobs');
  },
};

// Note: Customers are managed as part of Jobs in the backend
// No separate customers API needed
