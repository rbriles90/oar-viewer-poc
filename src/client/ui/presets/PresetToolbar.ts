/**
 * View Preset Toolbar.
 * Provides LOTO, Supplier, and MCC Panel view mode buttons.
 */

import type { EquipmentMetadata, ViewPresetMode } from "../../../shared/types.js";
import { applyViewPreset, clearRules } from "../../rules/engine.js";
import { resetScene } from "../../viewer/scene.js";

export interface PresetToolbarOptions {
  container: HTMLElement;
  equipment: EquipmentMetadata[];
  idMap: Map<string, number>;
  viewer: Autodesk.Viewing.GuiViewer3D;
}

export class PresetToolbar {
  private container: HTMLElement;
  private equipment: EquipmentMetadata[];
  private idMap: Map<string, number>;
  private viewer: Autodesk.Viewing.GuiViewer3D;
  private activeMode: ViewPresetMode | null = null;
  private el!: HTMLElement;

  constructor(options: PresetToolbarOptions) {
    this.container = options.container;
    this.equipment = options.equipment;
    this.idMap = options.idMap;
    this.viewer = options.viewer;
    this.render();
  }

  private render() {
    this.el = document.createElement("div");
    this.el.className = "oar-preset-toolbar";

    // Get unique values for dropdowns
    const panels = [...new Set(this.equipment.filter((e) => !e.buildingFlag).map((e) => e.panel))];
    const suppliers = [
      ...new Set(this.equipment.filter((e) => !e.buildingFlag).map((e) => e.supplier)),
    ];

    this.el.innerHTML = `
      <div class="oar-preset-group">
        <button class="oar-preset-btn" data-mode="loto" title="Color by panel — replaces lockout drawings">
          <span class="oar-preset-icon">&#x1f512;</span>
          LOTO
        </button>
      </div>

      <div class="oar-preset-group">
        <button class="oar-preset-btn" data-mode="supplier" title="Color by supplier">
          <span class="oar-preset-icon">&#x1f3ed;</span>
          Supplier
        </button>
        <select class="oar-preset-filter" data-mode="supplier" style="display:none">
          <option value="">All Suppliers</option>
          ${suppliers.map((s) => `<option value="${s}">${s}</option>`).join("")}
        </select>
      </div>

      <div class="oar-preset-group">
        <button class="oar-preset-btn" data-mode="mcc" title="Isolate equipment by MCC panel">
          <span class="oar-preset-icon">&#x26a1;</span>
          MCC Panel
        </button>
        <select class="oar-preset-filter" data-mode="mcc" style="display:none">
          <option value="">Select Panel</option>
          ${panels.map((p) => `<option value="${p}">${p}</option>`).join("")}
        </select>
      </div>

      <div class="oar-preset-group">
        <button class="oar-preset-btn oar-reset-btn" data-mode="reset" title="Reset to default view">
          <span class="oar-preset-icon">&#x21ba;</span>
          Reset
        </button>
      </div>
    `;

    // Preset button listeners
    this.el.querySelectorAll<HTMLButtonElement>(".oar-preset-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const mode = btn.dataset.mode as ViewPresetMode | "reset";
        if (mode === "reset") {
          this.reset();
        } else {
          this.toggleMode(mode);
        }
      });
    });

    // Filter dropdown listeners
    this.el.querySelectorAll<HTMLSelectElement>(".oar-preset-filter").forEach((select) => {
      select.addEventListener("change", () => {
        const mode = select.dataset.mode as ViewPresetMode;
        if (this.activeMode === mode) {
          applyViewPreset(this.viewer, mode, this.equipment, this.idMap, select.value || undefined);
        }
      });
    });

    this.container.appendChild(this.el);
  }

  private toggleMode(mode: ViewPresetMode) {
    if (this.activeMode === mode) {
      this.reset();
      return;
    }

    this.activeMode = mode;

    // Update button states
    this.el.querySelectorAll<HTMLButtonElement>(".oar-preset-btn").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.mode === mode);
    });

    // Show/hide relevant filter dropdown
    this.el.querySelectorAll<HTMLSelectElement>(".oar-preset-filter").forEach((select) => {
      const visible = select.dataset.mode === mode && (mode === "supplier" || mode === "mcc");
      select.style.display = visible ? "block" : "none";
    });

    // Apply the preset
    const filter = this.el.querySelector<HTMLSelectElement>(
      `.oar-preset-filter[data-mode="${mode}"]`,
    );
    const filterValue = filter?.value || undefined;
    applyViewPreset(this.viewer, mode, this.equipment, this.idMap, filterValue);
  }

  private reset() {
    this.activeMode = null;
    clearRules(this.viewer);
    resetScene(this.viewer, this.equipment, this.idMap);

    this.el.querySelectorAll<HTMLButtonElement>(".oar-preset-btn").forEach((btn) => {
      btn.classList.remove("active");
    });
    this.el.querySelectorAll<HTMLSelectElement>(".oar-preset-filter").forEach((select) => {
      select.style.display = "none";
      select.value = "";
    });
  }

  update(equipment: EquipmentMetadata[], idMap: Map<string, number>) {
    this.equipment = equipment;
    this.idMap = idMap;
  }
}
