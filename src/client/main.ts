/**
 * OAR Digital Twin Viewer — Main Application Entry Point.
 *
 * Wires together: APS Viewer, metadata loading, ID mapping,
 * search panel, metadata panel, preset toolbar, PFD navigation,
 * and building toggle.
 */

import type { EquipmentMetadata, ProjectMetadata } from "../shared/types.js";
import type { PfdConfig } from "./ui/pfd/PfdNavigator.js";
import { initViewer, getViewer } from "./viewer/init.js";
import { buildIdMap, getUniqueId } from "./mapping/idMapper.js";
import { applyDefaultScene, toggleBuilding } from "./viewer/scene.js";
import { highlightElement } from "./rules/engine.js";
import { SearchPanel } from "./ui/search/SearchPanel.js";
import { MetadataPanel } from "./ui/metadata/MetadataPanel.js";
import { PresetToolbar } from "./ui/presets/PresetToolbar.js";
import { PfdNavigator } from "./ui/pfd/PfdNavigator.js";
import "./styles/main.css";

/** Application state */
interface AppState {
  equipment: EquipmentMetadata[];
  idMap: Map<string, number>;
  buildingVisible: boolean;
}

const state: AppState = {
  equipment: [],
  idMap: new Map(),
  buildingVisible: false,
};

/**
 * Fetch a viewer token from the backend.
 */
async function fetchToken(): Promise<string> {
  const response = await fetch("/api/auth/token");
  if (!response.ok) throw new Error("Failed to fetch viewer token");
  const data = await response.json();
  return data.access_token;
}

/**
 * Fetch the model URN from the backend.
 */
async function fetchModelUrn(): Promise<string> {
  const response = await fetch("/api/models");
  if (!response.ok) throw new Error("Failed to fetch model info");
  const data = await response.json();
  return data.urn;
}

/**
 * Fetch project metadata from the backend.
 */
async function fetchMetadata(): Promise<ProjectMetadata> {
  const response = await fetch("/api/metadata");
  if (!response.ok) throw new Error("Failed to fetch metadata");
  return response.json();
}

/**
 * Fetch PFD configuration.
 */
async function fetchPfdConfig(): Promise<PfdConfig> {
  const response = await fetch("/data/pfd-config.json");
  if (!response.ok) throw new Error("Failed to fetch PFD config");
  return response.json();
}

/**
 * Set up the building visibility toggle button.
 */
function setupBuildingToggle() {
  const btn = document.getElementById("building-toggle");
  if (!btn) return;

  btn.addEventListener("click", () => {
    const viewer = getViewer();
    if (!viewer) return;

    state.buildingVisible = !state.buildingVisible;
    toggleBuilding(viewer, state.equipment, state.idMap, state.buildingVisible);
    btn.textContent = state.buildingVisible ? "Hide Building" : "Show Building";
    btn.classList.toggle("active", state.buildingVisible);
  });
}

/**
 * Set up selection event: when a user clicks on an element in the 3D view,
 * show its metadata in the panel.
 */
function setupSelectionHandler(
  viewer: Autodesk.Viewing.GuiViewer3D,
  metadataPanel: MetadataPanel,
) {
  viewer.addEventListener(Autodesk.Viewing.SELECTION_CHANGED_EVENT, (event: { dbIdArray: number[] }) => {
    if (event.dbIdArray.length === 0) {
      metadataPanel.clear();
      return;
    }

    const dbId = event.dbIdArray[0];
    const uniqueId = getUniqueId(state.idMap, dbId);
    if (uniqueId) {
      metadataPanel.showByUniqueId(uniqueId);
    } else {
      metadataPanel.clear();
    }
  });
}

/**
 * Show a status message in the loading overlay.
 */
function setStatus(message: string) {
  const el = document.getElementById("loading-status");
  if (el) el.textContent = message;
}

/**
 * Hide the loading overlay.
 */
function hideLoading() {
  const el = document.getElementById("loading-overlay");
  if (el) el.style.display = "none";
}

/**
 * Show an error message.
 */
function showError(message: string) {
  const el = document.getElementById("loading-status");
  if (el) {
    el.textContent = message;
    el.classList.add("error");
  }
}

/**
 * Main application boot sequence.
 */
async function boot() {
  try {
    setStatus("Authenticating...");
    const [urn, metadata, pfdConfig] = await Promise.all([
      fetchModelUrn(),
      fetchMetadata(),
      fetchPfdConfig(),
    ]);

    state.equipment = metadata.equipment;

    setStatus("Loading 3D model...");
    const viewer = await initViewer({
      containerId: "viewer-container",
      urn,
      getToken: fetchToken,
      onModelLoaded: () => {
        console.log("Model loaded successfully");
      },
    });

    setStatus("Mapping equipment...");
    state.idMap = await buildIdMap(viewer, state.equipment);

    setStatus("Configuring scene...");
    applyDefaultScene(viewer, state.equipment, state.idMap);

    // --- Wire up UI components ---

    const sidebarEl = document.getElementById("sidebar")!;
    const metadataEl = document.getElementById("metadata-container")!;
    const toolbarEl = document.getElementById("preset-toolbar")!;
    const pfdEl = document.getElementById("pfd-container")!;

    // Metadata panel (shared callback target)
    const metadataPanel = new MetadataPanel({
      container: metadataEl,
      equipment: state.equipment,
      onNavigate: (uniqueId) => {
        const dbId = state.idMap.get(uniqueId);
        if (dbId !== undefined) {
          highlightElement(viewer, dbId);
          metadataPanel.showByUniqueId(uniqueId);
        }
      },
    });

    // Search panel
    new SearchPanel({
      container: sidebarEl,
      equipment: state.equipment,
      idMap: state.idMap,
      viewer,
      onSelect: (item) => metadataPanel.show(item),
    });

    // Preset toolbar
    new PresetToolbar({
      container: toolbarEl,
      equipment: state.equipment,
      idMap: state.idMap,
      viewer,
    });

    // PFD navigator
    new PfdNavigator({
      container: pfdEl,
      config: pfdConfig,
      equipment: state.equipment,
      idMap: state.idMap,
      viewer,
      onSelect: (item) => metadataPanel.show(item),
    });

    // Building toggle
    setupBuildingToggle();

    // 3D selection → metadata panel
    setupSelectionHandler(viewer, metadataPanel);

    hideLoading();
    console.log("OAR Digital Twin Viewer ready");
  } catch (err) {
    console.error("Boot failed:", err);
    showError(`Failed to load: ${err instanceof Error ? err.message : err}`);
  }
}

// Start the application
boot();
