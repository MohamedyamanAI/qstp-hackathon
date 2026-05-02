import type { UIMessage, FileUIPart } from "ai";
import { Buffer } from "node:buffer";

type TextPart = { type: "text"; text: string };
type MessagePart = UIMessage["parts"][number];

const EXCEL_MIMES = new Set([
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-excel",
]);

/**
 * Pre-process UIMessages before they reach the agent.
 * - Strips tool-call parts from assistant messages loaded from DB (they have empty inputs
 *   that fail schema validation; the text summary provides sufficient context).
 * - Converts spreadsheet file parts (Excel/CSV) into text parts so Gemini can read them.
 * - Images and PDFs pass through unchanged — Gemini handles those natively.
 */
export async function preprocessMessages(messages: UIMessage[]): Promise<UIMessage[]> {
  return Promise.all(messages.map(async (msg): Promise<UIMessage> => {
    if (msg.role === "assistant") {
      const filtered = msg.parts.filter(
        (p) => !("toolCallId" in p && "input" in p)
      );
      if (filtered.length !== msg.parts.length) {
        return { ...msg, parts: filtered.length > 0 ? filtered : [{ type: "text" as const, text: "(tool results omitted)" }] };
      }
      return msg;
    }

    if (msg.role !== "user") return msg;

    const hasSpreadsheet = msg.parts.some(
      (p): p is FileUIPart =>
        p.type === "file" &&
        (EXCEL_MIMES.has(p.mediaType) || p.mediaType === "text/csv")
    );
    if (!hasSpreadsheet) return msg;

    const newParts: MessagePart[] = [];
    for (const part of msg.parts) {
      if (part.type !== "file") {
        newParts.push(part);
        continue;
      }

      if (EXCEL_MIMES.has(part.mediaType)) {
        const csv = await excelDataUrlToCsv(part.url);
        if (csv) {
          const textPart: TextPart = {
            type: "text",
            text: `[Spreadsheet: ${part.filename ?? "file.xlsx"}]\n${csv}`,
          };
          newParts.push(textPart);
        } else {
          newParts.push(part);
        }
        continue;
      }

      if (part.mediaType === "text/csv") {
        const text = dataUrlToUtf8(part.url);
        if (text) {
          const textPart: TextPart = {
            type: "text",
            text: `[Spreadsheet: ${part.filename ?? "data.csv"}]\n${text}`,
          };
          newParts.push(textPart);
        } else {
          newParts.push(part);
        }
        continue;
      }

      newParts.push(part);
    }

    return { ...msg, parts: newParts };
  }));
}

async function excelDataUrlToCsv(dataUrl: string): Promise<string | null> {
  try {
    const XLSX = await import("xlsx");
    const base64 = dataUrl.split(",")[1];
    if (!base64) return null;
    const buffer = Buffer.from(base64, "base64");
    const workbook = XLSX.read(buffer, { type: "buffer" });
    const firstSheet = workbook.SheetNames[0];
    if (!firstSheet) return null;
    return XLSX.utils.sheet_to_csv(workbook.Sheets[firstSheet]);
  } catch {
    return null;
  }
}

function dataUrlToUtf8(dataUrl: string): string | null {
  try {
    const base64 = dataUrl.split(",")[1];
    if (!base64) return null;
    return Buffer.from(base64, "base64").toString("utf-8");
  } catch {
    return null;
  }
}
