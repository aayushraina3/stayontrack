import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { OllamaResponse, ChatMessage } from "../types";

@Injectable()
export class AIService {
  private readonly ollamaUrl: string;
  private readonly defaultModel: string;

  constructor(private configService: ConfigService) {
    this.ollamaUrl =
      this.configService.get("OLLAMA_URL") || "http://localhost:11434";
    this.defaultModel = this.configService.get("OLLAMA_MODEL") || "command-r7b";
  }

  async generateText(prompt: string, model?: string): Promise<string> {
    try {
      const response = await fetch(`${this.ollamaUrl}/api/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: model || this.defaultModel,
          prompt: prompt,
          stream: false,
          format: "json", // Force JSON format
        }),
      });

      if (!response.ok) {
        throw new Error(`Ollama API error: ${response.status}`);
      }

      const data = (await response.json()) as OllamaResponse;
      return data.response || "";
    } catch (error) {
      console.error("AI generation error:", error);
      throw new Error("Failed to generate AI response");
    }
  }

  async chatCompletion(
    messages: ChatMessage[],
    model?: string,
  ): Promise<string> {
    try {
      // Convert messages to a single prompt for Ollama
      const prompt = this.formatMessagesAsPrompt(messages);
      return await this.generateText(prompt, model);
    } catch (error) {
      console.error("Chat completion error:", error);
      throw new Error("Failed to generate chat response");
    }
  }

  private formatMessagesAsPrompt(messages: ChatMessage[]): string {
    const prompt = messages
      .map((msg) => {
        switch (msg.role) {
          case "system":
            return `System: ${msg.content}`;
          case "user":
            return `User: ${msg.content}`;
          case "assistant":
            return `Assistant: ${msg.content}`;
          default:
            return msg.content;
        }
      })
      .join("\n\n");

    // Add explicit JSON instruction
    return `${prompt}\n\nIMPORTANT: Respond ONLY with valid JSON. No additional text or explanations.`;
  }

  parseJsonResponse(response: string): any {
    try {
      console.log("Raw AI response:", response); // Debug log

      // Method 1: Try direct parsing first
      try {
        return JSON.parse(response.trim());
      } catch (directParseError) {
        console.log(
          "Direct parse failed, trying extraction methods...",
          directParseError.message,
        );
      }

      // Method 2: Extract JSON block between ```json``` tags
      const jsonBlockMatch = response.match(/```json\s*([\s\S]*?)\s*```/i);
      if (jsonBlockMatch) {
        console.log("Found JSON block:", jsonBlockMatch[1]);
        return JSON.parse(jsonBlockMatch[1].trim());
      }

      // Method 3: Extract JSON between curly braces (improved regex)
      const jsonMatch = response.match(/\{[\s\S]*\}/g);
      if (jsonMatch) {
        // Try each match until one parses successfully
        for (const match of jsonMatch) {
          try {
            const cleaned = this.cleanJsonString(match);
            console.log("Trying to parse:", cleaned);
            return JSON.parse(cleaned);
          } catch (parseError) {
            console.log("Parse attempt failed:", parseError.message);
            continue;
          }
        }
      }

      // Method 4: Try to find JSON-like structure and clean it
      const possibleJson = this.extractAndCleanJson(response);
      if (possibleJson) {
        console.log("Cleaned JSON attempt:", possibleJson);
        return JSON.parse(possibleJson);
      }

      // Fallback: Return structured error response
      console.warn("Failed to parse JSON, returning fallback response");
      return this.createFallbackResponse(response);
    } catch (error) {
      console.error("JSON parsing error:", error);
      console.error("Original response:", response);
      return this.createFallbackResponse(response);
    }
  }

  private cleanJsonString(jsonStr: string): string {
    return (
      jsonStr
        .trim()
        // Remove common issues
        .replace(/,(\s*[}\]])/g, "$1") // Remove trailing commas
        .replace(/([{,]\s*)([a-zA-Z_][a-zA-Z0-9_]*)\s*:/g, '$1"$2":') // Quote unquoted keys
        .replace(/:\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*([,}])/g, ':"$1"$2') // Quote unquoted string values
        .replace(/\n/g, " ") // Remove newlines
        .replace(/\s+/g, " ")
    ); // Normalize whitespace
  }

  private extractAndCleanJson(response: string): string | null {
    // Look for JSON-like patterns and try to fix common issues
    const patterns = [
      /\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}/g, // Nested objects
      /\[[^\]]*\]/g, // Arrays
    ];

    for (const pattern of patterns) {
      const matches = response.match(pattern);
      if (matches) {
        for (const match of matches) {
          const cleaned = this.cleanJsonString(match);
          try {
            JSON.parse(cleaned); // Test if it's valid
            return cleaned;
          } catch {
            continue;
          }
        }
      }
    }

    return null;
  }

  private createFallbackResponse(originalResponse: string): any {
    // Create a structured response when JSON parsing fails
    return {
      insights: [
        {
          type: "general",
          title: "Analysis Available",
          description: originalResponse.substring(0, 200) + "...",
          impact: "medium",
          actionable: false,
        },
      ],
      performanceScore: 7.0,
      error: "JSON parsing failed, showing fallback response",
    };
  }
}
