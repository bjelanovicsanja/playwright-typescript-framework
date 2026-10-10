import { test, expect } from '../../fixtures/test';


test('home page open without popups', async ({ page }) => {
    await page.goto('/');

    await expect(page).toHaveTitle(/OWASP Juice Shop/);
    await expect(page.getByText('Welcome to OWASP Juice Shop!')).toBeHidden();
    await expect(page.getByText('Me want it!')).toBeHidden();
})