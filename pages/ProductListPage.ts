import { Locator, Page } from "@playwright/test";


export class ProductListPage {
    constructor(private readonly page: Page) { }

    async goto() {
        await this.page.goto('/#/search');
    }

    productCard(productName: string): Locator {
        return this.page.getByRole('article').filter({ hasText: productName });
    }

    addedToBasketMessage(productName: string): Locator {
        return this.page.getByText(`Placed ${productName} into basket.`);
    }

    async addToBasket(productName: string) {
        await this.productCard(productName).getByRole('button', { name: 'Add to Basket' }).click();
    }
}