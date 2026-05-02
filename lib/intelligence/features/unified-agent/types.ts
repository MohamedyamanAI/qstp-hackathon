import type { SupabaseClient } from "@supabase/supabase-js";

export type ContextDocument = {
  id: string;
  title: string;
  type?: string | null;
  content: string;
};

export type UnifiedAgentOptions = {
  model?: string;
  /** Explicit image generation model override. */
  imageModel?: string;
  supabase?: SupabaseClient;
  userId?: string;
  /** Free-form context blocks rendered into the system prompt verbatim. */
  contextBlocks?: ContextBlock[];
  /** Reference documents loaded into the prompt as background material. */
  contextDocuments?: ContextDocument[];
  /** URLs of images uploaded by the user in the current conversation (most recent first). */
  userImages?: string[];
};

export type ContextBlock = {
  /** Heading shown above the block in the prompt (e.g. "USER PROFILE"). */
  heading: string;
  /** Body text — will be appended verbatim under the heading. */
  body: string;
};
