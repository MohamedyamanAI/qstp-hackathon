export type AspectRatio =
  | "1:1"
  | "3:4"
  | "4:3"
  | "9:16"
  | "16:9"
  | "2:3"
  | "3:2"
  | "4:5"
  | "5:4"
  | "21:9";

export type ImageModel = "gemini-2.5-flash-image" | "gemini-3-pro-image-preview";

export type GenerationMode = "generate" | "edit";

export type StylePreset = {
  id: string;
  label: string;
  promptSuffix: string;
};
