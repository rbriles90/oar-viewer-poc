/**
 * APS Viewer initialization module.
 * Handles loading the viewer, authenticating, and displaying the model.
 */

export interface ViewerInitOptions {
  containerId: string;
  urn: string;
  getToken: () => Promise<string>;
  onModelLoaded?: (viewer: Autodesk.Viewing.GuiViewer3D) => void;
}

let viewerInstance: Autodesk.Viewing.GuiViewer3D | null = null;

/**
 * Initialize the Autodesk Viewer and load a model.
 */
export async function initViewer(options: ViewerInitOptions): Promise<Autodesk.Viewing.GuiViewer3D> {
  const { containerId, urn, getToken, onModelLoaded } = options;

  return new Promise((resolve, reject) => {
    const initOptions: Autodesk.Viewing.InitializerOptions = {
      env: "AutodeskProduction2",
      api: "streamingV2",
      getAccessToken: async (callback) => {
        try {
          const token = await getToken();
          // APS tokens typically expire in 3600 seconds
          callback(token, 3600);
        } catch (err) {
          console.error("Failed to get access token:", err);
        }
      },
    };

    Autodesk.Viewing.Initializer(initOptions, () => {
      const container = document.getElementById(containerId);
      if (!container) {
        reject(new Error(`Container element #${containerId} not found`));
        return;
      }

      const viewer = new Autodesk.Viewing.GuiViewer3D(container);
      const startResult = viewer.start();
      if (startResult > 0) {
        reject(new Error(`Viewer start failed with code ${startResult}`));
        return;
      }

      viewerInstance = viewer;

      const documentId = `urn:${urn}`;
      Autodesk.Viewing.Document.load(
        documentId,
        (doc) => {
          const defaultModel = doc.getRoot().getDefaultGeometry();
          if (!defaultModel) {
            reject(new Error("No viewable geometry found in the model"));
            return;
          }

          viewer.loadDocumentNode(doc, defaultModel).then(() => {
            onModelLoaded?.(viewer);
            resolve(viewer);
          });
        },
        (errorCode, errorMsg) => {
          reject(new Error(`Document load failed (${errorCode}): ${errorMsg}`));
        },
      );
    });
  });
}

/**
 * Get the current viewer instance.
 */
export function getViewer(): Autodesk.Viewing.GuiViewer3D | null {
  return viewerInstance;
}
