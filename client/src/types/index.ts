import { create } from "zustand"
export interface User {
  id: string
  name: string
  email: string
  workStyle: WorkStyle
  goals: Goal[]
  preferences: UserPreferences
  onboardingComplete: boolean
}

export interface WorkStyle {
  workingHours: "early" | "standard" | "late" | "flexible"
  breakFrequency: number[]
  taskComplexity: "simple" | "moderate" | "complex" | "mixed"
  motivationStyle:
    | "encouraging"
    | "direct"
    | "supportive"
    | "energetic"
    | "calm"
  distractionLevel: "low" | "medium" | "high"
  focusTime: number[]
  workEnvironment: "quiet" | "background-noise" | "music" | "social"
  energyPeaks: string[]
  communicationTone?: "formal" | "casual"
  preferredSessionLength?: number
  commonBlockers?: string[]
}

export interface Goal {
  id: string
  title: string
  description: string
  category: "work" | "personal" | "learning" | "health" | "creative"
  deadline: string
  priority: "low" | "medium" | "high"
  status?: "active" | "completed" | "paused"
  completed: boolean
  progress: number
  taskIds: string[]
  createdAt: string
}

export interface Task {
  id: string
  goalId: string
  title: string
  description?: string
  estimatedTime: number // in seconds
  actualTime?: number
  deadline?: string
  priority: "low" | "medium" | "high"
  status?: "todo" | "in-progress" | "completed"
  completed: boolean
  progress: number
  tags?: string[]
  category?: string
  scheduledTime?: string
  createdAt: string
  completedAt?: string
}

export interface WorkSession {
  id: string
  taskId: string
  startTime: Date
  endTime?: Date
  duration?: number
  focusScore: number
  interruptions: number
  notes?: string
  agentInteractions: AgentInteraction[]
  createdAt: Date
}

export interface FocusSession {
  id: string
  taskId: string
  startTime: string
  endTime?: string
  paused: boolean
  completed: boolean
  duration: number
  pausedDuration: number
  isBackendSession?: boolean // Track if session was created in backend
}

export interface AgentInteraction {
  id: string
  agentType: "motivator" | "planner" | "blocker" | "observer"
  message: string
  timestamp: Date
  userResponse?: string
  // Extended properties for different agent types
  type?: string // For backward compatibility
  distractionsBlocked?: number
  insightsCount?: number
  data?: Record<string, unknown> // Flexible data storage
}

export interface UserPreferences {
  theme: "light" | "dark" | "auto"
  notifications: boolean
  motivationalReminders: boolean
  dailyInsights: boolean
  // workingHours: {
  //   start: string
  //   end: string
  // }
  breakReminders: boolean
  agentPersonalities: {
    motivator: "encouraging" | "direct" | "supportive" | "energetic" | "calm"
    planner: "detailed" | "concise"
    observer: "analytical" | "supportive"
  }
  blockedSites: string[]
}

export interface UserProfile {
  id: string
  personalInfo: PersonalInfo
  preferences: UserPreferences
  productivity: ProductivityMetrics
  agentSettings: AgentSettings
  goals: Goal[]
  onboardingComplete: boolean
  // workStyle: {
  //   preferredWorkHours: string[]
  //   breakFrequency: number
  //   taskComplexityPreference: "simple" | "moderate" | "complex"
  //   motivationStyle: "encouraging" | "direct" | "supportive" | "energetic"
  // }
}

export interface PersonalInfo {
  name: string
  email: string
  timezone: string
  workingHours: {
    start: string
    end: string
  }
}

export interface ProductivityMetrics {
  tasksCompleted: number
  totalFocusTime: number
  averageFocusScore: number
  currentStreak: number
  longestStreak: number
  completionRate: number
  streakRecord: number
}

export interface AgentSettings {
  plannerEnabled: boolean
  motivatorEnabled: boolean
  blockerEnabled: boolean
  observerEnabled: boolean
  plannerSettings: {
    autoSchedule: boolean
    adaptivePlanning: boolean
    timeBuffers: boolean
  }
  motivatorSettings: {
    frequency: "low" | "medium" | "high"
    sessionReminders: boolean
    achievementCelebration: boolean
  }
  blockerSettings: {
    strictMode: boolean
    allowBreakOverride: boolean
    socialMediaBlocking: boolean
  }
  observerSettings: {
    dailyInsights: boolean
    weeklyReports: boolean
    performanceTracking: boolean
  }
}

// Onboarding related types
export interface OnboardingStep {
  id: string
  title: string
  description: string
  component: string
}

export interface OnboardingData {
  personalInfo?: PersonalInfo
  goals?: Goal[]
  workStyle?: WorkStyle
  plannerEnabled?: boolean
  motivatorEnabled?: boolean
  blockerEnabled?: boolean
  observerEnabled?: boolean
  plannerSettings?: AgentSettings["plannerSettings"]
  motivatorSettings?: AgentSettings["motivatorSettings"]
  blockerSettings?: AgentSettings["blockerSettings"]
  observerSettings?: AgentSettings["observerSettings"]
}

// API Response types
export interface MotivationResponse {
  message: string
  tone: string
  actionableAdvice: string[]
  energyBoost: number
}

export interface PlanningResponse {
  tasks: TaskPlan[]
  schedule: ScheduleBlock[]
  estimatedCompletionTime: number
  recommendations: string[]
}

export interface TaskPlan {
  id: string
  title: string
  description: string
  estimatedTime: number
  priority: "low" | "medium" | "high"
  dependencies: string[]
  category: string
  suggestedTime: string
}

export interface ScheduleBlock {
  id: string
  taskId: string
  startTime: string
  endTime: string
  type: "work" | "break" | "buffer"
  title: string
}

export interface BlockerResponse {
  message: string
  blockedSites: string[]
  allowedSites: string[]
  sessionDuration: number
  strictMode: boolean
  emergencyOverride: boolean
}

export interface InsightsResponse {
  performanceScore: number
  insights: Insight[]
  trends: Trend[]
  recommendations: string[]
  timeframe: string
}

export interface Insight {
  id: string
  title: string
  description: string
  category: "productivity" | "focus" | "time-management" | "goal-progress"
  actionable: boolean
  priority: "low" | "medium" | "high"
}

export interface Trend {
  metric: string
  current: number
  previous: number
  change: number
  direction: "up" | "down" | "stable"
}

// API Request types
export interface MotivationRequest {
  task: string
  energy: number
  progress: number
  userId: string
  timeframe: "day" | "week" | "month"
}

export interface PlanningRequest {
  goals: Goal[]
  availableTime: number
  energy: number
  userId: string
}

export interface BlockerRequest {
  userId: string
  taskType: string
  sessionDuration: number
  distractionLevel: "low" | "medium" | "high"
}

export interface InsightsRequest {
  userId: string
  timeframe: "day" | "week" | "month"
}

export interface FeedbackRequest {
  userId: string
  sessionId: string
  feeling: "great" | "okay" | "struggled"
  helpfulFactors: string[]
  notes?: string
  // Legacy fields for compatibility
  completed?: boolean
  focusScore?: number
  distractions?: string[]
  motivationEffectiveness?: number
  recommendations?: string[]
  taskComplexity?: "simple" | "moderate" | "complex"
  energyAfter?: number
}

// Daily Check-in types
export interface DailyCheckinData {
  energy: number[]
  mood: number[]
  focus: number[]
  priorities: string
  challenges: string
  motivation: string
  date: string
}

// Focus Session Feedback types
export interface FocusSessionFeedback {
  focusScore: number[]
  distractions: string
  completed: boolean
  energyAfter: number[]
  recommendations: string
  difficulty: "simple" | "moderate" | "complex"
}

// Component Props types
export interface TaskWithGoal extends Task {
  goalId: string
  goalTitle: string
}

export interface StepComponentProps {
  data: OnboardingData
  onNext: (data: OnboardingData) => void
  onBack: () => void
  isFirst: boolean
  isLast: boolean
}

// Store types
export interface AppState {
  // User & Profile
  userProfile: UserProfile | null
  isOnboarding: boolean

  // Goals & Tasks
  goals: Goal[]
  currentTask: TaskWithGoal | null

  // Focus Session
  focusSession: FocusSession | null

  // UI State
  loading: boolean
  error: string | null
}

export interface AppActions {
  // User Profile
  setUserProfile: (profile: UserProfile) => void
  setIsOnboarding: (isOnboarding: boolean) => void
  completeOnboarding: () => void

  // Goals
  addGoal: (goal: Goal) => void
  updateGoal: (goalId: string, updates: Partial<Goal>) => void
  deleteGoal: (goalId: string) => void

  // Tasks
  addTask: (goalId: string, task: Task) => void
  updateTask: (goalId: string, taskId: string, updates: Partial<Task>) => void
  deleteTask: (goalId: string, taskId: string) => void
  setCurrentTask: (task: TaskWithGoal | null) => void

  // Focus Session
  startFocusSession: (taskId: string) => void
  pauseFocusSession: () => void
  resumeFocusSession: () => void
  endFocusSession: (focusScore: number, distractions: string[]) => void

  // Agents
  activateAgent: (
    agentType: "motivator" | "planner" | "blocker" | "observer"
  ) => void

  // UI
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
}

export type AppStore = AppState & AppActions

// Utility types
export type Priority = "low" | "medium" | "high"
export type TaskStatus = "todo" | "in-progress" | "completed"
export type GoalCategory =
  | "work"
  | "personal"
  | "learning"
  | "health"
  | "creative"
export type AgentType = "motivator" | "planner" | "blocker" | "observer"
export type TimeFrame = "day" | "week" | "month"
