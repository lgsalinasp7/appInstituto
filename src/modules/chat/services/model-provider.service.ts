// ============================================
// Model Provider Service
// Fallback chain: Groq → Gemini → OpenRouter
// ============================================

import { streamText, generateText, type LanguageModel } from "ai";
import { groq } from "@ai-sdk/groq";
import { google } from "@ai-sdk/google";
import { AiAgentService } from "./ai-agent.service";

interface ProviderConfig {
  name: string;
  modelId: string;
  getModel: () => LanguageModel;
  isAvailable: () => Promise<boolean>;
}

interface StreamWithFallbackConfig {
  system: string;
  messages: Array<{ role: string; content: string }>;
  tools?: any;
  maxTokens?: number;
  temperature?: number;
  stopWhen?: any;
  onFinish?: (result: any) => Promise<void>;
}

interface FallbackResult {
  stream: ReturnType<typeof streamText>;
  modelId: string;
  providerName: string;
}

export class ModelProviderService {
  private static providers: ProviderConfig[] = [
    {
      name: "Groq",
      modelId: "llama-3.3-70b-versatile",
      getModel: () => groq("llama-3.3-70b-versatile"),
      isAvailable: async () => {
        if (!process.env.GROQ_API_KEY) return false;
        // Check if free tier is not exhausted (>95%)
        try {
          const usage = await AiAgentService.getFreeTierUsage();
          return usage.percentage < 95;
        } catch {
          return !!process.env.GROQ_API_KEY;
        }
      },
    },
    {
      name: "Google",
      modelId: "gemini-2.0-flash",
      getModel: () => google("gemini-2.0-flash"),
      isAvailable: async () => {
        return !!process.env.GOOGLE_GENERATIVE_AI_API_KEY;
      },
    },
    {
      name: "OpenRouter",
      modelId: "meta-llama/llama-3.3-70b-instruct",
      getModel: () => {
        // Dynamic import to avoid error if package not installed
        try {
          const { createOpenRouter } = require("@openrouter/ai-sdk-provider");
          const openrouter = createOpenRouter({
            apiKey: process.env.OPENROUTER_API_KEY,
          });
          return openrouter("meta-llama/llama-3.3-70b-instruct");
        } catch {
          throw new Error("OpenRouter SDK not available");
        }
      },
      isAvailable: async () => {
        return !!process.env.OPENROUTER_API_KEY;
      },
    },
  ];

  /**
   * Get the first available model in the fallback chain
   */
  static async getAvailableModel(): Promise<{
    model: LanguageModel;
    modelId: string;
    providerName: string;
  }> {
    for (const provider of this.providers) {
      try {
        const available = await provider.isAvailable();
        if (available) {
          return {
            model: provider.getModel(),
            modelId: provider.modelId,
            providerName: provider.name,
          };
        }
      } catch (error) {
        console.warn(
          `[ModelProvider] Provider ${provider.name} check failed:`,
          error
        );
        continue;
      }
    }

    throw new Error(
      "No hay proveedores de IA disponibles. Verifica las API keys configuradas."
    );
  }

  /**
   * Stream text with automatic fallback between providers
   */
  static async streamWithFallback(
    config: StreamWithFallbackConfig
  ): Promise<FallbackResult> {
    const errors: Array<{ provider: string; error: any }> = [];

    for (const provider of this.providers) {
      try {
        const available = await provider.isAvailable();
        if (!available) {
          console.log(
            `[ModelProvider] Skipping ${provider.name} (not available)`
          );
          continue;
        }

        const model = provider.getModel();
        console.log(
          `[ModelProvider] Using ${provider.name} (${provider.modelId})`
        );

        const result = streamText({
          model,
          system: config.system,
          messages: config.messages as any,
          tools: config.tools,
          maxOutputTokens: config.maxTokens,
          temperature: config.temperature,
          stopWhen: config.stopWhen,
          onFinish: config.onFinish,
        });

        return {
          stream: result,
          modelId: provider.modelId,
          providerName: provider.name,
        };
      } catch (error) {
        console.error(
          `[ModelProvider] ${provider.name} failed:`,
          error
        );
        errors.push({ provider: provider.name, error });
        continue;
      }
    }

    console.error("[ModelProvider] All providers failed:", errors);
    throw new Error(
      "Todos los proveedores de IA fallaron. Por favor intenta más tarde."
    );
  }

  /**
   * Generate text (non-streaming) with fallback - used for summarization, routing
   */
  static async generateWithFallback(config: {
    system: string;
    prompt: string;
    maxTokens?: number;
    temperature?: number;
  }): Promise<{ text: string; modelId: string }> {
    for (const provider of this.providers) {
      try {
        const available = await provider.isAvailable();
        if (!available) continue;

        const model = provider.getModel();
        const { text } = await generateText({
          model,
          system: config.system,
          prompt: config.prompt,
          maxOutputTokens: config.maxTokens,
          temperature: config.temperature,
        });

        return { text, modelId: provider.modelId };
      } catch (error) {
        console.warn(
          `[ModelProvider] generateText failed for ${provider.name}:`,
          error
        );
        continue;
      }
    }

    throw new Error("No se pudo generar texto con ningún proveedor.");
  }
}
