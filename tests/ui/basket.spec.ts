import { expect, test } from "../../fixtures/test";
import { products } from "../../test-data/products";


test.describe('Basket', () => {
    test('logged-in user sees their own basket', async ({ loggedInUser, basketPage }) => {
        await basketPage.goto();

        await expect(basketPage.heading).toContainText(loggedInUser.email);
    });

    test('user can add a product to the basket', async ({ loggedInUser, productListPage, basketPage }) => {
        await productListPage.goto();
        await productListPage.addToBasket(products.appleJuice.name);
        await expect(productListPage.addedToBasketMessage(products.appleJuice.name)).toBeVisible();

        await basketPage.goto();

        await expect(basketPage.basketItem(products.appleJuice.name)).toBeVisible();
    });

    test('user can remove a product from the basket', async ({ loggedInUser, basketApi, basketPage }) => {
        await basketApi.addItem(loggedInUser.token, loggedInUser.bid, products.appleJuice.id);

        await basketPage.goto();
        await expect(basketPage.basketItem(products.appleJuice.name)).toBeVisible();

        await basketPage.removeItem(products.appleJuice.name);

        await expect(basketPage.basketItem(products.appleJuice.name)).toBeHidden();
    });

});