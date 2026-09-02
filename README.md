# Sales Management administrator portal

Next.js 16 portal for real field users, products, sales activity, attendance, live locations, route history, releases, and organization settings.

All operational screens read and write the Express/MongoDB API. Browser code never receives the administrator bearer token: login stores it in a Secure, HttpOnly, SameSite=Lax cookie and same-origin /portal-api route handlers proxy authenticated requests to the backend.

## Configuration

Copy .env.example to .env.local:

    API_BASE_URL=https://sales-server.vercel.app/api
    NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=
    NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID=

API_BASE_URL is server-only. If the Express server is deployed on another hostname, update this value. Google Maps is optional: coordinates and route data remain available without it.

## Run and verify

    npm install
    npm run dev
    npm run lint
    npm run build

Open http://localhost:3000. The public APK page is /download. APK binaries and product images must be uploaded to durable object storage first; the portal persists their HTTPS URLs and release metadata.

The portal connects server-to-server to https://sales-server.vercel.app/api. Set API_BASE_URL to the same value in the Vercel portal project's Production environment and redeploy after changing it.
