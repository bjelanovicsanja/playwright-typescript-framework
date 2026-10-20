import { test as base, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { RegisterPage } from '../pages/RegisterPage';
import { UserApi } from '../api/UserApi';
import { createNewUser, LoggedInUser } from '../test-data/users';
import { BasketPage } from '../pages/BasketPage';
import { ProductListPage } from '../pages/ProductListPage';
import { BasketApi } from '../api/BasketApi';
import { CheckoutPage } from '../pages/CheckoutPage';
import { AddressApi } from '../api/AddressApi';
import { CardApi } from '../api/CardApi';

type Fixtures = {
    loginPage: LoginPage;
    registerPage: RegisterPage;
    basketPage: BasketPage;
    productListPage: ProductListPage;
    userApi: UserApi;
    apiUser: LoggedInUser;
    loggedInUser: LoggedInUser;
    basketApi: BasketApi;
    checkoutPage: CheckoutPage;
    addressApi: AddressApi;
    cardApi: CardApi;
};

export const test = base.extend<Fixtures>({
    context: async ({ context, baseURL }, use) => {
        await context.addCookies([
            { name: 'welcomebanner_status', value: 'dismiss', url: baseURL! },
            { name: 'cookieconsent_status', value: 'dismiss', url: baseURL! },
        ]);
        await use(context);
    },

    loginPage: async ({ page }, use) => {
        await use(new LoginPage(page));
    },

    registerPage: async ({ page }, use) => {
        await use(new RegisterPage(page));
    },

    userApi: async ({ request }, use) => {
        await use(new UserApi(request));
    },

    basketPage: async ({ page }, use) => {
        await use(new BasketPage(page));
    },

    productListPage: async ({ page }, use) => {
        await use(new ProductListPage(page));
    },

    apiUser: async ({ userApi }, use) => {
        const user = createNewUser();
        await userApi.register(user.email, user.password);
        const response = await userApi.login(user.email, user.password);
        const { token, bid } = (await response.json()).authentication;

        await use({ ...user, token, bid });
    },

    loggedInUser: async ({ apiUser, page, baseURL }, use) => {
        await page.context().addCookies([{
            name: 'token', value: apiUser.token, url: baseURL!
        }]);
        await page.addInitScript(({ token, bid }) => {
            localStorage.setItem('token', token);
            sessionStorage.setItem('bid', String(bid));
        }, { token: apiUser.token, bid: apiUser.bid });

        await use(apiUser);
    },

    basketApi: async ({ request }, use) => {
        await use(new BasketApi(request));
    },

    checkoutPage: async ({ page }, use) => {
        await use(new CheckoutPage(page));
    },

    addressApi: async ({ request }, use) => {
        await use(new AddressApi(request));
    },

    cardApi: async ({ request }, use) => {
        await use(new CardApi(request));
    },

});

export { expect };