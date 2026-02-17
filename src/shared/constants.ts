/** View preset mode identifiers */
export const LOTO_MODE = "loto" as const;
export const SUPPLIER_MODE = "supplier" as const;
export const MCC_ISOLATION = "mcc" as const;

/** Color palettes for view presets (RGB 0-1 range for APS Viewer) */
export const PANEL_COLORS: Record<string, [number, number, number]> = {
  "MCP-01": [0.2, 0.6, 1.0],
  "MCP-02": [0.0, 0.4, 0.8],
  "MCC-01": [1.0, 0.4, 0.2],
  "MCC-02": [0.8, 0.2, 0.0],
  "MCC-03": [1.0, 0.6, 0.0],
  default: [0.5, 0.5, 0.5],
};

export const SUPPLIER_COLORS: Record<string, [number, number, number]> = {
  Stadler: [0.2, 0.7, 0.3],
  "Van Dyk": [0.9, 0.3, 0.1],
  Machinex: [0.1, 0.4, 0.9],
  BHS: [0.8, 0.8, 0.0],
  NRT: [0.6, 0.2, 0.8],
  default: [0.5, 0.5, 0.5],
};

/** Highlight color for selected elements */
export const HIGHLIGHT_COLOR: [number, number, number] = [1.0, 0.84, 0.0];

/** Equipment category display labels */
export const CATEGORY_LABELS: Record<string, string> = {
  motor: "Motor",
  conveyor: "Conveyor",
  optic: "Optical Sorter",
};
