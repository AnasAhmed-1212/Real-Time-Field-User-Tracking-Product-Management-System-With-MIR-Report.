import { expect, test, type Page } from '@playwright/test'

test.beforeEach(async ({ context, request }) => {
  await request.post('http://127.0.0.1:4319/__test/reset')
  await context.addCookies([{ name: 'sales_admin_session_v2', value: 'test-session', url: 'http://127.0.0.1:4318' }])
})

async function submit(page: Page, label: string, path: string, method: string, status = 200) {
  const pending = page.waitForResponse((response) => response.url().endsWith(`/portal-api/admin/${path}`) && response.request().method() === method)
  await page.getByRole('button', { name: label, exact: true }).click()
  const response = await pending
  expect(response.status()).toBe(status)
  expect(response.headers()['x-request-id']).toBe('crud-test')
  return response
}

async function fillUser(page: Page) {
  await page.getByLabel('name', { exact: true }).fill('Test Representative')
  await page.getByLabel('employee Code', { exact: true }).fill('EMP-TEST')
  await page.getByLabel('email', { exact: true }).fill('field@example.com')
  await page.getByLabel('territory', { exact: true }).fill('Karachi East')
  await page.getByLabel('password', { exact: true }).fill('Temporary123!')
}

test('field-user validation, create, read, update, status, password reset and delete', async ({ page }) => {
  await page.goto('/field-users')
  await page.getByRole('button', { name: 'Add user', exact: true }).click()
  await fillUser(page)
  const writes: string[] = []
  page.on('request', (request) => { if (request.method() === 'POST') writes.push(request.url()) })
  await page.getByRole('button', { name: 'Create user', exact: true }).click()
  await expect(page.getByRole('alert').filter({ hasText: 'Unable to save field user' })).toContainText(/phone:/i)
  expect(writes).toHaveLength(0)
  await page.getByLabel('phone', { exact: true }).fill('+92 300 0000000')
  const created = await submit(page, 'Create user', 'field-users', 'POST', 201)
  expect(created.request().postDataJSON()).toMatchObject({ name: 'Test Representative', phone: '+92 300 0000000' })
  await expect(page.getByRole('cell', { name: 'EMP-TEST', exact: true })).toBeVisible()
  await page.reload()
  await page.getByRole('button', { name: 'Edit', exact: true }).click()
  await page.getByLabel('name', { exact: true }).fill('Updated Representative')
  const updated = await submit(page, 'Save changes', 'field-users/1', 'PATCH')
  expect(updated.request().postDataJSON()).not.toHaveProperty('password')
  await expect(page.getByRole('cell').filter({ hasText: 'Updated Representative' })).toBeVisible()
  await submit(page, 'Disable', 'field-users/1/status', 'PATCH')
  await submit(page, 'Activate', 'field-users/1/status', 'PATCH')
  page.on('dialog', async (dialog) => { await dialog.accept(dialog.type() === 'prompt' ? 'NewTemporary123!' : undefined) })
  await submit(page, 'Reset password', 'field-users/1/reset-password', 'POST')
  await submit(page, 'Delete', 'field-users/1', 'DELETE', 204)
  await expect(page.getByText('No field users have been created.')).toBeVisible()
  await page.reload()
  await expect(page.getByText('No field users have been created.')).toBeVisible()
})

test('product create, update, status and delete use the API', async ({ page }) => {
  await page.goto('/products')
  await page.getByRole('button', { name: 'Add product', exact: true }).click()
  for (const [label, value] of Object.entries({ name: 'Test Product', code: 'TEST-1', category: 'Test', description: 'Test description', price: '123.45' })) {
    await page.getByLabel(label, { exact: true }).fill(value)
  }
  const created = await submit(page, 'Create product', 'products', 'POST', 201)
  expect(created.request().postDataJSON().price).toBe(123.45)
  await page.getByRole('button', { name: 'Edit', exact: true }).click()
  await page.getByLabel('name', { exact: true }).fill('Updated Product')
  await submit(page, 'Save changes', 'products/1', 'PATCH')
  await page.reload()
  await expect(page.getByText('Updated Product', { exact: true })).toBeVisible()
  await submit(page, 'Deactivate', 'products/1', 'PATCH')
  await submit(page, 'Activate', 'products/1', 'PATCH')
  page.once('dialog', (dialog) => dialog.accept())
  await submit(page, 'Delete', 'products/1', 'DELETE', 204)
  await expect(page.getByText('No products have been created.')).toBeVisible()
})

test('release, profile and settings buttons submit their forms', async ({ page }) => {
  await page.goto('/apk-releases')
  await page.getByRole('button', { name: 'New release', exact: true }).click()
  for (const [label, value] of Object.entries({ version: '1.0.0', 'version Code': '1', 'minimum Android': '9', 'release Notes': 'Test release', 'file Url': 'https://example.com/app.apk' })) {
    await page.getByLabel(label, { exact: true }).fill(value)
  }
  await submit(page, 'Create release', 'releases', 'POST', 201)
  await submit(page, 'Activate', 'releases/1/activate', 'PATCH')
  await page.goto('/profile')
  await expect(page.getByLabel('Display name', { exact: true })).toHaveValue('Test Administrator')
  await page.getByLabel('Display name', { exact: true }).fill('Updated Administrator')
  await submit(page, 'Save profile', 'profile', 'PATCH')
  await expect(page.getByText('Profile updated', { exact: true })).toBeVisible()
  await page.goto('/settings')
  await expect(page.getByLabel('Company Name', { exact: true })).toHaveValue('Test Company')
  await page.getByLabel('Company Name', { exact: true }).fill('Updated Company')
  await submit(page, 'Save changes', 'settings', 'PUT')
  await expect(page.getByText('Settings saved', { exact: true })).toBeVisible()
})

test('API failures stay visible and leave the form available for retry', async ({ page, request }) => {
  await page.goto('/field-users')
  await page.getByRole('button', { name: 'Add user', exact: true }).click()
  await fillUser(page)
  await page.getByLabel('phone', { exact: true }).fill('+92 300 0000000')
  for (const [status, message] of [[409, 'An email with this value already exists.'], [503, 'Database is temporarily unavailable.']] as const) {
    await request.post('http://127.0.0.1:4319/__test/failure', { data: { status, message } })
    await submit(page, 'Create user', 'field-users', 'POST', status)
    await expect(page.getByRole('alert').filter({ hasText: 'Unable to save field user' })).toContainText(`${message} Reference: crud-test`)
    await expect(page.getByRole('button', { name: 'Create user', exact: true })).toBeEnabled()
    await expect(page.getByLabel('name', { exact: true })).toHaveValue('Test Representative')
  }
  await request.post('http://127.0.0.1:4319/__test/reset')
  await submit(page, 'Create user', 'field-users', 'POST', 201)
  await expect(page.getByRole('alert').filter({ hasText: 'Unable to save field user' })).toHaveCount(0)
})
