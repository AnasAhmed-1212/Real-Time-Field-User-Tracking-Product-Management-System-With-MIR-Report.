# Sales Management administrator portal

Next.js 16 portal for real field users, products, sales activity, attendance, live locations, route history, releases, and organization settings.

All operational screens read and write the Express/MongoDB API. Browser code never receives the administrator bearer token: login stores it in a Secure, HttpOnly, SameSite=Lax cookie and same-origin /portal-api route handlers proxy authenticated requests to the backend.

## Configuration

Copy .env.example to .env.local:

    API_BASE_URL=http://localhost:5000/api
    NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=
    NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID=

API_BASE_URL is server-only. Use `http://localhost:5000/api` locally and `https://YOUR_API.vercel.app/api` in the portal's Vercel Production environment. Always include the `http://` or `https://` protocol and `/api`, then redeploy the portal after changing it. The application also normalizes a missing protocol and adds `/api` when only a hostname is supplied. Google Maps is optional: coordinates and route data remain available without it.

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
