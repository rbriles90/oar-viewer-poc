/**
 * Process Flow Diagram (PFD) Navigator.
 * Renders a clickable PFD overlay that links to 3D equipment.
 *
 * The PFD is the primary navigation tool in the MVP — users click
 * conveyor tags on the diagram to fly to the corresponding 3D element.
 */

import type { EquipmentMetadata } from "../../../shared/types.js";
import { highlightElement } from "../../rules/engine.js";

export interface PfdConfig {
  /** URL or path to the PFD image */
  imageUrl: string;
  /** Clickable hotspot regions mapped to equipment tags */
  hotspots: PfdHotspot[];
}

export interface PfdHotspot {
  /** Equipment tag (e.g., CON-00182) */
  tag: string;
  /** Position as percentage of image dimensions */
  x: number;
  y: number;
  /** Hotspot size as percentage of image dimensions */
  width: number;
  height: number;
}

export interface PfdNavigatorOptions {
  container: HTMLElement;
  config: PfdConfig;
  equipment: EquipmentMetadata[];
  idMap: Map<string, number>;
  viewer: Autodesk.Viewing.GuiViewer3D;
  onSelect?: (item: EquipmentMetadata) => void;
}

export class PfdNavigator {
  private container: HTMLElement;
  private config: PfdConfig;
  private tagMap: Map<string, EquipmentMetadata>;
  private idMap: Map<string, number>;
  private viewer: Autodesk.Viewing.GuiViewer3D;
  private onSelect?: (item: EquipmentMetadata) => void;
  private el!: HTMLElement;
  private isOpen = false;

  constructor(options: PfdNavigatorOptions) {
    this.container = options.container;
    this.config = options.config;
    this.idMap = options.idMap;
    this.viewer = options.viewer;
    this.onSelect = options.onSelect;
    this.tagMap = new Map(options.equipment.map((e) => [e.equipmentTag, e]));
    this.render();
  }

  private render() {
    this.el = document.createElement("div");
    this.el.className = "oar-pfd-navigator";

    this.el.innerHTML = `
      <button class="oar-pfd-toggle" title="Toggle Process Flow Diagram">
        <span class="oar-pfd-icon">&#x1f5fa;</span>
        PFD
      </button>
      <div class="oar-pfd-overlay" style="display:none">
        <div class="oar-pfd-header">
          <h3>Process Flow Diagram</h3>
          <button class="oar-pfd-close" title="Close">&times;</button>
        </div>
        <div class="oar-pfd-content">
          <div class="oar-pfd-image-wrap">
            <img class="oar-pfd-image" src="${this.config.imageUrl}" alt="Process Flow Diagram" />
            <div class="oar-pfd-hotspots"></div>
          </div>
        </div>
      </div>
    `;

    // Toggle button
    this.el.querySelector(".oar-pfd-toggle")!.addEventListener("click", () => {
      this.toggle();
    });

    // Close button
    this.el.querySelector(".oar-pfd-close")!.addEventListener("click", () => {
      this.close();
    });

    // Render hotspots
    this.renderHotspots();

    this.container.appendChild(this.el);
  }

  private renderHotspots() {
    const hotspotsEl = this.el.querySelector<HTMLElement>(".oar-pfd-hotspots")!;
    hotspotsEl.innerHTML = "";

    for (const hotspot of this.config.hotspots) {
      const btn = document.createElement("button");
      btn.className = "oar-pfd-hotspot";
      btn.title = hotspot.tag;
      btn.textContent = hotspot.tag;
      btn.style.left = `${hotspot.x}%`;
      btn.style.top = `${hotspot.y}%`;
      btn.style.width = `${hotspot.width}%`;
      btn.style.height = `${hotspot.height}%`;

      btn.addEventListener("click", () => {
        this.navigateToTag(hotspot.tag);
      });

      hotspotsEl.appendChild(btn);
    }
  }

  private navigateToTag(tag: string) {
    const item = this.tagMap.get(tag);
    if (!item) {
      console.warn(`PFD: No equipment found for tag "${tag}"`);
      return;
    }

    const dbId = this.idMap.get(item.uniqueId);
    if (dbId === undefined) {
      console.warn(`PFD: No dbId resolved for tag "${tag}" (uniqueId: ${item.uniqueId})`);
      return;
    }

    highlightElement(this.viewer, dbId);
    this.onSelect?.(item);
  }

  toggle() {
    this.isOpen = !this.isOpen;
    const overlay = this.el.querySelector<HTMLElement>(".oar-pfd-overlay")!;
    overlay.style.display = this.isOpen ? "flex" : "none";
    this.el.querySelector(".oar-pfd-toggle")!.classList.toggle("active", this.isOpen);
  }

  open() {
    if (!this.isOpen) this.toggle();
  }

  close() {
    if (this.isOpen) this.toggle();
  }

  update(equipment: EquipmentMetadata[], idMap: Map<string, number>) {
    this.idMap = idMap;
    this.tagMap = new Map(equipment.map((e) => [e.equipmentTag, e]));
  }
}
