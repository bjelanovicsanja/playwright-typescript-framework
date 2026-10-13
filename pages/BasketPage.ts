import { Locator, Page } from "@playwright/test";


export class BasketPage {
    readonly heading: Locator;

    constructor(private readonly page: Page) {
        this.heading = page.getByRole('heading', { name: 'Your Basket' });
    }

    async goto() {
        await this.page.goto('/#/basket');
    }

}