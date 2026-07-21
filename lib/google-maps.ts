export type GoogleMap = {
  fitBounds: (bounds: GoogleLatLngBounds, padding?: number) => void
  setCenter: (position: { lat: number; lng: number }) => void
  setZoom: (zoom: number) => void
}

export type GoogleLatLngBounds = {
  extend: (position: { lat: number; lng: number }) => void
}

export type AdvancedMarker = {
  addListener: (event: string, callback: () => void) => void
}

export type GoogleMapsApi = {
  maps: {
    Map: new (element: HTMLElement, options: Record<string, unknown>) => GoogleMap
    LatLngBounds: new () => GoogleLatLngBounds
    Polyline: new (options: Record<string, unknown>) => { setMap: (map: GoogleMap | null) => void }
    importLibrary: (library: string) => Promise<unknown>
    marker: {
      AdvancedMarkerElement: new (options: Record<string, unknown>) => AdvancedMarker
    }
  }
}

declare global {
  interface Window {
    google?: GoogleMapsApi
  }
}

let googleMapsPromise: Promise<GoogleMapsApi> | null = null

export function loadGoogleMaps(apiKey: string) {
  if (window.google) return Promise.resolve(window.google)
  if (googleMapsPromise) return googleMapsPromise

  googleMapsPromise = new Promise<GoogleMapsApi>((resolve, reject) => {
    const existingScript = document.querySelector<HTMLScriptElement>('script[data-google-maps-loader="true"]')

    if (existingScript) {
      existingScript.addEventListener("load", () => window.google ? resolve(window.google) : reject(new Error("Google Maps did not initialize")), { once: true })
      existingScript.addEventListener("error", () => reject(new Error("Unable to load Google Maps")), { once: true })
      return
    }

    const script = document.createElement("script")
    script.dataset.googleMapsLoader = "true"
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(apiKey)}&libraries=marker&v=weekly`
    script.async = true
    script.onload = () => window.google ? resolve(window.google) : reject(new Error("Google Maps did not initialize"))
    script.onerror = () => reject(new Error("Unable to load Google Maps"))
    document.head.appendChild(script)
  })

  return googleMapsPromise
}
