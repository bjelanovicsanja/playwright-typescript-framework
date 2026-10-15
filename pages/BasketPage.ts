import { Locator, Page } from "@playwright/test";


export class BasketPage {
    readonly heading: Locator;

    constructor(private readonly page: Page) {
        this.heading = page.getByRole('heading', { name: 'Your Basket' });
    }

    async goto() {
        await this.page.goto('/#/basket');
    }

    basketItem(productName: string): Locator {
        return this.page.getByRole('row').filter({ hasText: productName });
    }

    async removeItem(productName: string) {
        await this.basketItem(productName).locator('button:has(.fa-trash-alt)').click();
    }

}