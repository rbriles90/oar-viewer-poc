/**
 * UniqueId → dbId mapping module.
 * Resolves Revit UniqueIds to APS Viewer dbIds at model load time.
 */

import type { EquipmentMetadata } from "../../shared/types.js";

/**
 * Build a map from Revit UniqueId to APS Viewer dbId.
 *
 * The APS Viewer stores Revit UniqueIds in element external IDs.
 * We query the model's instance tree to find matching elements.
 */
export async function buildIdMap(
  viewer: Autodesk.Viewing.GuiViewer3D,
  equipment: EquipmentMetadata[],
): Promise<Map<string, number>> {
  const idMap = new Map<string, number>();
  const uniqueIds = new Set(equipment.map((e) => e.uniqueId));

  return new Promise((resolve, reject) => {
    const model = viewer.model;
    if (!model) {
      reject(new Error("No model loaded in viewer"));
      return;
    }

    model.getExternalIdMapping(
      (mapping: Record<string, number>) => {
        for (const [externalId, dbId] of Object.entries(mapping)) {
          if (uniqueIds.has(externalId)) {
            idMap.set(externalId, dbId);
          }
        }

        console.log(`ID mapping complete: ${idMap.size}/${equipment.length} elements resolved`);
        resolve(idMap);
      },
      (error: unknown) => {
        reject(new Error(`Failed to get external ID mapping: ${error}`));
      },
    );
  });
}

/**
 * Look up the dbId for an equipment element by its uniqueId.
 */
export function getDbId(idMap: Map<string, number>, uniqueId: string): number | undefined {
  return idMap.get(uniqueId);
}

/**
 * Look up the dbIds for multiple equipment elements.
 */
export function getDbIds(idMap: Map<string, number>, uniqueIds: string[]): number[] {
  return uniqueIds.map((uid) => idMap.get(uid)).filter((id): id is number => id !== undefined);
}

/**
 * Reverse lookup: find the uniqueId for a given dbId.
 */
export function getUniqueId(idMap: Map<string, number>, dbId: number): string | undefined {
  for (const [uniqueId, mappedDbId] of idMap.entries()) {
    if (mappedDbId === dbId) return uniqueId;
  }
  return undefined;
}
