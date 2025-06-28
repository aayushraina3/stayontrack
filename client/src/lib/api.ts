import axios from "axios";
import type {
  PlanningRequest,
  MotivationRequest,
  BlockerRequest,
  InsightsRequest,
  FeedbackRequest,
  Goal,
  UserProfile,
  Task,
  WorkSession,
  DailyCheckinData,
  AgentInteraction,
} from "@/types";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE || "http://localhost:4000";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    // Note: For proper Clerk integration, tokens should be retrieved using useAuth hook
    // This is a fallback for client-side requests
    if (typeof window !== "undefined") {
      // Try different possible Clerk token storage locations
      const token =
        localStorage.getItem("clerk-db-jwt") ||
        localStorage.getItem("__clerk_db_jwt") ||
        localStorage.getItem("clerk-token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Error Details:", {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      url: error.config?.url,
      method: error.config?.method,
      message: error.message,
    });

    // Handle different error types
    if (error.response?.status === 401) {
      console.warn("Authentication failed - redirecting to sign in");
      // Could trigger a redirect to sign-in page here
    } else if (error.response?.status >= 500) {
      console.error("Server error details:", error.response?.data);
    }

    return Promise.reject(error);
  },
);

// Agent API calls - Updated to match backend endpoints
const agentApi = {
  // Planner Agent - POST /api/agents/planner
  generatePlan: async (request: PlanningRequest) => {
    const response = await api.post("/api/agents/planner", request);
    return response.data;
  },

  // Motivator Agent - POST /api/agents/motivator
  getMotivation: async (request: MotivationRequest) => {
    const response = await api.post("/api/agents/motivator", request);
    return response.data;
  },

  // Blocker Agent - POST /api/agents/blocker
  activateBlocker: async (request: BlockerRequest) => {
    const response = await api.post("/api/agents/blocker", request);
    return response.data;
  },

  // Observer Agent - POST /api/agents/observer
  getInsights: async (request: InsightsRequest) => {
    const response = await api.post("/api/agents/observer", request);
    return response.data;
  },

  // Submit feedback - POST /api/sessions/{sessionId}/feedback
  submitFeedback: async (feedback: FeedbackRequest) => {
    const response = await api.post(
      `/api/sessions/${feedback.sessionId}/feedback`,
      {
        feeling: feedback.feeling || "okay",
        helpfulFactors: feedback.helpfulFactors || [],
        notes: feedback.notes || undefined,
      },
    );
    return response.data;
  },

  // Health check - GET /api/agents/health
  healthCheck: async () => {
    const response = await api.get("/api/agents/health");
    return response.data;
  },
};

// User API calls - Updated to match backend endpoints
const userApi = {
  // User profile management
  createUser: async (user: Partial<UserProfile>) => {
    const response = await api.post("/api/users", user);
    return response.data;
  },

  getUserProfile: async (userId: string) => {
    const response = await api.get(`/api/users/${userId}`);
    return response.data;
  },

  updateUserProfile: async (userId: string, updates: Partial<UserProfile>) => {
    const response = await api.put(`/api/users/${userId}`, updates);
    return response.data;
  },

  // Goals endpoints
  createGoal: async (goal: Goal) => {
    const response = await api.post("/api/goals", goal);
    return response.data.data || response.data; // Handle both {success, data} and direct responses
  },

  updateGoal: async (id: string, updates: Partial<Goal>) => {
    const response = await api.put(`/api/goals/${id}`, updates);
    return response.data.data || response.data; // Handle both {success, data} and direct responses
  },

  deleteGoal: async (id: string) => {
    const response = await api.delete(`/api/goals/${id}`);
    return response.data;
  },

  getUserGoals: async (userId: string) => {
    const response = await api.get(`/api/goals/user/${userId}`);
    return response.data.data || response.data; // Handle both {success, data} and direct array responses
  },

  // Tasks endpoints - Fixed to match backend
  createTask: async (task: Partial<Task>) => {
    const response = await api.post("/api/tasks", task);
    return response.data;
  },

  getTask: async (id: string) => {
    const response = await api.get(`/api/tasks/${id}`);
    return response.data;
  },

  updateTask: async (id: string, updates: Partial<Task>) => {
    const response = await api.put(`/api/tasks/${id}`, updates);
    return response.data;
  },

  deleteTask: async (id: string) => {
    const response = await api.delete(`/api/tasks/${id}`);
    return response.data;
  },

  getUserTasks: async (userId: string) => {
    const response = await api.get(`/api/tasks?userId=${userId}`);
    return response.data;
  },

  getGoalTasks: async (goalId: string) => {
    const response = await api.get(`/api/tasks/goal/${goalId}`);
    return response.data;
  },

  // Sessions endpoints - Fixed to match backend
  createSession: async (session: Partial<WorkSession>) => {
    const response = await api.post("/api/sessions/start", session);
    return response.data;
  },

  updateSession: async (id: string, updates: Partial<WorkSession>) => {
    const response = await api.patch(`/api/sessions/${id}`, updates);
    return response.data;
  },

  getUserSessions: async (userId: string) => {
    const response = await api.get(`/api/sessions/user/${userId}`);
    return response.data;
  },

  // Daily checkin
  storeCheckin: async (userId: string, checkinData: DailyCheckinData) => {
    const response = await api.post(
      `/api/users/${userId}/checkin`,
      checkinData,
    );
    return response.data;
  },
};

// Session API calls
const sessionApi = {
  // Start a new work session
  startSession: async (taskId: string) => {
    const response = await api.post("/api/sessions/start", { taskId });
    return response.data;
  },

  // End a work session
  endSession: async (sessionId: string, sessionData: Partial<WorkSession>) => {
    const response = await api.post(
      `/api/sessions/${sessionId}/end`,
      sessionData,
    );
    return response.data;
  },

  // Update session progress
  updateSession: async (sessionId: string, updates: Partial<WorkSession>) => {
    const response = await api.put(`/api/sessions/${sessionId}`, updates);
    return response.data;
  },

  // Get user sessions
  getUserSessions: async (userId: string) => {
    const response = await api.get(`/api/sessions/user/${userId}`);
    return response.data;
  },

  // Add agent interaction to session
  addAgentInteraction: async (
    sessionId: string,
    interaction: Partial<AgentInteraction>,
  ) => {
    const response = await api.post(
      `/api/sessions/${sessionId}/agent-interaction`,
      interaction,
    );
    return response.data;
  },
};

// Export everything
export { agentApi, userApi, sessionApi, api };
