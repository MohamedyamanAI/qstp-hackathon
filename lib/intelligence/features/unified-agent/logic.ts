import { createAgent } from "@/lib/intelligence/core/agent";
import { buildContextPrompt } from "./context";
import type { UnifiedAgentOptions } from "./types";

const BASE_INSTRUCTIONS = `
You are a helpful AI assistant. Be concise, accurate, and proactive.

## Style
- Prefer short, direct answers. Use Markdown for structure when helpful.
- When the user asks for code, return runnable, well-formatted code.
- If you are uncertain about a fact, say so rather than guessing.

## Context
- When a CONTEXT section is provided below, treat it as authoritative background.
  Use it to ground your answers; do not contradict it without explanation.
`.trim();

/**
 * Builds the full system prompt. Exported so callers (e.g. API routes) can
 * include it in message metadata for debugging.
 */
export function buildUnifiedInstructions(opts: UnifiedAgentOptions = {}): string {
  return BASE_INSTRUCTIONS + buildContextPrompt(opts.contextBlocks, opts.contextDocuments);
}

export function createUnifiedAgent(opts: UnifiedAgentOptions = {}) {
  return createAgent({
    instructions: buildUnifiedInstructions(opts),
    model: opts.model,
    maxSteps: 15,
  });
}
