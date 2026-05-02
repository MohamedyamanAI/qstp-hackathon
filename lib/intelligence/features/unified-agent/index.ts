export { createUnifiedAgent, buildUnifiedInstructions } from "./logic";
export { buildContextPrompt } from "./context";
export {
  getCached,
  setCached,
  invalidate,
  resetStats as resetContextCacheStats,
  getStats as getContextCacheStats,
} from "./context-cache";
export type {
  UnifiedAgentOptions,
  ContextBlock,
  ContextDocument,
} from "./types";
