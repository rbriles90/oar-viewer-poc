/**
 * Default scene configuration.
 * Controls building visibility and equipment display on load.
 */

import type { EquipmentMetadata } from "../../shared/types.js";

/**
 * Apply the default scene configuration:
 * - Hide building geometry (elements with buildingFlag=true)
 * - Show equipment only
 */
export function applyDefaultScene(
  viewer: Autodesk.Viewing.GuiViewer3D,
  equipment: EquipmentMetadata[],
  idMap: Map<string, number>,
) {
  const buildingDbIds = equipment
    .filter((e) => e.buildingFlag)
    .map((e) => idMap.get(e.uniqueId))
    .filter((id): id is number => id !== undefined);

  if (buildingDbIds.length > 0) {
    viewer.hide(buildingDbIds);
  }
}

/**
 * Toggle building geometry visibility.
 */
export function toggleBuilding(
  viewer: Autodesk.Viewing.GuiViewer3D,
  equipment: EquipmentMetadata[],
  idMap: Map<string, number>,
  show: boolean,
) {
  const buildingDbIds = equipment
    .filter((e) => e.buildingFlag)
    .map((e) => idMap.get(e.uniqueId))
    .filter((id): id is number => id !== undefined);

  if (buildingDbIds.length === 0) return;

  if (show) {
    viewer.show(buildingDbIds);
  } else {
    viewer.hide(buildingDbIds);
  }
}

/**
 * Reset the viewer to the default state:
 * - Show all elements
 * - Clear isolation
 * - Clear theming colors
 * - Re-hide building
 */
export function resetScene(
  viewer: Autodesk.Viewing.GuiViewer3D,
  equipment: EquipmentMetadata[],
  idMap: Map<string, number>,
) {
  viewer.showAll();
  viewer.isolate([]);
  viewer.clearThemingColors();
  applyDefaultScene(viewer, equipment, idMap);
}
