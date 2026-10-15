import { expect, test } from "../../fixtures/test";
import { products, searchData } from "../../test-data/products";

test.describe('Product Search', () => {
    test('exact product name returns only that product', async ({ productListPage }) => {
        await productListPage.goto();
        await productListPage.search(products.applePomace.name);

        await expect(productListPage.searchHeading(products.applePomace.name)).toBeVisible();
        await expect(productListPage.productCards).toHaveCount(1);
        await expect(productListPage.productCard(products.applePomace.name)).toContainText(`${products.applePomace.price}¤`);
    });

    test('partial term returns all products containing it', async ({ productListPage }) => {
        await productListPage.goto();
        await productListPage.search(searchData.appleTerm);

        await expect(productListPage.productCards).toHaveCount(3);
        await expect(productListPage.productCard(products.appleJuice.name)).toBeVisible();
        await expect(productListPage.productCard(products.applePomace.name)).toBeVisible();
        await expect(productListPage.productCard(products.pineappleJuice.name)).toBeVisible();
    });

    test('search is case-insensitive', async ({ productListPage }) => {
        await productListPage.goto();
        await productListPage.search(searchData.appleTermUpperCase);

        await expect(productListPage.productCards).toHaveCount(3);
        await expect(productListPage.productCard(products.appleJuice.name)).toBeVisible();
        await expect(productListPage.productCard(products.applePomace.name)).toBeVisible();
        await expect(productListPage.productCard(products.pineappleJuice.name)).toBeVisible();
    });

    test('search also matches product descriptions', async ({ productListPage }) => {
        await productListPage.goto();
        await productListPage.search(searchData.descriptionTerm);

        await expect(productListPage.productCards).toHaveCount(3);
        await expect(productListPage.productCard(products.lemonJuice.name)).toBeVisible();
        await expect(productListPage.productCard(products.quinceJuice.name)).toBeVisible();
        await expect(productListPage.productCard(products.seaBuckthornJuice.name)).toBeVisible();
    });

    test('unknown term shows no results message', async ({ productListPage }) => {
        await productListPage.goto();
        await productListPage.search(searchData.noMatchTerm);

        await expect(productListPage.searchHeading(searchData.noMatchTerm)).toBeVisible();
        await expect(productListPage.noResultsMessage).toBeVisible();
        await expect(productListPage.productCards).toHaveCount(0);
    });
});
