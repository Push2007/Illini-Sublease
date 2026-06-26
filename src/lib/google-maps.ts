const SCRIPT_ATTR = "data-google-maps";

let loadPromise: Promise<void> | null = null;

/** Champaign–Urbana area bias (does not restrict results). */
export const CHAMPAIGN_URBANA_BIAS: google.maps.LatLngBoundsLiteral = {
  west: -88.35,
  north: 40.2,
  east: -88.15,
  south: 40.05,
};

function pollForImportLibrary(timeoutMs = 20_000): Promise<void> {
  return new Promise((resolve, reject) => {
    const started = Date.now();
    const tick = () => {
      if (window.google?.maps?.importLibrary) {
        resolve();
        return;
      }
      if (Date.now() - started > timeoutMs) {
        reject(
          new Error(
            "Google Maps did not initialize. Check your API key, billing, and HTTP referrer restrictions for http://localhost:3000/*."
          )
        );
        return;
      }
      window.setTimeout(tick, 50);
    };
    tick();
  });
}

/** Inject Google's official bootstrap loader (required for importLibrary). */
function injectGoogleMapsBootstrap(key: string): Promise<void> {
  if (window.google?.maps?.importLibrary) return Promise.resolve();

  const existing = document.querySelector<HTMLScriptElement>(`script[${SCRIPT_ATTR}]`);
  if (existing) return pollForImportLibrary();

  return new Promise((resolve, reject) => {
    const inline = document.createElement("script");
    inline.setAttribute(SCRIPT_ATTR, "true");
    const config = JSON.stringify({ key, v: "weekly" });
    inline.textContent = `(g=>{var h,a,k,p="The Google Maps JavaScript API",c="google",l="importLibrary",q="__ib__",m=document,b=window;b=b[c]||(b[c]={});var d=b.maps||(b.maps={}),r=new Set,e=new URLSearchParams,u=()=>h||(h=new Promise(async(f,n)=>{await (a=m.createElement("script"));e.set("libraries",[...r]+"");for(k in g)e.set(k.replace(/[A-Z]/g,t=>"_"+t[0].toLowerCase()),g[k]);e.set("callback",c+".maps."+q);a.src=\`https://maps.\${c}apis.com/maps/api/js?\`+e;d[q]=f;a.onerror=()=>n(Error(p+" could not load."));a.nonce=m.querySelector("script[nonce]")?.nonce||"";m.head.append(a)}));d[l]?console.warn(p+" only loads once. Ignoring:",g):d[l]=(f,...n)=>r.add(f)&&u().then(()=>d[l](f,...n))})(${config});`;
    inline.onerror = () =>
      reject(new Error("Failed to inject Google Maps bootstrap (blocked by CSP or network)."));
    document.head.appendChild(inline);
    pollForImportLibrary().then(resolve).catch(reject);
  });
}

/** Load Maps JS API + Places library (New) via importLibrary. */
export function loadGoogleMapsPlaces(): Promise<void> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Google Maps can only load in the browser."));
  }

  const key = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY?.trim();
  if (!key) {
    return Promise.reject(new Error("NEXT_PUBLIC_GOOGLE_MAPS_API_KEY is not set."));
  }

  if (loadPromise) return loadPromise;

  loadPromise = (async () => {
    try {
      await injectGoogleMapsBootstrap(key);
      const places = await window.google!.maps.importLibrary("places");
      if (!("PlaceAutocompleteElement" in places)) {
        throw new Error(
          "PlaceAutocompleteElement unavailable — enable Places API (New) and Maps JavaScript API on the same Google Cloud project as your API key."
        );
      }
    } catch (err) {
      loadPromise = null;
      throw err instanceof Error ? err : new Error(String(err));
    }
  })();

  return loadPromise;
}

/** Read lat/lng from Google Place.location (object props or LatLng methods). */
export function parsePlaceLocation(loc: unknown): { lat: number; lng: number } | null {
  if (loc == null || typeof loc !== "object") return null;
  const o = loc as Record<string, unknown>;

  let lat: number | null = null;
  let lng: number | null = null;

  if (typeof o.lat === "function") lat = (o.lat as () => number)();
  else if (typeof o.lat === "number") lat = o.lat;

  if (typeof o.lng === "function") lng = (o.lng as () => number)();
  else if (typeof o.lng === "number") lng = o.lng;

  if ((lat == null || lng == null) && "latitude" in o && "longitude" in o) {
    lat = Number(o.latitude);
    lng = Number(o.longitude);
  }

  if (lat == null || lng == null || !Number.isFinite(lat) || !Number.isFinite(lng)) {
    return null;
  }
  return { lat, lng };
}

export function isGoogleMapsConfigured(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY?.trim());
}
