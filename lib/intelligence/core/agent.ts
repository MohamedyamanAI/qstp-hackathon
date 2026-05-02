import { ToolLoopAgent, stepCountIs } from "ai";
import { vertex } from "@ai-sdk/google-vertex/edge";
import type { ToolLoopAgentSettings } from "ai";

type CreateAgentOptions = {
  instructions: string;
  model?: string;
  maxSteps?: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  tools?: Record<string, any>;
};

/**
 * Auth: uses Vertex AI Express mode via the GOOGLE_VERTEX_API_KEY env var
 * (picked up by the default `vertex` provider). Edge variant is used so the
 * code runs on Cloudflare Workers (no google-auth-library / Node deps).
 *
 * NOTE: Google's provider-defined tools (e.g. googleSearch) and custom
 * function tools cannot be mixed — the provider returns early when provider
 * tools are present, dropping all function declarations.
 */
export function createAgent({ instructions, model = "gemini-2.5-flash", maxSteps = 15, tools }: CreateAgentOptions) {
  return new ToolLoopAgent({
    model: vertex(model),
    instructions,
    tools: tools,
    stopWhen: stepCountIs(maxSteps),
    providerOptions: {
      google: {
        thinkingConfig: { includeThoughts: true },
      },
    },
  } satisfies ToolLoopAgentSettings);
}
