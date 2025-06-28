"use client";

import { useState } from "react";
import { api } from "@/lib/api";

export default function TestPage() {
  const [result, setResult] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const testBackendConnection = async () => {
    setLoading(true);
    setResult("Testing connection...");

    try {
      // Test basic connectivity
      const response = await fetch("http://localhost:4000/health", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.text();
        setResult(`✅ Backend connection successful: ${data}`);
      } else {
        setResult(`❌ Backend returned status: ${response.status}`);
      }
    } catch (error) {
      setResult(
        `❌ Connection failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      );
    } finally {
      setLoading(false);
    }
  };

  const testApiClient = async () => {
    setLoading(true);
    setResult("Testing API client...");

    try {
      // Test our API client
      const response = await api.get("/");
      setResult(`✅ API client successful: ${JSON.stringify(response.data)}`);
    } catch (error) {
      setResult(
        `❌ API client failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Frontend-Backend Test
        </h1>

        <div className="bg-white shadow rounded-lg p-6">
          <div className="space-y-4">
            <button
              onClick={testBackendConnection}
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {loading ? "Testing..." : "Test Direct Backend Connection"}
            </button>

            <button
              onClick={testApiClient}
              disabled={loading}
              className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:opacity-50 transition-colors"
            >
              {loading ? "Testing..." : "Test API Client"}
            </button>
          </div>

          {result && (
            <div className="mt-6 p-4 bg-gray-100 rounded-md">
              <h3 className="font-medium text-gray-900 mb-2">Result:</h3>
              <pre className="text-sm text-gray-700 whitespace-pre-wrap">
                {result}
              </pre>
            </div>
          )}

          <div className="mt-6 text-sm text-gray-600">
            <p>
              <strong>Backend URL:</strong> http://localhost:4000
            </p>
            <p>
              <strong>Frontend URL:</strong> http://localhost:3000
            </p>
            <p>
              <strong>Expected API Base:</strong>{" "}
              {process.env.NEXT_PUBLIC_API_BASE_URL || "Not set"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
