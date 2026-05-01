export type IconLibraryName =
  | "lucide"
  | "tabler"
  | "hugeicons"
  | "phosphor"
  | "remixicon"

export type StyleName =
  | "nova"
  | "vega"
  | "maia"
  | "lyra"
  | "mira"
  | "luma"
  | "sera"

export type FontValue = "inter" | "geist" | "manrope" | "outfit"

export type DesignSystemParams = {
  style: StyleName
  iconLibrary: IconLibraryName
  font: FontValue
  fontHeading: "inherit" | FontValue
  pointer: boolean
  rtl: boolean
}

export const DESIGN_SYSTEM_DEFAULTS: DesignSystemParams = {
  style: "mira",
  iconLibrary: "hugeicons",
  font: "inter",
  fontHeading: "inherit",
  pointer: true,
  rtl: true,
}

export function useDesignSystemSearchParams(): [DesignSystemParams] {
  return [DESIGN_SYSTEM_DEFAULTS]
}

export const STYLES = [
  { name: "nova", title: "Nova" },
  { name: "vega", title: "Vega" },
  { name: "maia", title: "Maia" },
  { name: "lyra", title: "Lyra" },
  { name: "mira", title: "Mira" },
  { name: "luma", title: "Luma" },
  { name: "sera", title: "Sera" },
] as const

export const FONTS = [
  { value: "inter", name: "Inter", className: "font-sans" },
  { value: "geist", name: "Geist", className: "font-sans" },
  { value: "manrope", name: "Manrope", className: "font-sans" },
  { value: "outfit", name: "Outfit", className: "font-sans" },
] as const
