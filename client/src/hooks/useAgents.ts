import { useMutation, useQuery } from "@tanstack/react-query";
import type {
  MotivationRequest,
  MotivationResponse,
  PlanningRequest,
  PlanningResponse,
  BlockerRequest,
  BlockerResponse,
  InsightsRequest,
  InsightsResponse,
  FeedbackRequest,
} from "@/types";
import { agentApi } from "@/lib/api";

export const useGetMotivation = () => {
  return useMutation<MotivationResponse, Error, MotivationRequest>({
    mutationFn: agentApi.getMotivation,
  });
};

export const useGeneratePlan = () => {
  return useMutation<PlanningResponse, Error, PlanningRequest>({
    mutationFn: agentApi.generatePlan,
  });
};

export const useActivateBlocker = () => {
  return useMutation<BlockerResponse, Error, BlockerRequest>({
    mutationFn: agentApi.activateBlocker,
  });
};

export const useGetInsights = () => {
  return useMutation<InsightsResponse, Error, InsightsRequest>({
    mutationFn: agentApi.getInsights,
  });
};

export const useSubmitFeedback = () => {
  return useMutation<unknown, Error, FeedbackRequest>({
    mutationFn: agentApi.submitFeedback,
  });
};

export const useAgentHealthCheck = () => {
  return useQuery({
    queryKey: ["agent-health"],
    queryFn: () => agentApi.healthCheck(),
    refetchInterval: 30000, // Check every 30 seconds
  });
};
