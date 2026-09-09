import { expect, test, type Page } from '@playwright/test'
import { resolve } from 'node:path'

const location = (id: string, name: string, latitude: number, longitude: number) => ({
  user: { id, name, territory: 'Karachi', employeeCode: id },
  latitude, longitude, capturedAt: new Date().toISOString(), accuracy: 5,
  address: name + ' location', area: 'Karachi',
})

test.beforeEach(async ({ context, request, page }) => {
  await request.post('http://127.0.0.1:4319/__test/reset')
  await context.addCookies([{ name: 'sales_admin_session_v2', value: 'test-session', url: 'http://127.0.0.1:4318' }])
  await page.route('https://maps.googleapis.com/**', (route) => route.fulfill({ contentType: 'application/javascript', path: resolve('tests/fixtures/google-maps.js') }))
  await page.route('**/portal-api/admin/dashboard', (route) => route.fulfill({ json: {
    date: 'Today', stats: { totalUsers: 2, activeUsers: 2, onlineUsers: 2, offlineUsers: 0, checkedIn: 2, activeProducts: 0, activitiesToday: 0 },
    attendance: { working: 2, late: 0, checkedOut: 0, absent: 0 }, recentActivities: [],
  } }))
})

async function assertZoom(page: Page) {
  const map = page.locator('[data-test-map]')
  await expect(page.getByRole('button', { name: 'Zoom in', exact: true })).toBeEnabled()
  const initial = Number(await map.getAttribute('data-zoom'))
  await page.getByRole('button', { name: 'Zoom in', exact: true }).click()
  await expect(map).toHaveAttribute('data-zoom', String(initial + 1))
  await page.getByRole('button', { name: 'Zoom out', exact: true }).click()
  await expect(map).toHaveAttribute('data-zoom', String(initial))
  await expect(map).toHaveAttribute('data-gestures', 'greedy')
}

test('dashboard polling preserves zoom while updating markers', async ({ page }) => {
  let requests = 0
  await page.clock.install()
  await page.route('**/portal-api/admin/locations/live', (route) => route.fulfill({ json: [location('1', 'Test Representative', 24.8 + ++requests / 1000, 67.1)] }))
  await page.goto('/')
  const map = page.locator('[data-test-map]')
  await expect(map).toHaveAttribute('data-zoom', '14')
  await assertZoom(page)
  await page.getByRole('button', { name: 'Zoom in', exact: true }).click()
  const oldPosition = await page.getByTitle('Test Representative', { exact: true }).getAttribute('data-position')
  const markerId = await page.getByTitle('Test Representative', { exact: true }).getAttribute('data-marker-id')
  const center = await map.getAttribute('data-center')
  await page.clock.fastForward(16_000)
  await expect.poll(() => requests).toBeGreaterThan(1)
  await expect(page.getByTitle('Test Representative', { exact: true })).not.toHaveAttribute('data-position', oldPosition!)
  await expect(map).toHaveAttribute('data-test-map', '1')
  await expect(map).toHaveAttribute('data-zoom', '15')
  await expect(map).toHaveAttribute('data-center', center!)
  await expect(page.getByTitle('Test Representative', { exact: true })).toHaveAttribute('data-marker-id', markerId!)
  await expect(page.getByTitle('Test Representative', { exact: true })).toHaveCount(1)
  await page.getByRole('button', { name: 'Fit all locations' }).click()
  await expect(map).toHaveAttribute('data-zoom', '14')
})

test('live selection, refresh, search and fit controls preserve the map', async ({ page }) => {
  await page.route('**/portal-api/admin/locations/live', (route) => route.fulfill({ json: [location('1', 'First Representative', 24.8, 67.1), location('2', 'Second Representative', 24.9, 67.2)] }))
  await page.goto('/live-tracking')
  const map = page.locator('[data-test-map]')
  await expect(map).toHaveAttribute('data-fits', '1')
  await assertZoom(page)
  await page.getByRole('button', { name: /Second Representative.*Karachi/ }).click()
  await expect(map).toHaveAttribute('data-center', JSON.stringify({ lat: 24.9, lng: 67.2 }))
  await page.getByTitle('First Representative', { exact: true }).click()
  await expect(map).toHaveAttribute('data-center', JSON.stringify({ lat: 24.8, lng: 67.1 }))
  await page.getByRole('button', { name: 'Zoom in', exact: true }).click()
  const refreshed = page.waitForResponse('**/portal-api/admin/locations/live')
  await page.getByRole('button', { name: 'Refresh', exact: true }).click()
  await refreshed
  await expect(map).toHaveAttribute('data-zoom', '12')
  await expect(map).toHaveAttribute('data-test-map', '1')
  await expect(page.getByTitle('First Representative', { exact: true })).toHaveAttribute('data-marker-id', '1')
  await expect(page.getByTitle('Second Representative', { exact: true })).toHaveAttribute('data-marker-id', '2')
  await page.getByPlaceholder(/Search field users/).fill('nobody')
  await expect(map.locator('button')).toHaveCount(0)
  await expect(page.getByRole('button', { name: 'Fit all locations' })).toBeDisabled()
  await page.getByPlaceholder(/Search field users/).fill('')
  await expect(map.locator('button')).toHaveCount(2)
  await expect(map).toHaveAttribute('data-zoom', '12')
  await page.getByRole('button', { name: 'Fit all locations' }).click()
  await expect(map).toHaveAttribute('data-zoom', '11')
})

test('empty locations keep the map available and failed loading shows an error', async ({ page }) => {
  await page.route('**/portal-api/admin/locations/live', (route) => route.fulfill({ json: [] }))
  await page.goto('/')
  await expect(page.getByText('No mobile location has been received yet.')).toBeVisible()
  await assertZoom(page)
  await expect(page.getByRole('button', { name: 'Fit all locations' })).toBeDisabled()
  await page.route('https://maps.googleapis.com/**', (route) => route.abort())
  await page.reload()
  await expect(page.getByRole('region', { name: 'Live field locations map' }).getByRole('alert')).toContainText('The map could not load.')
  await expect(page.getByRole('button', { name: 'Zoom in', exact: true })).toBeDisabled()
})

test('route history supports zoom and a single point without duplicate end markers', async ({ page }) => {
  await page.route('**/portal-api/admin/field-users', (route) => route.fulfill({ json: [{ id: '1', name: 'Test Representative', employeeCode: 'EMP1' }] }))
  let rows = [{ id: 'p1', latitude: 24.8, longitude: 67.1, capturedAt: new Date().toISOString() }]
  await page.route('**/portal-api/admin/locations/history?*', (route) => route.fulfill({ json: rows }))
  await page.goto('/location-history')
  await page.getByRole('button', { name: 'Load history' }).click()
  const map = page.locator('[data-test-map]')
  await expect(map).toHaveAttribute('data-zoom', '14')
  await expect(map.locator('button')).toHaveCount(1)
  await expect(map).toContainText('Start / End')
  await assertZoom(page)
  rows = [...rows, { id: 'p2', latitude: 24.9, longitude: 67.2, capturedAt: new Date().toISOString() }]
  await page.getByRole('button', { name: 'Load history' }).click()
  await expect(map.locator('button')).toHaveCount(2)
  await expect(map.locator('[data-test-path]')).toHaveCount(1)
  await expect(map).toHaveAttribute('data-fits', '1')
  await expect(map).toHaveAttribute('data-test-map', '1')
  rows = [...rows, { id: 'p3', latitude: 25, longitude: 67.3, capturedAt: new Date().toISOString() }]
  await page.getByRole('button', { name: 'Load history' }).click()
  await expect(map.locator('[data-test-path]')).toHaveAttribute('data-test-path', JSON.stringify(rows.map((row) => ({ lat: row.latitude, lng: row.longitude }))))
  await expect(map.locator('[data-test-path]')).toHaveAttribute('data-path-id', '1')
  await expect(map.locator('button')).toHaveCount(2)
  await page.getByRole('button', { name: 'Zoom in', exact: true }).click()
  const response = page.waitForResponse('**/portal-api/admin/locations/history?*')
  await page.getByRole('button', { name: 'Load history' }).click()
  await response
  await expect(page.getByRole('button', { name: 'Load history' })).toBeEnabled()
  await expect(map).toHaveAttribute('data-zoom', '12')
})

test('portal navigation reuses the basemap and removes old overlays', async ({ page }) => {
  let scriptRequests = 0
  page.on('request', (request) => { if (request.url().startsWith('https://maps.googleapis.com/')) scriptRequests++ })
  await page.route('**/portal-api/admin/locations/live', (route) => route.fulfill({ json: [location('1', 'Test Representative', 24.8, 67.1)] }))
  await page.route('**/portal-api/admin/field-users', (route) => route.fulfill({ json: [{ id: '1', name: 'Test Representative', employeeCode: 'EMP1' }] }))
  await page.route('**/portal-api/admin/locations/history?*', (route) => route.fulfill({ json: [
    { id: 'p1', latitude: 24.8, longitude: 67.1, capturedAt: new Date().toISOString() },
    { id: 'p2', latitude: 24.9, longitude: 67.2, capturedAt: new Date().toISOString() },
  ] }))
  await page.goto('/')
  const map = page.locator('[data-test-map]')
  await expect(map).toHaveAttribute('data-test-map', '1')
  await page.getByRole('button', { name: 'Open map', exact: true }).click()
  await expect(page).toHaveURL(/\/live-tracking$/)
  await expect(map).toHaveAttribute('data-test-map', '1')
  await expect(map.locator('button')).toHaveCount(1)
  await page.locator('a[href="/location-history"]').first().click()
  await page.getByRole('button', { name: 'Load history' }).click()
  await expect(map.locator('[data-test-path]')).toHaveCount(1)
  await expect(map).toHaveAttribute('data-test-map', '1')
  await page.locator('a[href="/live-tracking"]').first().click()
  await expect(map).toHaveAttribute('data-test-map', '1')
  await expect(map.locator('[data-test-path]')).toHaveCount(0)
  await expect(map.locator('button')).toHaveCount(1)
  await assertZoom(page)
  expect(scriptRequests).toBe(1)
})

test('refresh errors retain markers and recovery updates status in place', async ({ page }) => {
  let fail = false
  let rows = [location('1', 'Test Representative', 24.8, 67.1)]
  await page.route('**/portal-api/admin/locations/live', (route) => fail
    ? route.fulfill({ status: 503, json: { message: 'Updates unavailable' } })
    : route.fulfill({ json: rows }))
  await page.goto('/live-tracking')
  const map = page.locator('[data-test-map]')
  const marker = page.getByTitle('Test Representative', { exact: true })
  await expect(marker).toHaveAttribute('data-marker-id', '1')
  fail = true
  await page.getByRole('button', { name: 'Refresh', exact: true }).click()
  await expect(page.getByRole('alert')).toBeVisible()
  await expect(marker).toHaveAttribute('data-marker-id', '1')
  fail = false
  rows = [{ ...location('1', 'Updated Representative', 24.9, 67.2), capturedAt: '2000-01-01T00:00:00Z' }]
  await page.getByRole('button', { name: 'Refresh', exact: true }).click()
  const updated = page.getByTitle('Updated Representative', { exact: true })
  await expect(updated).toHaveAttribute('data-marker-id', '1')
  await expect(updated).toHaveAttribute('data-position', JSON.stringify({ lat: 24.9, lng: 67.2 }))
  await expect(updated.locator('div')).toHaveClass(/bg-neutral-600/)
  await expect(updated).toHaveText('UR')
  rows = []
  await page.getByRole('button', { name: 'Refresh', exact: true }).click()
  await expect(map.locator('button')).toHaveCount(0)
  await expect(map).toHaveAttribute('data-test-map', '1')
})
