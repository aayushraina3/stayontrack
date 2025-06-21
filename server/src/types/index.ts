// ============================
// AI Agent Result Types
// ============================

export interface PlanResult {
  tasks: Array<{
    id: string;
    title: string;
    description: string;
    estimatedTime: number;
    priority: "low" | "medium" | "high";
    category: string;
    dependencies?: string[];
  }>;
  schedule: Array<{
    taskId: string;
    timeSlot: string;
    date: string;
  }>;
  estimatedTotalTime: number;
  recommendations: string[];
  feasibilityScore: number;
}

export interface MotivationResult {
  message: string;
  tone: string;
  encouragementLevel: number;
  positivityScore: number;
  actionableAdvice: string[];
  timestamp: string;
}

export interface BlockerConfiguration {
  sessionId: string;
  blockedSites: string[];
  allowedSites: string[];
  blockDuration: number;
  breakIntervals: number[];
  distractionLevel: "low" | "medium" | "high";
  customRules: Array<{
    type: "time_limit" | "keyword_block" | "app_block";
    value: string;
    duration: number;
  }>;
  motivationalReminders: string[];
}

// ============================
// AI Service Types
// ============================

// Standardized chat message format for AI interactions
export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface OllamaResponse {
  model: string;
  created_at: string;
  response: string;
  done: boolean;
  context?: number[];
  total_duration?: number;
  load_duration?: number;
  prompt_eval_count?: number;
  prompt_eval_duration?: number;
  eval_count?: number;
  eval_duration?: number;
}

// ============================
// Firebase Document Types
// ============================

export interface FirebaseDocument {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface FirebaseQueryFilters {
  [key: string]: any;
}

export interface FirebaseCreateResult<T> extends FirebaseDocument {
  data: T;
}

export interface FirebaseUpdateResult {
  id: string;
  success: boolean;
}

export interface FirebaseDeleteResult {
  deleted: boolean;
}

// ============================
// Session Types
// ============================

export interface SessionDocument extends FirebaseDocument {
  userId: string;
  taskId: string;
  taskTitle: string;
  startTime: Date;
  endTime?: Date;
  duration?: number;
  status: "active" | "completed" | "paused";
  focusScore?: number;
  interruptions?: number;
  agentInteractions?: AgentInteraction[];
  notes?: string;
  feedback?: SessionFeedback;
}

export interface AgentInteraction {
  id: string;
  agentType: "motivator" | "planner" | "blocker" | "observer";
  timestamp: Date;
  message: string;
  action?: string;
  metadata?: Record<string, any>;
}

export interface SessionFeedback {
  feeling: "great" | "okay" | "struggled";
  helpfulFactors: string[];
  notes?: string;
  submittedAt: Date;
}

export interface SessionStats {
  totalSessions: number;
  totalDuration: number;
  averageFocusScore: number;
  averageDuration: number;
  totalInterruptions: number;
  completionRate: number;
  timeframe: "day" | "week" | "month";
  periodStart: Date;
  periodEnd: Date;
}

// Legacy Session interface (for backwards compatibility)
export interface Session {
  id: string;
  startTime: Date | string;
  userId: string;
  taskId: string;
  status: string;
  focusScore?: number;
  interruptions?: number;
  agentInteractions?: any[];
  notes?: string;
  endTime?: Date | string;
  duration?: number;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export interface HourlyData {
  avgFocusScore: number;
  sessions: number;
  totalFocusScore: number;
  totalDuration: number;
  hour: number;
}

// ============================
// Task and Goal Types
// ============================

export interface Goal {
  id: string;
  title: string;
  description?: string;
  category: string;
  priority: string;
  targetDate: string;
  userId: string;
  tags?: string[];
  estimatedHours?: number;
  progress: number;
  completed: boolean;
  tasks: Task[];
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  priority: string;
  estimatedMinutes?: number;
  completed: boolean;
  tags?: string[];
  createdAt: string;
  updatedAt?: string;
}

export interface TaskStats {
  total: number;
  completed: number;
  completionRate: number;
  avgCompletionTime: number;
  priorityDistribution: Record<string, number>;
}

// ============================
// Analytics and Insights Types
// ============================

export interface UserPatterns {
  peakHours: string[] | number[];
  averageSessionLength: number;
  consistencyScore: number;
  focusTrends: string;
  interruptionPatterns: InterruptionPattern[];
  totalDataPoints?: number;
}

export interface InterruptionPattern {
  type: string;
  frequency: string;
  impact: string;
}

export interface InsightPromptRequest {
  sessions: {
    summary?: {
      totalSessions?: number;
      totalDuration?: number;
      avgFocusScore?: number;
      avgSessionLength?: number;
      totalInterruptions?: number;
    };
  };
  tasks: {
    total?: number;
    completed?: number;
    completionRate?: number;
  };
  patterns: UserPatterns;
  timeframe: "day" | "week" | "month";
}

// ============================
// Enums
// ============================

export enum GoalCategory {
  WORK = "work",
  PERSONAL = "personal",
  LEARNING = "learning",
  HEALTH = "health",
  CREATIVE = "creative",
}

export enum GoalPriority {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
  URGENT = "urgent",
}

export enum TaskStatus {
  TODO = "todo",
  IN_PROGRESS = "in-progress",
  COMPLETED = "completed",
}

export enum TaskPriority {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
}
