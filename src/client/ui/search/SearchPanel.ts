/**
 * Preset Search Panel.
 * Provides conveyor, motor, and optic search modes.
 */

import type { EquipmentMetadata, SearchMode } from "../../../shared/types.js";
import { CATEGORY_LABELS } from "../../../shared/constants.js";
import { highlightElement } from "../../rules/engine.js";

export interface SearchPanelOptions {
  container: HTMLElement;
  equipment: EquipmentMetadata[];
  idMap: Map<string, number>;
  viewer: Autodesk.Viewing.GuiViewer3D;
  onSelect?: (item: EquipmentMetadata) => void;
}

export class SearchPanel {
  private container: HTMLElement;
  private equipment: EquipmentMetadata[];
  private idMap: Map<string, number>;
  private viewer: Autodesk.Viewing.GuiViewer3D;
  private onSelect?: (item: EquipmentMetadata) => void;
  private currentMode: SearchMode = "conveyor";
  private el!: HTMLElement;

  constructor(options: SearchPanelOptions) {
    this.container = options.container;
    this.equipment = options.equipment;
    this.idMap = options.idMap;
    this.viewer = options.viewer;
    this.onSelect = options.onSelect;
    this.render();
  }

  private render() {
    this.el = document.createElement("div");
    this.el.className = "oar-search-panel";
    this.el.innerHTML = `
      <div class="oar-search-header">
        <h3>Search Equipment</h3>
        <div class="oar-search-modes">
          <button class="oar-mode-btn active" data-mode="conveyor">Conveyors</button>
          <button class="oar-mode-btn" data-mode="motor">Motors</button>
          <button class="oar-mode-btn" data-mode="optic">Optics</button>
        </div>
      </div>
      <div class="oar-search-input-wrap">
        <input type="text" class="oar-search-input" placeholder="Search ${CATEGORY_LABELS[this.currentMode]}s..." />
      </div>
      <div class="oar-search-results"></div>
    `;

    // Mode tab listeners
    this.el.querySelectorAll<HTMLButtonElement>(".oar-mode-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        this.setMode(btn.dataset.mode as SearchMode);
      });
    });

    // Search input listener
    const input = this.el.querySelector<HTMLInputElement>(".oar-search-input")!;
    input.addEventListener("input", () => {
      this.search(input.value);
    });

    this.container.appendChild(this.el);
    this.search("");
  }

  private setMode(mode: SearchMode) {
    this.currentMode = mode;

    this.el.querySelectorAll<HTMLButtonElement>(".oar-mode-btn").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.mode === mode);
    });

    const input = this.el.querySelector<HTMLInputElement>(".oar-search-input")!;
    input.placeholder = `Search ${CATEGORY_LABELS[mode]}s...`;
    input.value = "";
    this.search("");
  }

  private search(query: string) {
    const lowerQuery = query.toLowerCase().trim();

    const results = this.equipment
      .filter((e) => e.category === this.currentMode)
      .filter((e) => !lowerQuery || e.equipmentTag.toLowerCase().includes(lowerQuery))
      .slice(0, 50); // limit results for performance

    const resultsEl = this.el.querySelector<HTMLElement>(".oar-search-results")!;
    resultsEl.innerHTML = "";

    if (results.length === 0) {
      resultsEl.innerHTML = '<div class="oar-no-results">No equipment found</div>';
      return;
    }

    for (const item of results) {
      const row = document.createElement("button");
      row.className = "oar-search-result";
      row.innerHTML = `
        <span class="oar-result-tag">${item.equipmentTag}</span>
        <span class="oar-result-meta">${item.panel}</span>
      `;

      row.addEventListener("click", () => this.selectItem(item));
      resultsEl.appendChild(row);
    }
  }

  private selectItem(item: EquipmentMetadata) {
    const dbId = this.idMap.get(item.uniqueId);
    if (dbId !== undefined) {
      highlightElement(this.viewer, dbId);
    }
    this.onSelect?.(item);
  }

  /** Update equipment data (e.g., after metadata reload) */
  update(equipment: EquipmentMetadata[], idMap: Map<string, number>) {
    this.equipment = equipment;
    this.idMap = idMap;
    const input = this.el.querySelector<HTMLInputElement>(".oar-search-input")!;
    this.search(input.value);
  }
}
