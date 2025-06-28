import { create } from "zustand";
import { userApi, sessionApi } from "@/lib/api";
import type {
  UserProfile,
  Goal,
  Task,
  TaskWithGoal,
  FocusSession,
  AgentType,
  WorkSession,
  DailyCheckinData,
} from "@/types";

interface AppState {
  // User data
  userProfile: UserProfile | null;
  goals: Goal[];
  tasks: Task[];
  sessions: WorkSession[]; // Store work sessions data
  currentTask: TaskWithGoal | null;
  focusSession: FocusSession | null;

  // UI state
  isOnboarding: boolean;
  onboardingStep: number;
  lastCheckin: string | null;

  // Agent states
  plannerActive: boolean;
  motivatorActive: boolean;
  blockerActive: boolean;
  observerActive: boolean;

  // Loading states
  isLoading: boolean;
  error: string | null;
  userProfileAttempted: boolean; // Track if we've already tried to create a user profile
}

interface AppActions {
  // Helper methods for separated task/goal architecture
  getTasksForGoal: (goalId: string) => Task[];
  loadTasksForGoal: (goalId: string) => Promise<Task[]>;

  // User Profile
  setUserProfile: (profile: UserProfile) => void;
  loadUserProfile: (userId: string) => Promise<void>;
  createUserProfile: (userData: Partial<UserProfile>) => Promise<void>;
  updateUserProfile: (
    userId: string,
    updates: Partial<UserProfile>,
  ) => Promise<void>;
  resetUserProfileAttempt: () => void;

  // Goals
  addGoal: (goal: Goal) => Promise<void>;
  updateGoal: (id: string, updates: Partial<Goal>) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;
  loadUserGoals: (userId: string) => Promise<void>;

  // Tasks
  setCurrentTask: (task: TaskWithGoal | null) => void;
  updateTask: (
    goalId: string,
    taskId: string,
    updates: Partial<Task>,
  ) => Promise<void>;
  addTask: (goalId: string, task: Task) => Promise<void>;
  deleteTask: (goalId: string, taskId: string) => Promise<void>;
  loadUserTasks: (userId: string) => Promise<void>;

  // Focus Sessions
  startFocusSession: (taskId: string, userId: string) => Promise<void>;
  endFocusSession: (
    focusScore: number,
    distractions: string[],
  ) => Promise<void>;
  pauseFocusSession: () => void;
  resumeFocusSession: () => void;
  loadUserSessions: (userId: string) => Promise<void>;

  // Onboarding
  setOnboardingStep: (step: number) => void;
  completeOnboarding: () => void;
  setIsOnboarding: (isOnboarding: boolean) => void;

  // UI state
  setLastCheckin: (date: string) => void;
  storeCheckin: (
    userId: string,
    checkinData: DailyCheckinData,
  ) => Promise<void>;

  // Agents
  activateAgent: (agent: AgentType, active: boolean) => void;

  // Error handling
  setError: (error: string | null) => void;
  setLoading: (loading: boolean) => void;
}

type AppStore = AppState & AppActions;

export const useAppStore = create<AppStore>()((set, get) => ({
  // Initial state
  userProfile: null,
  goals: [],
  tasks: [],
  sessions: [],
  currentTask: null,
  focusSession: null,
  isOnboarding: true,
  onboardingStep: 0,
  lastCheckin: null,
  plannerActive: false,
  motivatorActive: false,
  blockerActive: false,
  observerActive: false,
  isLoading: false,
  error: null,
  userProfileAttempted: false,

  // Helper methods for separated task/goal architecture
  getTasksForGoal: (goalId: string) => {
    const state = get();
    return state.tasks.filter((task) => task.goalId === goalId);
  },

  loadTasksForGoal: async (goalId: string) => {
    try {
      const tasksData = await userApi.getGoalTasks(goalId);
      const tasks = Array.isArray(tasksData) ? tasksData : [];

      set((state) => ({
        tasks: [
          ...state.tasks.filter((t) => t.goalId !== goalId), // Remove existing tasks for this goal
          ...tasks, // Add new tasks
        ],
      }));

      return tasks;
    } catch (error) {
      console.error("Error loading tasks for goal:", error);
      set({
        error: error instanceof Error ? error.message : "Failed to load tasks",
      });
      return [];
    }
  },

  // Helper actions
  setError: (error) => set({ error }),
  setLoading: (loading) => set({ isLoading: loading }),

  // User Profile
  setUserProfile: (profile) => set({ userProfile: profile }),

  resetUserProfileAttempt: () => set({ userProfileAttempted: false }),

  createUserProfile: async (userData) => {
    console.log("Creating user profile with data:", userData);
    set({ isLoading: true, error: null, userProfileAttempted: true });
    try {
      const createdUser = await userApi.createUser(userData);
      console.log("User profile created successfully:", createdUser);

      // When user profile is created, onboarding should be complete
      const isOnboarding = !createdUser?.onboardingComplete;

      set({
        userProfile: createdUser,
        isOnboarding,
        isLoading: false,
      });
    } catch (error) {
      console.error("Failed to create user profile:", error);
      if (error instanceof Error) {
        const axiosError = error as {
          response?: { status?: number; data?: unknown };
        };
        console.error("Error details:", {
          message: error.message,
          status: axiosError.response?.status,
          data: axiosError.response?.data,
        });
      }
      set({
        error: "Failed to create user profile",
        isLoading: false,
      });
    }
  },

  loadUserProfile: async (userId) => {
    console.log("Loading user profile for userId:", userId);
    set({ isLoading: true, error: null });
    try {
      const userProfile = await userApi.getUserProfile(userId);
      console.log("User profile loaded successfully:", userProfile);

      // Update isOnboarding based on user's onboardingComplete flag
      const isOnboarding = !userProfile?.onboardingComplete;

      set({
        userProfile,
        isOnboarding,
        isLoading: false,
      });
    } catch (error) {
      console.error("Failed to load user profile:", error);
      // User might not exist yet, this is normal for new users
      // Make sure userProfile is set to null so the create logic can trigger
      set({
        userProfile: null,
        isOnboarding: true, // New users need onboarding
        isLoading: false,
      });
    }
  },

  updateUserProfile: async (userId, updates) => {
    set({ isLoading: true, error: null });
    try {
      const updatedUser = await userApi.updateUserProfile(userId, updates);
      set({ userProfile: updatedUser, isLoading: false });
    } catch (error) {
      console.error("Failed to update user profile:", error);
      set({
        error: "Failed to update user profile",
        isLoading: false,
      });
    }
  },

  // Goals with API integration
  addGoal: async (goal) => {
    console.log("Adding goal:", goal);
    set({ isLoading: true, error: null });
    try {
      const savedGoal = await userApi.createGoal(goal);
      console.log("Goal saved to API:", savedGoal);

      // Validate the saved goal structure
      const validatedGoal = {
        ...savedGoal,
        taskIds: Array.isArray(savedGoal.taskIds) ? savedGoal.taskIds : [],
        progress:
          typeof savedGoal.progress === "number" ? savedGoal.progress : 0,
        completed:
          typeof savedGoal.completed === "boolean"
            ? savedGoal.completed
            : false,
      };

      console.log("Adding validated goal to state:", validatedGoal);
      set((state) => {
        const newGoals = Array.isArray(state.goals)
          ? [...state.goals, validatedGoal]
          : [validatedGoal];
        console.log("New goals state:", newGoals);
        return {
          goals: newGoals,
          isLoading: false,
        };
      });
    } catch (error) {
      console.error("Failed to create goal:", error);
      set({
        error: "Failed to create goal",
        isLoading: false,
      });
      // Fallback to local state for offline functionality
      const fallbackGoal = {
        ...goal,
        taskIds: Array.isArray(goal.taskIds) ? goal.taskIds : [],
        progress: typeof goal.progress === "number" ? goal.progress : 0,
        completed: typeof goal.completed === "boolean" ? goal.completed : false,
      };
      console.log("Using fallback goal:", fallbackGoal);
      set((state) => ({
        goals: Array.isArray(state.goals)
          ? [...state.goals, fallbackGoal]
          : [fallbackGoal],
      }));
    }
  },

  updateGoal: async (id, updates) => {
    set({ isLoading: true, error: null });
    try {
      const updatedGoal = await userApi.updateGoal(id, updates);

      // Validate the updated goal structure
      const validatedGoal = {
        ...updatedGoal,
        taskIds: Array.isArray(updatedGoal.taskIds) ? updatedGoal.taskIds : [],
        progress:
          typeof updatedGoal.progress === "number" ? updatedGoal.progress : 0,
        completed:
          typeof updatedGoal.completed === "boolean"
            ? updatedGoal.completed
            : false,
      };

      set((state) => {
        const currentGoals = Array.isArray(state.goals) ? state.goals : [];
        return {
          goals: currentGoals.map((goal) =>
            goal.id === id ? { ...goal, ...validatedGoal } : goal,
          ),
          isLoading: false,
        };
      });
    } catch (error) {
      console.error("Failed to update goal:", error);
      set({
        error: "Failed to update goal",
        isLoading: false,
      });
      // Fallback to local update
      set((state) => {
        const currentGoals = Array.isArray(state.goals) ? state.goals : [];
        return {
          goals: currentGoals.map((goal) =>
            goal.id === id ? { ...goal, ...updates } : goal,
          ),
        };
      });
    }
  },

  deleteGoal: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await userApi.deleteGoal(id);
      set((state) => {
        const currentGoals = Array.isArray(state.goals) ? state.goals : [];
        return {
          goals: currentGoals.filter((goal) => goal.id !== id),
          isLoading: false,
        };
      });
    } catch (error) {
      console.error("Failed to delete goal:", error);
      set({
        error: "Failed to delete goal",
        isLoading: false,
      });
    }
  },

  loadUserGoals: async (userId) => {
    console.log("Loading user goals for userId:", userId);
    set({ isLoading: true, error: null });
    try {
      const goalsResponse = await userApi.getUserGoals(userId);
      console.log("Raw goals response:", goalsResponse);

      // Ensure goals is always an array and each goal has required properties
      const goals = Array.isArray(goalsResponse) ? goalsResponse : [];
      console.log("Goals array length:", goals.length);

      const validatedGoals = goals.map(
        (goal: Partial<Goal> & { id: string }): Goal => ({
          id: goal.id,
          title: goal.title || "Untitled Goal",
          description: goal.description || "",
          category: goal.category || "personal",
          deadline: goal.deadline || new Date().toISOString(),
          priority: goal.priority || "medium",
          status: goal.status || "active",
          completed:
            typeof goal.completed === "boolean" ? goal.completed : false,
          progress: typeof goal.progress === "number" ? goal.progress : 0,
          taskIds: Array.isArray(goal.taskIds) ? goal.taskIds : [],
          createdAt: goal.createdAt || new Date().toISOString(),
        }),
      );

      console.log("Validated goals:", validatedGoals);
      set({ goals: validatedGoals, isLoading: false });
    } catch (error) {
      console.error("Failed to load goals:", error);
      set({
        goals: [], // Ensure goals is always an array even on error
        error: "Failed to load goals",
        isLoading: false,
      });
    }
  },

  // Tasks with API integration
  setCurrentTask: (task) => set({ currentTask: task }),

  addTask: async (goalId, task) => {
    set({ isLoading: true, error: null });
    try {
      // Get current user profile to extract userId
      const { userProfile } = useAppStore.getState();
      if (!userProfile?.id) {
        throw new Error("User ID not available");
      }

      // Prepare task data for backend - remove dependencies field if it exists and add userId
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { dependencies, ...taskPayload } = task as Task & {
        dependencies?: unknown;
      };
      const cleanTaskPayload = {
        ...taskPayload,
        goalId,
        userId: userProfile.id,
      };

      const savedTask = await userApi.createTask(cleanTaskPayload);

      // Add task to tasks array and task ID to goal's taskIds
      set((state) => ({
        tasks: [...state.tasks, savedTask],
        goals: state.goals.map((goal) =>
          goal.id === goalId
            ? { ...goal, taskIds: [...goal.taskIds, savedTask.id] }
            : goal,
        ),
        isLoading: false,
      }));
    } catch (error) {
      console.error("Failed to create task:", error);
      set({
        error: "Failed to create task",
        isLoading: false,
      });
      // Fallback to local state
      const taskWithId = { ...task, id: task.id || Date.now().toString() };
      set((state) => ({
        tasks: [...state.tasks, taskWithId],
        goals: state.goals.map((goal) =>
          goal.id === goalId
            ? { ...goal, taskIds: [...goal.taskIds, taskWithId.id] }
            : goal,
        ),
      }));
    }
  },

  updateTask: async (goalId, taskId, updates) => {
    set({ isLoading: true, error: null });
    try {
      // Add completedAt timestamp if task is being completed
      if (updates.completed === true) {
        updates.completedAt = new Date().toISOString();
      }

      const updatedTask = await userApi.updateTask(taskId, updates);
      set((state) => {
        // Update task in tasks array
        const updatedTasks = state.tasks.map((task) =>
          task.id === taskId ? { ...task, ...updatedTask } : task,
        );

        // Calculate goal progress
        const goalTasks = updatedTasks.filter((t) => t.goalId === goalId);
        const completedTasks = goalTasks.filter((t) => t.completed);
        const progress =
          goalTasks.length > 0
            ? Math.round((completedTasks.length / goalTasks.length) * 100)
            : 0;

        // Update goal progress
        const updatedGoals = state.goals.map((goal) =>
          goal.id === goalId
            ? { ...goal, progress, completed: progress === 100 }
            : goal,
        );

        // Update user profile task completion count if task was just completed
        const updatedUserProfile =
          updates.completed === true && state.userProfile
            ? {
                ...state.userProfile,
                productivity: {
                  ...state.userProfile.productivity,
                  tasksCompleted:
                    state.userProfile.productivity.tasksCompleted + 1,
                  completionRate:
                    (updatedTasks.filter((t) => t.completed).length /
                      updatedTasks.length) *
                    100,
                },
              }
            : state.userProfile;

        return {
          tasks: updatedTasks,
          goals: updatedGoals,
          userProfile: updatedUserProfile,
          isLoading: false,
        };
      });
    } catch (error) {
      console.error("Failed to update task:", error);
      set({
        error: "Failed to update task",
        isLoading: false,
      });
    }
  },

  deleteTask: async (goalId, taskId) => {
    set({ isLoading: true, error: null });
    try {
      await userApi.deleteTask(taskId);
      set((state) => {
        // Remove task from tasks array
        const updatedTasks = state.tasks.filter((task) => task.id !== taskId);

        // Remove task ID from goal's taskIds and recalculate progress
        const goalTasks = updatedTasks.filter((t) => t.goalId === goalId);
        const completedTasks = goalTasks.filter((t) => t.completed);
        const progress =
          goalTasks.length > 0
            ? Math.round((completedTasks.length / goalTasks.length) * 100)
            : 0;

        const updatedGoals = state.goals.map((goal) =>
          goal.id === goalId
            ? {
                ...goal,
                taskIds: goal.taskIds.filter((id) => id !== taskId),
                progress,
                completed: progress === 100,
              }
            : goal,
        );

        return {
          tasks: updatedTasks,
          goals: updatedGoals,
          isLoading: false,
        };
      });
    } catch (error) {
      console.error("Failed to delete task:", error);
      set({
        error: "Failed to delete task",
        isLoading: false,
      });
    }
  },

  loadUserTasks: async (userId) => {
    set({ isLoading: true, error: null });
    try {
      const tasks = await userApi.getUserTasks(userId);

      set(() => ({
        tasks: Array.isArray(tasks) ? tasks : [],
        isLoading: false,
      }));
    } catch (error) {
      console.error("Failed to load tasks:", error);
      set({
        error: "Failed to load tasks",
        isLoading: false,
      });
    }
  },

  // Focus Sessions with API integration
  startFocusSession: async (taskId, userId) => {
    set({ isLoading: true, error: null });
    try {
      // Find the task to get its title
      const state = get();
      const task = state.tasks.find((t) => t.id === taskId);

      const sessionData = {
        taskId,
        userId, // Use the provided userId (from Clerk)
        taskTitle: task?.title || "Focus Session",
      };

      const session = await userApi.createSession(sessionData);

      set({
        focusSession: {
          id: session.id,
          taskId,
          startTime: new Date().toISOString(),
          duration: 0,
          paused: false,
          completed: false,
          pausedDuration: 0,
          isBackendSession: true, // Successfully created in backend
        },
        isLoading: false,
      });
    } catch (error) {
      console.error("Failed to start session:", error);
      set({
        error: "Failed to start session",
        isLoading: false,
      });
      // Fallback to local session
      set({
        focusSession: {
          id: `session_${Date.now()}`,
          taskId,
          startTime: new Date().toISOString(),
          duration: 0,
          paused: false,
          completed: false,
          pausedDuration: 0,
          isBackendSession: false, // Local fallback session
        },
      });
    }
  },

  endFocusSession: async (focusScore, distractions) => {
    const session = get().focusSession;
    const state = get();
    if (!session) return;

    set({ isLoading: true, error: null });
    try {
      // Prepare session data according to EndSessionDto
      const sessionData = {
        focusScore: Math.max(0, Math.min(100, focusScore)), // Ensure 0-100 range
        notes:
          distractions.length > 0
            ? `Distractions: ${distractions.join(", ")}`
            : undefined,
        interruptions: distractions.length,
      };

      await sessionApi.endSession(session.id, sessionData);

      // Update local sessions array with the completed session
      set((prevState) => {
        const completedSession: WorkSession = {
          id: session.id,
          taskId: session.taskId,
          startTime: new Date(session.startTime),
          endTime: new Date(),
          duration: Math.floor(
            (new Date().getTime() - new Date(session.startTime).getTime()) /
              1000,
          ),
          focusScore: sessionData.focusScore,
          interruptions: distractions.length,
          notes: sessionData.notes,
          createdAt: new Date(session.startTime), // Most common approach
          agentInteractions: [], // Add required field
        };

        const updatedSessions: WorkSession[] = [
          ...(prevState.sessions || []),
          completedSession,
        ];

        // Update user profile with new focus score
        const updatedUserProfile = prevState.userProfile
          ? {
              ...prevState.userProfile,
              productivity: {
                ...prevState.userProfile.productivity,
                averageFocusScore: prevState.userProfile.productivity
                  ?.averageFocusScore
                  ? (prevState.userProfile.productivity.averageFocusScore +
                      sessionData.focusScore) /
                    2
                  : sessionData.focusScore,
                tasksCompleted:
                  prevState.userProfile.productivity?.tasksCompleted || 0,
                totalFocusTime:
                  (prevState.userProfile.productivity?.totalFocusTime || 0) +
                  Math.floor(
                    (new Date().getTime() -
                      new Date(session.startTime).getTime()) /
                      1000,
                  ),
              },
            }
          : prevState.userProfile;

        return {
          sessions: updatedSessions,
          userProfile: updatedUserProfile,
          focusSession: null,
          currentTask: null,
          isLoading: false,
        };
      });

      // Reload user data to ensure everything is up to date
      if (state.userProfile?.id) {
        state.loadUserSessions(state.userProfile.id);
      }
    } catch (error) {
      console.error("Failed to end session:", error);
      set({
        error: "Failed to end session",
        isLoading: false,
      });
      // Still end session locally
      set({
        focusSession: null,
        currentTask: null,
      });
    }
  },

  loadUserSessions: async (userId) => {
    set({ isLoading: true, error: null });
    try {
      const sessions = await userApi.getUserSessions(userId);
      console.log("Loaded sessions:", sessions);
      set({
        sessions: sessions || [],
        isLoading: false,
      });
    } catch (error) {
      console.error("Failed to load sessions:", error);
      set({
        error: "Failed to load sessions",
        sessions: [],
        isLoading: false,
      });
    }
  },

  pauseFocusSession: () =>
    set((state) => ({
      focusSession: state.focusSession
        ? { ...state.focusSession, paused: true }
        : null,
    })),

  resumeFocusSession: () =>
    set((state) => ({
      focusSession: state.focusSession
        ? { ...state.focusSession, paused: false }
        : null,
    })),

  // Onboarding
  setOnboardingStep: (step) => set({ onboardingStep: step }),

  setIsOnboarding: (isOnboarding) => set({ isOnboarding }),

  completeOnboarding: () =>
    set({
      isOnboarding: false,
      onboardingStep: 0,
    }),

  // UI state
  setLastCheckin: (date) => set({ lastCheckin: date }),

  storeCheckin: async (userId, checkinData) => {
    try {
      set({ isLoading: true, error: null });
      await userApi.storeCheckin(userId, checkinData);
      console.log("Daily checkin stored successfully in Firebase");
    } catch (error) {
      console.error("Error storing daily checkin:", error);
      set({
        error:
          error instanceof Error ? error.message : "Failed to store checkin",
      });
    } finally {
      set({ isLoading: false });
    }
  },

  // Agents
  activateAgent: (agent, active) => {
    const agentKey = `${agent}Active` as keyof AppState;
    set((state) => ({
      ...state,
      [agentKey]: active,
    }));
  },
}));
