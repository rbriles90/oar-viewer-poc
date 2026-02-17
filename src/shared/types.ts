/** Equipment categories in the OAR system */
export type EquipmentCategory = "motor" | "conveyor" | "optic";

/** Relationship links between equipment */
export interface EquipmentRelationships {
  feedsTo?: string;
  controlledBy?: string;
}

/** Metadata for a single equipment element, exported from Revit */
export interface EquipmentMetadata {
  uniqueId: string;
  equipmentTag: string;
  category: EquipmentCategory;
  panel: string;
  supplier: string;
  buildingFlag: boolean;
  lotoReference?: string;
  relationships?: EquipmentRelationships;
}

/** Full project metadata file */
export interface ProjectMetadata {
  projectName: string;
  exportDate: string;
  equipment: EquipmentMetadata[];
}

/** Preset search mode types */
export type SearchMode = "conveyor" | "motor" | "optic";

/** View preset mode types */
export type ViewPresetMode = "loto" | "supplier" | "mcc";

/** Resolved mapping from Revit UniqueId to APS Viewer dbId */
export interface IdMapping {
  uniqueId: string;
  dbId: number;
}

/** APS authentication token response */
export interface ApsToken {
  access_token: string;
  expires_in: number;
}

/** APS model URN info */
export interface ModelInfo {
  urn: string;
  name: string;
}
