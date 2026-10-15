import { test } from '../fixtures/test';

test.describe('Seed', () => {
  test('seed', async ({ loggedInUser, page }) => {
    await page.goto('/');
  });
});
