"use client";

import { useState } from "react";
import { api, userApi } from "@/lib/api";

export default function ApiTestPage() {
  const [result, setResult] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [createdUserId, setCreatedUserId] = useState<string>("test_user_123");

  const testBackendConnection = async () => {
    setLoading(true);
    setResult("Testing backend connection...");

    try {
      const response = await api.get("/");
      setResult(
        `✅ Backend connected successfully: ${JSON.stringify(
          response.data,
          null,
          2,
        )}`,
      );
    } catch (error) {
      setResult(
        `❌ Backend connection failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      );
    } finally {
      setLoading(false);
    }
  };

  const testUserCreation = async () => {
    setLoading(true);
    setResult("Testing user creation...");

    try {
      const testUser = {
        name: "Test User",
        email: "test@example.com",
        workStyle: {
          energyPeaks: ["morning"],
          motivationStyle: "encouraging",
          distractionLevel: "medium",
          preferredBreakLength: 15,
        },
        goals: [],
        preferences: {
          theme: "light",
          notifications: true,
          breakReminders: true,
          motivationalReminders: true,
          dailyInsights: true,
          blockedSites: [],
          agentPersonalities: {
            motivator: "encouraging",
            planner: "detailed",
            observer: "supportive",
          },
        },
      };

      const response = await userApi.createUser(testUser);
      setCreatedUserId(response.id);
      setResult(
        `✅ User created successfully: ${JSON.stringify(response, null, 2)}`,
      );
    } catch (error) {
      setResult(
        `❌ User creation failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      );
    } finally {
      setLoading(false);
    }
  };

  const testUserRetrieval = async () => {
    setLoading(true);
    setResult("Testing user retrieval...");

    try {
      const response = await userApi.getUserProfile(createdUserId);
      setResult(
        `✅ User retrieved successfully: ${JSON.stringify(response, null, 2)}`,
      );
    } catch (error) {
      setResult(
        `❌ User retrieval failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      );
    } finally {
      setLoading(false);
    }
  };

  const testGoalCreation = async () => {
    setLoading(true);
    setResult("Testing goal creation...");

    try {
      const testGoalDto = {
        userId: createdUserId,
        title: "Test Goal",
        description: "This is a test goal",
        category: "productivity",
        targetDate: new Date(
          Date.now() + 30 * 24 * 60 * 60 * 1000,
        ).toISOString(), // 30 days from now
        priority: "high",
      };

      const response = await api.post("/api/goals", testGoalDto);
      setResult(
        `✅ Goal created successfully: ${JSON.stringify(
          response.data,
          null,
          2,
        )}`,
      );
    } catch (error) {
      setResult(
        `❌ Goal creation failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      );
    } finally {
      setLoading(false);
    }
  };

  const testGoalRetrieval = async () => {
    setLoading(true);
    setResult("Testing goal retrieval...");

    try {
      const response = await api.get(`/api/goals/user/${createdUserId}`);
      setResult(
        `✅ Goals retrieved successfully: ${JSON.stringify(
          response.data,
          null,
          2,
        )}`,
      );
    } catch (error) {
      setResult(
        `❌ Goal retrieval failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      );
    } finally {
      setLoading(false);
    }
  };

  const testSessionCreation = async () => {
    setLoading(true);
    setResult("Testing session creation...");

    try {
      const testSession = {
        taskId: "test_task_123",
        userId: createdUserId,
        taskTitle: "Test Task",
      };

      const response = await userApi.createSession(testSession);
      setResult(
        `✅ Session created successfully: ${JSON.stringify(response, null, 2)}`,
      );
    } catch (error) {
      setResult(
        `❌ Session creation failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      );
    } finally {
      setLoading(false);
    }
  };

  const testSessionRetrieval = async () => {
    setLoading(true);
    setResult("Testing session retrieval...");

    try {
      const response = await userApi.getUserSessions(createdUserId);
      setResult(
        `✅ Sessions retrieved successfully: ${JSON.stringify(
          response,
          null,
          2,
        )}`,
      );
    } catch (error) {
      setResult(
        `❌ Session retrieval failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <button
        onClick={testBackendConnection}
        disabled={loading}
        className="w-full px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
      >
        Test Backend Connection
      </button>

      <button
        onClick={testUserCreation}
        disabled={loading}
        className="w-full px-4 py-2 bg-green-500 text-white rounded disabled:opacity-50"
      >
        Test User Creation
      </button>

      <button
        onClick={testUserRetrieval}
        disabled={loading}
        className="w-full px-4 py-2 bg-purple-500 text-white rounded disabled:opacity-50"
      >
        Test User Retrieval
      </button>

      <button
        onClick={testGoalCreation}
        disabled={loading}
        className="w-full px-4 py-2 bg-orange-500 text-white rounded disabled:opacity-50"
      >
        Test Goal Creation
      </button>

      <button
        onClick={testGoalRetrieval}
        disabled={loading}
        className="w-full px-4 py-2 bg-pink-500 text-white rounded disabled:opacity-50"
      >
        Test Goal Retrieval
      </button>

      <button
        onClick={testSessionCreation}
        disabled={loading}
        className="w-full px-4 py-2 bg-yellow-500 text-white rounded disabled:opacity-50"
      >
        Test Session Creation
      </button>

      <button
        onClick={testSessionRetrieval}
        disabled={loading}
        className="w-full px-4 py-2 bg-red-500 text-white rounded disabled:opacity-50"
      >
        Test Session Retrieval
      </button>
    </div>
  );
}
