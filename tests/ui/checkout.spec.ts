import { expect, test } from "../../fixtures/test";
import { products } from "../../test-data/products";
import { address, card, deliveryMethods, orderConfirmation } from "../../test-data/checkout";


test.describe('Checkout', () => {
    test('user completes checkout and sees the order confirmation', async ({ loggedInUser, basketApi, basketPage, checkoutPage }) => {
        await basketApi.addItem(loggedInUser.token, loggedInUser.bid, products.appleJuice.id);

        await basketPage.goto();
        await basketPage.checkout();
        await checkoutPage.addNewAddress(address);
        await expect(checkoutPage.addressRow(address.name)).toBeVisible();

        await checkoutPage.selectAddress(address.name);
        await checkoutPage.continueToDelivery();
        await checkoutPage.selectDelivery(deliveryMethods.standard.name);
        await checkoutPage.continueToPayment();
        await checkoutPage.addNewCard(card);
        await expect(checkoutPage.cardRow(card.maskedNumber)).toBeVisible();

        await checkoutPage.selectCard(card.maskedNumber);
        await checkoutPage.continueToReview();
        await checkoutPage.placeOrder();

        await expect(checkoutPage.confirmationHeading).toHaveText(orderConfirmation.heading);
    });

    test('order summary total equals items price plus delivery price', async ({ loggedInUser, basketApi, addressApi, cardApi, basketPage, checkoutPage }) => {
        await basketApi.addItem(loggedInUser.token, loggedInUser.bid, products.appleJuice.id);
        await addressApi.create(loggedInUser.token, address);
        await cardApi.create(loggedInUser.token, card);

        await basketPage.goto();
        await basketPage.checkout();
        await checkoutPage.goToOrderSummary(address.name, deliveryMethods.fast.name, card.maskedNumber);

        await expect.poll(() => checkoutPage.itemsPrice()).toBeCloseTo(products.appleJuice.price, 2);
        await expect.poll(() => checkoutPage.deliveryPrice()).toBeCloseTo(deliveryMethods.fast.price, 2);
        await expect.poll(() => checkoutPage.totalPrice()).toBeCloseTo(products.appleJuice.price + deliveryMethods.fast.price, 2);
    });

    test('user cannot continue without selecting an address', async ({ loggedInUser, basketApi, addressApi, basketPage, checkoutPage }) => {
        await basketApi.addItem(loggedInUser.token, loggedInUser.bid, products.appleJuice.id);
        await addressApi.create(loggedInUser.token, address);

        await basketPage.goto();
        await basketPage.checkout();
        await expect(checkoutPage.addressRow(address.name)).toBeVisible();
        await expect(checkoutPage.continueToDeliveryButton).toBeDisabled();

        await checkoutPage.selectAddress(address.name);

        await expect(checkoutPage.continueToDeliveryButton).toBeEnabled();
    });

    test('basket is empty after the order is placed', async ({ loggedInUser, basketApi, addressApi, cardApi, basketPage, checkoutPage }) => {
        await basketApi.addItem(loggedInUser.token, loggedInUser.bid, products.appleJuice.id);
        await addressApi.create(loggedInUser.token, address);
        await cardApi.create(loggedInUser.token, card);

        await basketPage.goto();
        await basketPage.checkout();
        await checkoutPage.goToOrderSummary(address.name, deliveryMethods.standard.name, card.maskedNumber);
        await checkoutPage.placeOrder();
        await expect(checkoutPage.confirmationHeading).toBeVisible();

        await basketPage.goto();

        await expect(basketPage.basketItem(products.appleJuice.name)).toBeHidden();
        await expect(basketPage.totalPrice).toHaveText('Total Price: 0¤');
    });
});
