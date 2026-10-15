import { Locator, Page } from "@playwright/test";


export class ProductListPage {
    readonly openSearchButton: Locator;
    readonly searchInput: Locator;
    readonly productCards: Locator;
    readonly noResultsMessage: Locator;

    constructor(private readonly page: Page) {
        this.openSearchButton = page.getByRole('button', { name: 'Open search' });
        this.searchInput = page.getByRole('textbox');
        this.productCards = page.getByRole('article');
        this.noResultsMessage = page.getByText('No results found');
    }

    async goto() {
        await this.page.goto('/#/search');
    }

    async search(term: string) {
        if (!(await this.searchInput.isVisible())) {
            await this.openSearchButton.click();
        }
        await this.searchInput.fill(term);
        await this.searchInput.press('Enter');
    }

    searchHeading(term: string): Locator {
        return this.page.getByText(`Search Results - ${term}`);
    }

    productCard(productName: string): Locator {
        return this.productCards.filter({ has: this.page.getByRole('img', { name: productName, exact: true }) });
    }

    addedToBasketMessage(productName: string): Locator {
        return this.page.getByText(`Placed ${productName} into basket.`);
    }

    async addToBasket(productName: string) {
        await this.productCard(productName).getByRole('button', { name: 'Add to Basket' }).click();
    }
}
