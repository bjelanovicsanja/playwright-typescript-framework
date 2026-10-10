import { expect, test } from "../../fixtures/test";
import { users } from "../../test-data/users";


test.describe('Login', () => {
    test.beforeEach(async ({ loginPage }) => {
        await loginPage.goto();
    });

    test('user can log in with valid credentials', async ({ loginPage, page }) => {
        await loginPage.login(users.admin.email, users.admin.password);
        await expect(page).toHaveURL(/#\/search/);
    });

    test('user sees error message with invalid credentials', async ({ loginPage }) => {
        await loginPage.login(users.invalid.email, users.invalid.password);
        await expect(loginPage.errorMessage).toBeVisible();
    });
});