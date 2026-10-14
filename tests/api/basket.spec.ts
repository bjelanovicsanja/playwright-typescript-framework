import { expect, test } from "../../fixtures/test";
import { products } from "../../test-data/products";


test.describe('Basket API', () => {
    test('logged-in user can add a product to their basket', async ({ apiUser, basketApi }) => {
        const response = await basketApi.addItem(apiUser.token, apiUser.bid, products.appleJuice.id);

        expect(response.status()).toBe(200);
    });

    test('adding a product without authentication is rejected', async ({ apiUser, basketApi }) => {
        const response = await basketApi.addItem('', apiUser.bid, products.appleJuice.id);

        expect(response.status()).toBe(401);
    });

    test('adding more than the allowed quantity is rejected', async ({ apiUser, basketApi }) => {
        const response = await basketApi.addItem(apiUser.token, apiUser.bid, products.appleJuice.id, 6);

        expect(response.status()).toBe(400);
    });
});