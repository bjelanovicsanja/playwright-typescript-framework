import { test as base, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { RegisterPage } from '../pages/RegisterPage';
import { UserApi } from '../api/UserApi';

type Fixtures = {
    loginPage: LoginPage;
    registerPage: RegisterPage;
    userApi: UserApi;
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

});

export { expect };