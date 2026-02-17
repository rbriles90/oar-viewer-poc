/**
 * Metadata Display Panel.
 * Shows equipment details when an element is selected.
 */

import type { EquipmentMetadata } from "../../../shared/types.js";
import { CATEGORY_LABELS } from "../../../shared/constants.js";

export interface MetadataPanelOptions {
  container: HTMLElement;
  equipment: EquipmentMetadata[];
  onNavigate?: (uniqueId: string) => void;
}

export class MetadataPanel {
  private container: HTMLElement;
  private equipmentMap: Map<string, EquipmentMetadata>;
  private onNavigate?: (uniqueId: string) => void;
  private el!: HTMLElement;

  constructor(options: MetadataPanelOptions) {
    this.container = options.container;
    this.onNavigate = options.onNavigate;
    this.equipmentMap = new Map(options.equipment.map((e) => [e.uniqueId, e]));
    this.render();
  }

  private render() {
    this.el = document.createElement("div");
    this.el.className = "oar-metadata-panel";
    this.el.innerHTML = `
      <div class="oar-metadata-header">
        <h3>Equipment Details</h3>
        <button class="oar-metadata-close" title="Close">&times;</button>
      </div>
      <div class="oar-metadata-content">
        <div class="oar-metadata-empty">Select an element to view details</div>
      </div>
    `;

    this.el.querySelector(".oar-metadata-close")!.addEventListener("click", () => {
      this.clear();
    });

    this.container.appendChild(this.el);
  }

  /** Show metadata for a given equipment item */
  show(item: EquipmentMetadata) {
    this.el.classList.add("visible");

    const content = this.el.querySelector<HTMLElement>(".oar-metadata-content")!;
    content.innerHTML = `
      <div class="oar-meta-field">
        <label>Equipment Tag</label>
        <span class="oar-meta-value oar-meta-tag">${item.equipmentTag}</span>
      </div>
      <div class="oar-meta-field">
        <label>Category</label>
        <span class="oar-meta-value">${CATEGORY_LABELS[item.category] || item.category}</span>
      </div>
      <div class="oar-meta-field">
        <label>Panel</label>
        <span class="oar-meta-value">${item.panel}</span>
      </div>
      <div class="oar-meta-field">
        <label>Supplier</label>
        <span class="oar-meta-value">${item.supplier}</span>
      </div>
      ${item.lotoReference ? `
      <div class="oar-meta-field">
        <label>LOTO Reference</label>
        <span class="oar-meta-value">${item.lotoReference}</span>
      </div>` : ""}
      ${this.renderRelationships(item)}
    `;
  }

  /** Show metadata for an equipment element identified by uniqueId */
  showByUniqueId(uniqueId: string) {
    const item = this.equipmentMap.get(uniqueId);
    if (item) {
      this.show(item);
    }
  }

  private renderRelationships(item: EquipmentMetadata): string {
    if (!item.relationships) return "";

    const parts: string[] = [];

    if (item.relationships.feedsTo) {
      const target = this.equipmentMap.get(item.relationships.feedsTo);
      if (target) {
        parts.push(`
          <div class="oar-meta-field">
            <label>Feeds To</label>
            <button class="oar-meta-link" data-uid="${target.uniqueId}">
              ${target.equipmentTag}
            </button>
          </div>
        `);
      }
    }

    if (item.relationships.controlledBy) {
      const target = this.equipmentMap.get(item.relationships.controlledBy);
      if (target) {
        parts.push(`
          <div class="oar-meta-field">
            <label>Controlled By</label>
            <button class="oar-meta-link" data-uid="${target.uniqueId}">
              ${target.equipmentTag}
            </button>
          </div>
        `);
      }
    }

    if (parts.length === 0) return "";

    // After rendering, attach click handlers (done via event delegation in parent)
    setTimeout(() => {
      this.el.querySelectorAll<HTMLButtonElement>(".oar-meta-link").forEach((btn) => {
        btn.addEventListener("click", () => {
          const uid = btn.dataset.uid;
          if (uid) this.onNavigate?.(uid);
        });
      });
    }, 0);

    return `<div class="oar-meta-relationships"><label>Relationships</label>${parts.join("")}</div>`;
  }

  /** Clear the panel */
  clear() {
    this.el.classList.remove("visible");
    const content = this.el.querySelector<HTMLElement>(".oar-metadata-content")!;
    content.innerHTML = '<div class="oar-metadata-empty">Select an element to view details</div>';
  }

  /** Update the equipment data */
  update(equipment: EquipmentMetadata[]) {
    this.equipmentMap = new Map(equipment.map((e) => [e.uniqueId, e]));
  }
}
