import { expect, test } from "../../fixtures/test";
import { createNewUser } from "../../test-data/users";


test.describe('Registration', () => {
    test.beforeEach(async ({ registerPage }) => {
        await registerPage.goto();
    });

    test('user can register with valid data', async ({ registerPage, page }) => {
        const user = createNewUser();

        await registerPage.register(user);
        await expect(registerPage.successMessage).toBeVisible();
        await expect(page).toHaveURL(/#\/login/);
    });

    test('newly registered user can log in', async ({ registerPage, page, loginPage }) => {
        const user = createNewUser();

        await registerPage.register(user);
        await loginPage.login(user.email, user.password);

        await expect(page).toHaveURL(/#\/search/);
    });

    test('user cannot register when passwords do not match', async ({ registerPage }) => {
        const user = { ...createNewUser(), repeatPassword: 'Different123!' };

        await registerPage.fillForm(user);
        await registerPage.repeatPasswordInput.blur();

        await expect(registerPage.passwordsNotMatchingError).toBeVisible();
        await expect(registerPage.registerButton).toBeDisabled();
    });

});