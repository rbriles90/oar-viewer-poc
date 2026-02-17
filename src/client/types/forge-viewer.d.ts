/**
 * Minimal type declarations for the Autodesk Platform Services (APS) Viewer.
 * The viewer JS is loaded via CDN, so we declare the global types here.
 *
 * These cover only the APIs used in the OAR Viewer MVP.
 * For full type definitions, see @types/forge-viewer on npm.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

declare namespace THREE {
  class Vector4 {
    constructor(x: number, y: number, z: number, w: number);
    x: number;
    y: number;
    z: number;
    w: number;
  }
}

declare namespace Autodesk {
  namespace Viewing {
    const SELECTION_CHANGED_EVENT: string;

    interface InitializerOptions {
      env: string;
      api?: string;
      getAccessToken: (
        callback: (token: string, expiresInSeconds: number) => void,
      ) => void | Promise<void>;
    }

    function Initializer(options: InitializerOptions, callback: () => void): void;

    namespace Document {
      function load(
        urn: string,
        onSuccess: (doc: ViewerDocument) => void,
        onError: (errorCode: number, errorMsg: string) => void,
      ): void;
    }

    interface ViewerDocument {
      getRoot(): BubbleNode;
    }

    interface BubbleNode {
      getDefaultGeometry(): BubbleNode | null;
    }

    interface Model {
      getExternalIdMapping(
        onSuccess: (mapping: Record<string, number>) => void,
        onError: (error: any) => void,
      ): void;
    }

    class GuiViewer3D {
      constructor(container: HTMLElement, options?: any);
      model: Model;
      start(): number;
      loadDocumentNode(doc: ViewerDocument, node: BubbleNode): Promise<Model>;
      addEventListener(event: string, callback: (event: any) => void): void;
      removeEventListener(event: string, callback: (event: any) => void): void;

      // Visibility
      show(dbIds: number | number[]): void;
      hide(dbIds: number | number[]): void;
      showAll(): void;

      // Isolation
      isolate(dbIds: number[]): void;

      // Navigation
      fitToView(dbIds?: number[]): void;

      // Theming
      setThemingColor(dbId: number, color: THREE.Vector4, model?: Model): void;
      clearThemingColors(model?: Model): void;

      // Selection
      select(dbIds: number[]): void;
      clearSelection(): void;

      // Search
      search(
        text: string,
        onSuccess: (dbIds: number[]) => void,
        onError: (error: any) => void,
        attributeNames?: string[],
      ): void;

      // Properties
      getProperties(
        dbId: number,
        onSuccess: (result: PropertyResult) => void,
        onError?: (error: any) => void,
      ): void;
    }

    interface PropertyResult {
      dbId: number;
      externalId: string;
      name: string;
      properties: Property[];
    }

    interface Property {
      attributeName: string;
      displayCategory: string;
      displayName: string;
      displayValue: string | number;
      hidden: boolean;
      type: number;
      units: string | null;
    }
  }
}
