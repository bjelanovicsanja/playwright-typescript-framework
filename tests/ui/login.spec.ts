import { expect, test } from "../../fixtures/test";
import { LoginPage } from "../../pages/LoginPage";

import { users } from "../../test-data/users";


test.describe('Login', () => {
    let loginPage: LoginPage;

    test.beforeEach(async ({ page }) => {
        loginPage = new LoginPage(page);
        await loginPage.goto();
    });

    test('user can log in with valid credentials', async ({ page }) => {
        await loginPage.login(users.admin.email, users.admin.password);
        await expect(page).toHaveURL(/#\/search/);
    });

    test('user sees error message with invalid credentials', async () => {
        await loginPage.login(users.invalid.email, users.invalid.password);
        await expect(loginPage.errorMessage).toBeVisible();
    });
});