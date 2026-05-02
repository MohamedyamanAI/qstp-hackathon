import type { ContextBlock, ContextDocument } from "./types";

/**
 * Builds an optional context section appended to the system prompt.
 * Returns "" when no blocks or documents are provided.
 */
export function buildContextPrompt(
  blocks: ContextBlock[] = [],
  documents: ContextDocument[] = []
): string {
  const parts: string[] = [];

  if (blocks.length > 0) {
    parts.push(
      blocks
        .map((b) => `## ${b.heading}\n${b.body}`)
        .join("\n\n---\n\n")
    );
  }

  if (documents.length > 0) {
    parts.push(
      `## REFERENCE DOCUMENTS (${documents.length})\n` +
        documents
          .map(
            (d) =>
              `### ${d.title} (type: ${d.type ?? "untyped"}, id: ${d.id})\n${d.content}`
          )
          .join("\n\n---\n\n")
    );
  }

  if (parts.length === 0) return "";

  return `\n\n---\n# CONTEXT\n\n${parts.join("\n\n---\n\n")}`;
}
