import { test as base, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { RegisterPage } from '../pages/RegisterPage';
import { UserApi } from '../api/UserApi';
import { createNewUser, NewUser } from '../test-data/users';
import { BasketPage } from '../pages/BasketPage';
import { ProductListPage } from '../pages/ProductListPage';

type Fixtures = {
    loginPage: LoginPage;
    registerPage: RegisterPage;
    userApi: UserApi;
    loggedInUser: NewUser;
    basketPage: BasketPage;
    productListPage: ProductListPage;
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

    loggedInUser: async ({ userApi, page, baseURL }, use) => {
        const user = createNewUser();
        await userApi.register(user.email, user.password);
        const response = await userApi.login(user.email, user.password);
        const { token, bid } = (await response.json()).authentication;

        await page.context().addCookies([{ name: 'token', value: token, url: baseURL! }]);
        await page.addInitScript(({ token, bid }) => {
            localStorage.setItem('token', token);
            sessionStorage.setItem('bid', String(bid));
        }, { token, bid });

        await use(user);
    },

    basketPage: async ({ page }, use) => {
        await use(new BasketPage(page));
    },

    productListPage: async ({ page }, use) => {
        await use(new ProductListPage(page));
    },

});

export { expect };