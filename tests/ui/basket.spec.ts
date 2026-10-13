import { expect, test } from "../../fixtures/test";


test.describe('Basket', () => {
    test('logged-in user sees their own basket', async ({ loggedInUser, basketPage }) => {
        await basketPage.goto();

        await expect(basketPage.heading).toContainText(loggedInUser.email);
    });
});