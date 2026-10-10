import { test as base, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { RegisterPage } from '../pages/RegisterPage';

type Pages = {
    loginPage: LoginPage;
    registerPage: RegisterPage;
};

export const test = base.extend<Pages>({
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

    registerPage: async({page}, use) => {
        await use(new RegisterPage(page));
    },
    
});

export { expect };