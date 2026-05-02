import type { AspectRatio, ImageModel, StylePreset } from "./types";

export const CHAT_MODELS = [
  { id: "gemini-2.5-flash", label: "Flash" },
  { id: "gemini-2.5-pro", label: "Pro" },
] as const;

export type ChatModelId = (typeof CHAT_MODELS)[number]["id"];

const CHAT_MODEL_IDS = new Set<string>(CHAT_MODELS.map((m) => m.id));

export function isValidChatModel(model: string): model is ChatModelId {
  return CHAT_MODEL_IDS.has(model);
}

export const IMAGE_STYLE_PRESETS: StylePreset[] = [
  { id: "none", label: "None", promptSuffix: "" },
  {
    id: "photorealistic",
    label: "Photorealistic",
    promptSuffix: ", photorealistic, ultra-detailed, 8k resolution",
  },
  {
    id: "digital-art",
    label: "Digital Art",
    promptSuffix: ", digital art, vibrant colors, detailed illustration",
  },
  {
    id: "oil-painting",
    label: "Oil Painting",
    promptSuffix: ", oil painting style, rich textures, classical art",
  },
  {
    id: "watercolor",
    label: "Watercolor",
    promptSuffix: ", watercolor painting, soft washes, artistic",
  },
  {
    id: "anime",
    label: "Anime",
    promptSuffix: ", anime style, cel shading, Japanese animation",
  },
  {
    id: "pixel-art",
    label: "Pixel Art",
    promptSuffix: ", pixel art style, retro, 16-bit",
  },
  {
    id: "fantasy",
    label: "Fantasy",
    promptSuffix: ", fantasy art, epic, magical, detailed illustration",
  },
];

export const IMAGE_MODELS: {
  value: ImageModel;
  label: string;
  description: string;
}[] = [
  {
    value: "gemini-2.5-flash-image",
    label: "Gemini Flash",
    description: "Fast generation, good quality",
  },
  {
    value: "gemini-3-pro-image-preview",
    label: "Gemini Pro",
    description: "Higher quality, slower",
  },
];

export const ASPECT_RATIOS: { value: AspectRatio; label: string }[] = [
  { value: "1:1", label: "1:1 (Square)" },
  { value: "3:4", label: "3:4 (Portrait)" },
  { value: "4:3", label: "4:3 (Landscape)" },
  { value: "9:16", label: "9:16 (Tall)" },
  { value: "16:9", label: "16:9 (Wide)" },
  { value: "2:3", label: "2:3" },
  { value: "3:2", label: "3:2" },
  { value: "4:5", label: "4:5" },
  { value: "5:4", label: "5:4" },
  { value: "21:9", label: "21:9 (Ultrawide)" },
];
