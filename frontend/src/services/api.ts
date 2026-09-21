const API_BASE = "";

export interface User {
  _id: string;
  name: string;
  email: string;
  zernioProfileId?: string;
  token: string;
}

export interface AuthResponse {
  _id: string;
  name: string;
  email: string;
  token: string;
  message?: string;
}

export interface ConnectedAccount {
  _id: string;
  user: string;
  platform: string;
  handle: string;
  zernioAccountId?: string;
  status: "connected" | "disconnected";
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ScheduledPost {
  _id: string;
  user: string;
  content: string;
  mediaUrl?: string;
  mediaType?: "image" | "video";
  platforms: string[];
  scheduledFor: string;
  status: "scheduled" | "draft" | "published" | "failed";
  createdAt: string;
  updatedAt: string;
}

export interface AIGeneration {
  _id: string;
  user: string;
  prompt: string;
  content: string;
  mediaUrl?: string;
  mediaType?: "image" | "video";
  tone: string;
  createdAt: string;
  updatedAt: string;
}

export interface ActivityItem {
  _id: string;
  user: string;
  actionType: "POST_PUBLISHED" | "AI_REPLY";
  description: string;
  relatedPost?: {
    _id: string;
    content: string;
  } | null;
  platform?: string;
  createdAt: string;
  updatedAt: string;
}

// Helper to make authenticated fetch requests
async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem("postly_token");

  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  // If not FormData, set JSON Content-Type
  if (!(options.body instanceof FormData) && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    if (response.status === 401) {
      // If unauthorized, clear token
      localStorage.removeItem("postly_token");
      localStorage.removeItem("postly_user");
    }
    throw new Error(data.message || `Request failed with status ${response.status}`);
  }

  return data as T;
}

export const api = {
  auth: {
    login: async (credentials: { email: string; password: string }): Promise<AuthResponse> => {
      return request<AuthResponse>("/api/auth/login", {
        method: "POST",
        body: JSON.stringify(credentials),
      });
    },
    register: async (userData: { name: string; email: string; password: string }): Promise<AuthResponse> => {
      return request<AuthResponse>("/api/auth/register", {
        method: "POST",
        body: JSON.stringify(userData),
      });
    },
  },

  accounts: {
    getAll: async (): Promise<ConnectedAccount[]> => {
      return request<ConnectedAccount[]>("/api/accounts");
    },
    getConnectUrl: async (platform: string): Promise<{ url: string }> => {
      return request<{ url: string }>(`/api/oauth/${platform}/url`);
    },
    sync: async (): Promise<{ syncedAccounts: ConnectedAccount[] }> => {
      return request<{ syncedAccounts: ConnectedAccount[] }>("/api/oauth/sync");
    },
    disconnect: async (id: string): Promise<{ message: string; account: ConnectedAccount }> => {
      return request<{ message: string; account: ConnectedAccount }>(`/api/accounts/${id}`, {
        method: "DELETE",
      });
    },
  },

  posts: {
    getAll: async (): Promise<ScheduledPost[]> => {
      return request<ScheduledPost[]>("/api/posts");
    },
    create: async (data: FormData | Record<string, any>): Promise<ScheduledPost> => {
      if (data instanceof FormData) {
        return request<ScheduledPost>("/api/posts", {
          method: "POST",
          body: data,
        });
      }
      return request<ScheduledPost>("/api/posts", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    delete: async (id: string): Promise<{ message: string; post: ScheduledPost }> => {
      return request<{ message: string; post: ScheduledPost }>(`/api/posts/${id}`, {
        method: "DELETE",
      });
    },
    generate: async (payload: {
      prompt: string;
      tone: string;
      generateImage: boolean;
    }): Promise<{ message: string; generation: AIGeneration }> => {
      return request<{ message: string; generation: AIGeneration }>("/api/posts/generate", {
        method: "POST",
        body: JSON.stringify(payload),
      });
    },
    getGenerations: async (): Promise<AIGeneration[]> => {
      return request<AIGeneration[]>("/api/posts/generations");
    },
  },

  activity: {
    getAll: async (): Promise<ActivityItem[]> => {
      return request<ActivityItem[]>("/api/activity");
    },
  },
};

