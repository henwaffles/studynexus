import { test, expect } from '@playwright/test';

test('loads login page', async ({ page }) => {
  await page.goto('/login');
  await expect(page).toHaveTitle(/StudyNexus/i);
  await expect(page.getByRole('heading', { name: /welcome back/i })).toBeVisible();
  await expect(page.getByRole('button', { name: /^log in$/i })).toBeVisible();
});
