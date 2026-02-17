/**
 * Visual Rule Engine.
 * Applies coloring, isolation, and highlighting based on metadata.
 */

import type { EquipmentMetadata } from "../../shared/types.js";
import type { ViewPresetMode } from "../../shared/types.js";
import { PANEL_COLORS, SUPPLIER_COLORS, HIGHLIGHT_COLOR } from "../../shared/constants.js";

/**
 * Apply a view preset mode to the viewer.
 */
export function applyViewPreset(
  viewer: Autodesk.Viewing.GuiViewer3D,
  mode: ViewPresetMode,
  equipment: EquipmentMetadata[],
  idMap: Map<string, number>,
  filterValue?: string,
) {
  // Clear previous theming
  viewer.clearThemingColors();

  switch (mode) {
    case "loto":
      applyLotoMode(viewer, equipment, idMap);
      break;
    case "supplier":
      applySupplierMode(viewer, equipment, idMap, filterValue);
      break;
    case "mcc":
      applyMccIsolation(viewer, equipment, idMap, filterValue);
      break;
  }
}

/**
 * LOTO Mode: Color equipment by panel (MCP/MCC).
 */
function applyLotoMode(
  viewer: Autodesk.Viewing.GuiViewer3D,
  equipment: EquipmentMetadata[],
  idMap: Map<string, number>,
) {
  viewer.isolate([]);
  viewer.showAll();

  for (const item of equipment) {
    if (item.buildingFlag) continue;

    const dbId = idMap.get(item.uniqueId);
    if (dbId === undefined) continue;

    const colorKey = item.panel in PANEL_COLORS ? item.panel : "default";
    const [r, g, b] = PANEL_COLORS[colorKey];
    const color = new THREE.Vector4(r, g, b, 1);
    viewer.setThemingColor(dbId, color);
  }
}

/**
 * Supplier Mode: Color equipment by supplier.
 * Optionally filter to a single supplier.
 */
function applySupplierMode(
  viewer: Autodesk.Viewing.GuiViewer3D,
  equipment: EquipmentMetadata[],
  idMap: Map<string, number>,
  supplierFilter?: string,
) {
  const filteredEquipment = supplierFilter
    ? equipment.filter(
        (e) => e.supplier.toLowerCase() === supplierFilter.toLowerCase() && !e.buildingFlag,
      )
    : equipment.filter((e) => !e.buildingFlag);

  if (supplierFilter) {
    const dbIds = filteredEquipment
      .map((e) => idMap.get(e.uniqueId))
      .filter((id): id is number => id !== undefined);
    viewer.isolate(dbIds);
  }

  for (const item of filteredEquipment) {
    const dbId = idMap.get(item.uniqueId);
    if (dbId === undefined) continue;

    const colorKey = item.supplier in SUPPLIER_COLORS ? item.supplier : "default";
    const [r, g, b] = SUPPLIER_COLORS[colorKey];
    const color = new THREE.Vector4(r, g, b, 1);
    viewer.setThemingColor(dbId, color);
  }
}

/**
 * MCC Panel Isolation: Highlight equipment controlled by a specific panel.
 */
function applyMccIsolation(
  viewer: Autodesk.Viewing.GuiViewer3D,
  equipment: EquipmentMetadata[],
  idMap: Map<string, number>,
  panelFilter?: string,
) {
  if (!panelFilter) return;

  const controlled = equipment.filter(
    (e) => e.panel.toLowerCase() === panelFilter.toLowerCase() && !e.buildingFlag,
  );

  const dbIds = controlled
    .map((e) => idMap.get(e.uniqueId))
    .filter((id): id is number => id !== undefined);

  viewer.isolate(dbIds);

  const [r, g, b] = HIGHLIGHT_COLOR;
  const color = new THREE.Vector4(r, g, b, 1);
  for (const dbId of dbIds) {
    viewer.setThemingColor(dbId, color);
  }
}

/**
 * Highlight a single element: zoom, isolate, and apply highlight color.
 */
export function highlightElement(
  viewer: Autodesk.Viewing.GuiViewer3D,
  dbId: number,
  isolate = true,
) {
  if (isolate) {
    viewer.isolate([dbId]);
  }

  viewer.fitToView([dbId]);

  const [r, g, b] = HIGHLIGHT_COLOR;
  const color = new THREE.Vector4(r, g, b, 1);
  viewer.setThemingColor(dbId, color);
}

/**
 * Clear all visual rules and return to neutral state.
 */
export function clearRules(viewer: Autodesk.Viewing.GuiViewer3D) {
  viewer.clearThemingColors();
  viewer.isolate([]);
  viewer.showAll();
}
