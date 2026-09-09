// Deterministic Maps API double: no Google requests or production GPS records.
(() => {
  let mapCount = 0
  let markerCount = 0
  let pathCount = 0
  class Map {
    constructor(element, options) {
      this.element = element
      Object.assign(element.style, { display: 'flex', alignItems: 'center', justifyContent: 'center' })
      element.dataset.testMap = String(++mapCount)
      element.dataset.gestures = options.gestureHandling
      this.setZoom(options.zoom)
      this.setCenter(options.center)
    }
    setZoom(zoom) { this.zoom = zoom; this.element.dataset.zoom = String(zoom) }
    getZoom() { return this.zoom }
    setCenter(position) { this.element.dataset.center = JSON.stringify(position) }
    fitBounds(bounds) {
      this.element.dataset.bounds = JSON.stringify(bounds.points)
      this.element.dataset.fits = String(Number(this.element.dataset.fits || 0) + 1)
      this.setZoom(11)
    }
  }
  class LatLngBounds {
    points = []
    extend(point) { this.points.push(point) }
  }
  class AdvancedMarkerElement {
    constructor(options) {
      this.content = document.createElement('button')
      this.content.dataset.markerId = String(++markerCount)
      this.title = options.title
      this.position = options.position
      this.content.append(options.content)
      this.map = options.map
    }
    set title(title) { this.content.title = title }
    set position(position) { this.content.dataset.position = JSON.stringify(position) }
    set map(map) {
      this.content.remove()
      if (map) map.element.append(this.content)
    }
    addListener(event, callback) {
      this.content.addEventListener(event, callback)
      return { remove: () => this.content.removeEventListener(event, callback) }
    }
  }
  class Polyline {
    constructor(options) {
      this.element = document.createElement('div')
      this.element.dataset.pathId = String(++pathCount)
      this.setPath(options.path)
      this.setMap(options.map)
    }
    setPath(path) { this.element.dataset.testPath = JSON.stringify(path) }
    setMap(map) {
      this.element.remove()
      if (map) map.element.append(this.element)
    }
  }
  window.google = { maps: { Map, LatLngBounds, Polyline, marker: { AdvancedMarkerElement }, importLibrary: async () => ({}) } }
})()
