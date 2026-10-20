import { Locator, Page } from "@playwright/test";


export class BasketPage {
    readonly heading: Locator;
    readonly checkoutButton: Locator;
    readonly totalPrice: Locator;

    constructor(private readonly page: Page) {
        this.heading = page.getByRole('heading', { name: 'Your Basket' });
        this.checkoutButton = page.getByRole('button', { name: 'Checkout' });
        this.totalPrice = page.getByText(/Total Price:/);
    }

    async goto() {
        await this.page.goto('/#/basket');
    }

    async checkout() {
        await this.checkoutButton.click();
    }

    basketItem(productName: string): Locator {
        return this.page.getByRole('row').filter({ hasText: productName });
    }

    async removeItem(productName: string) {
        await this.basketItem(productName).locator('button:has(.fa-trash-alt)').click();
    }

}