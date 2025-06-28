"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SignInButton, SignUpButton } from "@clerk/nextjs";
import {
  Brain,
  Target,
  Shield,
  Eye,
  CheckCircle,
  ArrowRight,
  Zap,
} from "lucide-react";
import { motion } from "framer-motion";

export function LandingPage() {
  const features = [
    {
      icon: Target,
      title: "AI Task Planning",
      description:
        "Smart scheduling that adapts to your work style and energy levels",
    },
    {
      icon: Brain,
      title: "Personalized Motivation",
      description:
        "Contextual encouragement based on your goals and current progress",
    },
    {
      icon: Shield,
      title: "Distraction Blocking",
      description: "Intelligent website blocking during focus sessions",
    },
    {
      icon: Eye,
      title: "Productivity Insights",
      description:
        "Deep analysis of your work patterns with actionable recommendations",
    },
  ];

  const benefits = [
    "Overcome procrastination with AI-powered motivation",
    "Get optimized daily schedules that actually work",
    "Block distractions automatically during focus time",
    "Track progress with detailed productivity analytics",
    "Adapt to your unique work style and preferences",
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-4xl mx-auto"
        >
          <Badge
            variant="outline"
            className="mb-6 bg-blue-100 text-blue-800 border-blue-300"
          >
            <Zap className="h-3 w-3 mr-1" />
            AI-Powered Productivity
          </Badge>

          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Beat Procrastination with
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
              {" "}
              AI Agents
            </span>
          </h1>

          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            StayOnTrack uses four specialized AI agents to plan your tasks, keep
            you motivated, block distractions, and provide insights. Finally, a
            productivity system that actually works.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <SignUpButton mode="modal">
              <Button
                size="lg"
                className="px-8 py-3 text-lg bg-blue-600 hover:bg-blue-700"
              >
                Get Started Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </SignUpButton>
            <SignInButton mode="modal">
              <Button variant="outline" size="lg" className="px-8 py-3 text-lg">
                Sign In
              </Button>
            </SignInButton>
          </div>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16"
        >
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
              >
                <Card className="h-full hover:shadow-lg transition-shadow">
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                      <Icon className="h-6 w-6 text-blue-600" />
                    </div>
                    <h3 className="font-semibold text-lg mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 text-sm">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Benefits Section */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white rounded-2xl p-8 md:p-12 shadow-xl mb-16"
        >
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Why StayOnTrack Works
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Unlike generic productivity apps, StayOnTrack adapts to your
              unique work style and provides personalized AI assistance exactly
              when you need it.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              {benefits.map((benefit, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.8 + index * 0.1 }}
                  className="flex items-center space-x-3"
                >
                  <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                  <span className="text-gray-700">{benefit}</span>
                </motion.div>
              ))}
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6">
              <h3 className="font-semibold text-lg mb-4">How It Works</h3>
              <div className="space-y-3 text-sm text-gray-700">
                <div className="flex items-start space-x-2">
                  <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                    1
                  </div>
                  <div>
                    Set your goals and let the Planner Agent create optimized
                    schedules
                  </div>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                    2
                  </div>
                  <div>
                    Get personalized motivation from the Motivator Agent when
                    you need it
                  </div>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-6 h-6 bg-red-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                    3
                  </div>
                  <div>
                    Stay focused with automatic distraction blocking during work
                    sessions
                  </div>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                    4
                  </div>
                  <div>
                    Improve continuously with insights from the Observer Agent
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0 }}
          className="text-center bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 md:p-12 text-white"
        >
          <h2 className="text-3xl font-bold mb-4">
            Ready to Transform Your Productivity?
          </h2>
          <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
            Join thousands of users who have overcome procrastination and
            achieved their goals with AI-powered assistance.
          </p>
          <SignUpButton mode="modal">
            <Button
              size="lg"
              variant="secondary"
              className="px-8 py-3 text-lg bg-white text-blue-600 hover:bg-gray-100"
            >
              Start Your Free Trial
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </SignUpButton>
        </motion.div>
      </div>
    </div>
  );
}
