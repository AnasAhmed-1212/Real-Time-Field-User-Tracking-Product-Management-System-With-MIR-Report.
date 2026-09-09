export type GoogleMap = {
  fitBounds: (bounds: GoogleLatLngBounds, padding?: number) => void
  setCenter: (position: { lat: number; lng: number }) => void
  setZoom: (zoom: number) => void
  getZoom: () => number | undefined
}

export type GoogleLatLngBounds = {
  extend: (position: { lat: number; lng: number }) => void
}

export type AdvancedMarker = {
  map: GoogleMap | null
  position: { lat: number; lng: number }
  title: string
  addListener: (event: string, callback: () => void) => { remove: () => void }
}

export type GooglePolyline = {
  setMap: (map: GoogleMap | null) => void
  setPath: (path: { lat: number; lng: number }[]) => void
}

export type GoogleMapsApi = {
  maps: {
    Map: new (element: HTMLElement, options: Record<string, unknown>) => GoogleMap
    LatLngBounds: new () => GoogleLatLngBounds
    Polyline: new (options: Record<string, unknown>) => GooglePolyline
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

type ReusableMap = { map: GoogleMap; google: GoogleMapsApi; element: HTMLDivElement }
// Keep one idle map in this browser document. Never steal a map from a mounted
// view, and never cache user markers or routes with the basemap.
let idleMap: ReusableMap | null = null

export function acquireGoogleMap(container: HTMLElement, google: GoogleMapsApi) {
  let instance = idleMap
  idleMap = null
  if (instance) {
    container.appendChild(instance.element)
  } else {
    const element = document.createElement("div")
    element.style.width = "100%"
    element.style.height = "100%"
    container.appendChild(element)
    const map = new google.maps.Map(element, {
      center: { lat: 20, lng: 0 }, zoom: 2, minZoom: 2, maxZoom: 21,
      mapId: process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID || "DEMO_MAP_ID",
      streetViewControl: false, mapTypeControl: false,
      cameraControl: false, zoomControl: false, fullscreenControl: true, scaleControl: true,
      gestureHandling: "greedy", keyboardShortcuts: true,
    })
    instance = { map, google, element }
  }
  const acquired = instance
  let released = false
  return {
    ...acquired,
    release() {
      if (released) return
      released = true
      acquired.element.remove()
      idleMap ??= acquired
    },
  }
}

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
