import { Locator, Page } from "@playwright/test";
import { Address, Card } from "../test-data/checkout";


export class CheckoutPage {
    readonly addAddressButton: Locator;
    readonly continueToDeliveryButton: Locator;
    readonly continueToPaymentButton: Locator;
    readonly continueToReviewButton: Locator;
    readonly countryInput: Locator;
    readonly nameInput: Locator;
    readonly mobileNumberInput: Locator;
    readonly zipCodeInput: Locator;
    readonly addressInput: Locator;
    readonly cityInput: Locator;
    readonly stateInput: Locator;
    readonly submitButton: Locator;
    readonly addCardAccordion: Locator;
    readonly cardNameInput: Locator;
    readonly cardNumberInput: Locator;
    readonly expiryMonthSelect: Locator;
    readonly expiryYearSelect: Locator;
    readonly placeOrderButton: Locator;
    readonly confirmationHeading: Locator;

    constructor(private readonly page: Page) {
        this.addAddressButton = page.getByRole('button', { name: 'Add a new address' });
        this.continueToDeliveryButton = page.getByRole('button', { name: 'Proceed to payment selection' });
        this.continueToPaymentButton = page.getByRole('button', { name: 'Proceed to delivery method selection' });
        this.continueToReviewButton = page.getByRole('button', { name: 'Proceed to review' });
        this.countryInput = page.getByRole('textbox', { name: 'Country' });
        this.nameInput = page.getByRole('textbox', { name: 'Name' });
        this.mobileNumberInput = page.getByRole('spinbutton', { name: 'Mobile Number' });
        this.zipCodeInput = page.getByRole('textbox', { name: 'ZIP Code' });
        this.addressInput = page.getByRole('textbox', { name: 'Address' });
        this.cityInput = page.getByRole('textbox', { name: 'City' });
        this.stateInput = page.getByRole('textbox', { name: 'State' });
        this.submitButton = page.getByRole('button', { name: 'Submit' });
        this.addCardAccordion = page.getByRole('button', { name: 'Add new card' });
        this.cardNameInput = page.getByRole('textbox', { name: 'Name' });
        this.cardNumberInput = page.getByRole('spinbutton', { name: 'Card Number' });
        this.expiryMonthSelect = page.getByRole('combobox', { name: 'Expiry Month' });
        this.expiryYearSelect = page.getByRole('combobox', { name: 'Expiry Year' });
        this.placeOrderButton = page.getByRole('button', { name: 'Complete your purchase' });
        this.confirmationHeading = page.getByRole('heading', { name: 'Thank you for your purchase!' });
    }

    addressRow(name: string): Locator {
        return this.page.getByRole('row').filter({ hasText: name });
    }

    deliveryRow(name: string): Locator {
        return this.page.getByRole('row').filter({ hasText: name });
    }

    cardRow(maskedNumber: string): Locator {
        return this.page.getByRole('row').filter({ hasText: maskedNumber });
    }

    summaryRow(label: string): Locator {
        return this.page.getByRole('row').filter({ has: this.page.getByRole('cell', { name: label, exact: true }) });
    }

    async addNewAddress(address: Address) {
        await this.addAddressButton.click();
        await this.countryInput.fill(address.country);
        await this.nameInput.fill(address.name);
        await this.mobileNumberInput.fill(String(address.mobileNumber));
        await this.zipCodeInput.fill(address.zipCode);
        await this.addressInput.fill(address.address);
        await this.cityInput.fill(address.city);
        await this.stateInput.fill(address.state);
        await this.submitButton.click();
    }

    async selectAddress(name: string) {
        await this.addressRow(name).getByRole('radio').check({ force: true });
    }

    async continueToDelivery() {
        await this.continueToDeliveryButton.click();
    }

    async selectDelivery(name: string) {
        await this.deliveryRow(name).getByRole('radio').check({ force: true });
    }

    async continueToPayment() {
        await this.continueToPaymentButton.click();
    }

    async addNewCard(card: Card) {
        await this.addCardAccordion.click();
        await this.cardNameInput.fill(card.name);
        await this.cardNumberInput.fill(String(card.number));
        await this.expiryMonthSelect.selectOption(String(card.expiryMonth));
        await this.expiryYearSelect.selectOption(String(card.expiryYear));
        await this.submitButton.click();
    }

    async selectCard(maskedNumber: string) {
        await this.cardRow(maskedNumber).getByRole('radio').check({ force: true });
    }

    async continueToReview() {
        await this.continueToReviewButton.click();
    }

    async placeOrder() {
        await this.placeOrderButton.click();
    }

    async goToOrderSummary(addressName: string, deliveryName: string, maskedCardNumber: string) {
        await this.selectAddress(addressName);
        await this.continueToDelivery();
        await this.selectDelivery(deliveryName);
        await this.continueToPayment();
        await this.selectCard(maskedCardNumber);
        await this.continueToReview();
    }

    async itemsPrice(): Promise<number> {
        return this.readPrice(this.summaryRow('Items'));
    }

    async deliveryPrice(): Promise<number> {
        return this.readPrice(this.summaryRow('Delivery'));
    }

    async totalPrice(): Promise<number> {
        return this.readPrice(this.summaryRow('Total Price'));
    }

    private async readPrice(row: Locator): Promise<number> {
        const text = await row.getByRole('cell').last().innerText();
        return parseFloat(text.replace(/[^\d.]/g, ''));
    }
}
