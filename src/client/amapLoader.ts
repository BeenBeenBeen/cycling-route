export type AmapMap = {
  addControl?: (control: unknown) => void;
  setFitView?: (overlays?: unknown[], immediately?: boolean, padding?: number[]) => void;
  destroy?: () => void;
};

export type AmapOverlay = {
  setMap?: (map: AmapMap | null) => void;
};

export type AmapNamespace = {
  Map: new (container: HTMLElement, options: Record<string, unknown>) => AmapMap;
  Marker: new (options: Record<string, unknown>) => AmapOverlay;
  Polyline: new (options: Record<string, unknown>) => AmapOverlay;
  Scale?: new () => unknown;
  ToolBar?: new () => unknown;
};

declare global {
  interface Window {
    AMap?: AmapNamespace;
  }
}

let amapPromise: Promise<AmapNamespace> | null = null;

export const loadAmap = (apiKey: string): Promise<AmapNamespace> => {
  const normalizedKey = apiKey.trim();
  if (!normalizedKey) {
    return Promise.reject(new Error("Missing VITE_AMAP_JS_API_KEY configuration."));
  }

  if (window.AMap) {
    return Promise.resolve(window.AMap);
  }

  if (amapPromise) {
    return amapPromise;
  }

  amapPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    const params = new URLSearchParams({
      v: "2.0",
      key: normalizedKey,
      plugin: "AMap.Scale,AMap.ToolBar",
    });
    script.src = `https://webapi.amap.com/maps?${params.toString()}`;
    script.async = true;
    script.onload = () => {
      if (window.AMap) {
        resolve(window.AMap);
        return;
      }
      reject(new Error("AMap JS API loaded without window.AMap."));
    };
    script.onerror = () => reject(new Error("Failed to load AMap JS API."));
    document.head.appendChild(script);
  });

  return amapPromise;
};
