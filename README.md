# Sales Management administrator portal

Next.js 16 portal for real field users, products, sales activity, attendance, live locations, route history, releases, and organization settings.

All operational screens read and write the Express/MongoDB API. Browser code never receives the administrator bearer token: login stores it in a Secure, HttpOnly, SameSite=Lax cookie and same-origin /portal-api route handlers proxy authenticated requests to the backend.

## Configuration

Copy .env.example to .env.local:

    API_BASE_URL=http://localhost:5000/api
    NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=
    NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID=

API_BASE_URL is server-only. Use `http://localhost:5000/api` locally and `https://YOUR_API.vercel.app/api` in the portal's Vercel Production environment. Always include the `http://` or `https://` protocol and `/api`, then redeploy the portal after changing it. The application also normalizes a missing protocol and adds `/api` when only a hostname is supplied. Google Maps is optional: coordinates and route data remain available without it.

## Interactive maps

The dashboard preview, live tracking, and route history use Google Maps with zoom in/out, mouse-wheel and touch gestures, and a fit-all-locations control. Live positions refresh every 15 seconds without resetting the current zoom or pan. Selecting a field user in live tracking centers their marker. Green markers have a GPS update within the last 15 minutes; gray markers are stale.

The Maps script loads once per browser document. The portal retains one idle basemap for reuse during client-side navigation between map screens; user markers, click listeners, and route overlays are removed before reuse. Live updates change existing marker positions, labels, and status colors by user ID, adding or removing markers only when users enter or leave the results. Route geometry updates the existing polyline, and an unchanged route does not reset zoom. Clearing a search preserves the live map camera. A full browser reload or a new tab still creates a new map; this optimization does not cache Google tiles or eliminate all Maps usage charges.

Set `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` in the **web portal** environment with Maps JavaScript API enabled and the portal hostname allowed by the key's website restrictions. Configure `NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID` for your JavaScript map, or leave it empty to use the development demo map ID. Restart the development server or rebuild/redeploy after changing these public build-time values. A missing key displays a setup notice; failed loading displays an error instead of a decorative map.

## Run and verify

    npm install
    npm run dev
    npm run lint
    npm run build

Browser regression tests exercise form submission, CRUD requests, and API errors through the real portal proxy with a local API double (no production records are changed):

    npx playwright install chromium
    npm run test:e2e

To use an installed Edge browser in PowerShell, run `$env:PLAYWRIGHT_CHANNEL = 'msedge'` before `npm run test:e2e`. Tests build the portal and run it on ports 4318/4319 alongside the regular development server.

Open http://localhost:3000. The public APK page is /download. APK binaries and product images must be uploaded to durable object storage first; the portal persists their HTTPS URLs and release metadata.

The portal connects server-to-server to the Express API. Set `API_BASE_URL` in every Vercel environment that you use (Production, Preview, and Development as appropriate). The API and portal are separate Vercel projects and both must be redeployed when their code or environment values change.
